'use server'

import { after } from 'next/server'
import { sdk } from './client'
import { getDefaultRegion } from './region'
import type { HttpTypes } from '@medusajs/types'
import { FREE_SHIPPING_OPTION_NAME, FREE_SHIPPING_THRESHOLD_EUR } from '../shipping'
import { pickProvider } from './payment-provider'
import { eurToCents, orderError, type OrderError } from './order-errors'
import { sendOrderEmails } from '../order-email'

/**
 * Turn the (client-side) honey cart into a REAL Medusa order. The storefront
 * cart lives in localStorage for a snappy drawer UX; at checkout we build a
 * fresh Medusa cart from the line-item variant ids, apply the same shipping +
 * coupon the custom checkout showed, take payment, and complete it — so the
 * order lands in Medusa admin and inventory decrements.
 *
 * Split in two so a card can be charged in between:
 *
 *   prepareMedusaOrder()  build + price the cart, open the payment session
 *   → (browser confirms the card against the returned client_secret)
 *   completeMedusaOrder() turn the paid cart into an order
 *
 * With no Stripe key configured the two run back to back inside
 * `placeMedusaOrder`, which is exactly what checkout did before.
 *
 * ORDERING MATTERS: the payment session must be the LAST thing done to the
 * cart. Medusa deletes (and Stripe cancels) existing payment sessions whenever
 * a cart write changes the total, so anything that touches items, addresses,
 * promotions or shipping after `initiatePaymentSession` invalidates the
 * client_secret the browser is about to confirm.
 */

export type PlaceOrderItem = { variantId: string; quantity: number }

export type PlaceOrderInput = {
  items: PlaceOrderItem[]
  email: string
  shipping: HttpTypes.StoreAddAddress
  billing: HttpTypes.StoreAddAddress
  /** exact Medusa shipping-option name to book (the client picks it from the
   *  delivery method + destination + free-shipping rules) */
  shippingOptionName: string
  coupon?: string | null
  /** ACS point, district, notes, VAT, payment method, delivery method — stored on the order */
  metadata?: Record<string, string>
  /** The total the checkout displayed, in cents. The server refuses to open a
   *  payment session if Medusa prices the cart differently — see step 7. */
  expectedTotalCents: number
  /** Reuse an existing cart instead of creating one, so a declined card can be
   *  retried without stacking up carts and PaymentIntents. */
  cartId?: string
  /** For the confirmation email. */
  locale?: string
}

export type PreparedOrder = {
  cartId: string
  /** Present only for Stripe — the browser confirms the card against this. */
  clientSecret?: string
  /** What Stripe will actually charge, in cents. Authoritative. */
  serverAmountCents: number
}

/** Shape of a Stripe payment session's `data` (the raw PaymentIntent). */
type StripeSessionData = { client_secret?: string; amount?: number }

/**
 * Build and price the cart, then open a payment session on it.
 *
 * Everything up to and including the shipping method is idempotent per cart, so
 * a retry with the same `cartId` re-applies the current address/coupon/shipping
 * and re-opens the session (which cancels the superseded PaymentIntent).
 */
export async function prepareMedusaOrder(
  input: PlaceOrderInput,
): Promise<PreparedOrder | { error: OrderError }> {
  try {
    const region = await getDefaultRegion()
    if (!region) return orderError('no_region')

    const items = input.items.filter((i) => i.variantId && i.quantity > 0)
    if (!items.length) return orderError('empty_cart')

    // 1-2. Cart + line items. Skipped entirely when retrying on an existing
    //      cart: its lines are already correct (the client forces a new cart
    //      whenever the items themselves change).
    let cartId = input.cartId
    if (!cartId) {
      const { cart } = await sdk.store.cart.create({
        region_id: region.id,
        email: input.email,
      })
      cartId = cart.id

      for (const it of items) {
        await sdk.store.cart.createLineItem(cartId, {
          variant_id: it.variantId,
          quantity: it.quantity,
        })
      }
    }

    // 3. Addresses + metadata
    await sdk.store.cart.update(cartId, {
      email: input.email,
      shipping_address: input.shipping,
      billing_address: input.billing,
      metadata: input.metadata ?? {},
    })

    // 4. Coupon (best-effort — a rejected code must not block the order).
    //    Medusa is the authority here, not the checkout: the promotion record
    //    carries its own minimum-order rule, so a code the client believed in
    //    simply produces no discount if the cart does not qualify. The total
    //    check in step 7 is what stops us charging more than we displayed.
    if (input.coupon) {
      try {
        await sdk.client.fetch(`/store/carts/${cartId}/promotions`, {
          method: 'POST',
          body: { promo_codes: [input.coupon] },
        })
      } catch {
        // ignore — an unknown or ineligible code just means no discount
      }
    }

    // 5. Free shipping is EARNED, never just requested. Re-check the rule against
    //    Medusa's own priced cart (the client is not trusted): the goods total
    //    after any discount must reach the threshold. `item_total` is exactly
    //    that — line items minus promotions, shipping excluded.
    if (input.shippingOptionName === FREE_SHIPPING_OPTION_NAME) {
      const { cart: priced } = await sdk.store.cart.retrieve(cartId, {
        fields: 'item_total,discount_total',
      })
      const goodsTotal = Number(priced?.item_total ?? 0)
      if (goodsTotal < FREE_SHIPPING_THRESHOLD_EUR) return orderError('free_shipping_lost')
    }

    // 6. Shipping method — book the exact option the custom checkout displayed
    const { shipping_options } = await sdk.client.fetch<{
      shipping_options: HttpTypes.StoreCartShippingOption[]
    }>('/store/shipping-options', {
      method: 'GET',
      query: { cart_id: cartId },
      cache: 'no-store',
    })
    const option =
      shipping_options.find((o) => o.name === input.shippingOptionName) ?? shipping_options[0]
    if (!option) return orderError('no_shipping')
    await sdk.store.cart.addShippingMethod(cartId, { option_id: option.id })

    // 7. The total the customer was shown must be the total we charge.
    //    Medusa prices the cart itself, so a coupon it declined (or any drift in
    //    shipping prices or tax) would otherwise reach the card as a larger
    //    amount than the checkout displayed. Checked BEFORE a PaymentIntent
    //    exists, so a mismatch costs the customer nothing.
    const { cart: finalCart } = await sdk.store.cart.retrieve(cartId, {
      fields: 'total,discount_total',
    })
    const serverTotalCents = eurToCents(finalCart?.total)
    if (serverTotalCents !== input.expectedTotalCents) {
      // A requested code that produced no discount is the likeliest cause, and
      // has a clearer remedy than "the total changed".
      const code =
        input.coupon && Number(finalCart?.discount_total ?? 0) === 0
          ? 'coupon_rejected'
          : 'total_mismatch'
      return orderError(code, { serverTotalCents })
    }

    // 8. Payment session — LAST cart write. See the ordering note at the top.
    const fresh = await sdk.store.cart.retrieve(cartId, {
      fields: '*payment_collection,*payment_collection.payment_sessions',
    })
    const { payment_providers } = await sdk.client.fetch<{
      payment_providers: { id: string }[]
    }>('/store/payment-providers', {
      method: 'GET',
      query: { region_id: region.id },
      cache: 'no-store',
    })
    const provider = pickProvider(payment_providers)
    if (!provider) return orderError('no_payment_provider')

    const session = await sdk.store.payment.initiatePaymentSession(fresh.cart, {
      provider_id: provider.id,
    })

    if (!provider.isStripe) return { cartId, serverAmountCents: serverTotalCents }

    // Stripe's session `data` is the raw PaymentIntent, so it carries both the
    // secret the browser needs and the amount Stripe will really charge.
    const data = session.payment_collection?.payment_sessions?.find(
      (s) => s.provider_id === provider.id,
    )?.data as StripeSessionData | undefined

    if (!data?.client_secret) return orderError('no_client_secret')

    return {
      cartId,
      clientSecret: data.client_secret,
      serverAmountCents: typeof data.amount === 'number' ? data.amount : serverTotalCents,
    }
  } catch (e) {
    // Log it: this is the branch that turns a real Medusa failure into a vague
    // sentence for the customer, so the detail has to land somewhere.
    console.error('[order] prepare failed', e)
    return orderError('unknown', { message: e instanceof Error ? e.message : undefined })
  }
}

/**
 * Complete a prepared (and, for card payments, already-confirmed) cart.
 *
 * Safe to call twice: Medusa's complete-cart workflow records the order id on
 * the cart and returns the same order rather than creating a second one, so a
 * retry after a network failure cannot double-charge.
 */
export async function completeMedusaOrder(
  cartId: string,
  locale = 'el',
): Promise<{ orderId: string } | { error: OrderError }> {
  try {
    const res = await sdk.store.cart.complete(cartId)
    if (res.type !== 'order') {
      return orderError('complete_failed', {
        message: (res as { error?: { message?: string } }).error?.message,
      })
    }

    // Confirmation email — after the response is flushed, so a slow or broken
    // mail server can never delay the redirect or fail an order that is already
    // paid for and placed.
    const order = res.order
    after(() => sendOrderEmails(order, locale))

    return { orderId: order.id }
  } catch (e) {
    console.error('[order] complete failed', { cartId, e })
    return orderError('unknown', { message: e instanceof Error ? e.message : undefined })
  }
}

/**
 * Prepare + complete in one call — the path used when Stripe is not configured
 * (the manual provider auto-authorizes, so there is nothing to confirm between
 * the two halves). Behaviour is unchanged from before the split.
 */
export async function placeMedusaOrder(
  input: PlaceOrderInput,
): Promise<{ orderId: string } | { error: OrderError }> {
  const prepared = await prepareMedusaOrder(input)
  if ('error' in prepared) return prepared
  return completeMedusaOrder(prepared.cartId, input.locale)
}
