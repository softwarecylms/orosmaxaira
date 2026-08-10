'use server'

import { sdk } from './client'
import { getDefaultRegion } from './region'
import type { HttpTypes } from '@medusajs/types'

/**
 * Turn the (client-side) honey cart into a REAL Medusa order. The storefront
 * cart lives in localStorage for a snappy drawer UX; at checkout we build a
 * fresh Medusa cart from the line-item variant ids, apply the same shipping +
 * coupon the custom checkout showed, take a system payment, and complete it —
 * so the order lands in Medusa admin and inventory decrements.
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
}

export async function placeMedusaOrder(
  input: PlaceOrderInput,
): Promise<{ orderId: string } | { error: string }> {
  try {
    const region = await getDefaultRegion()
    if (!region) return { error: 'Δεν βρέθηκε διαθέσιμη περιοχή αποστολής.' }

    const items = input.items.filter((i) => i.variantId && i.quantity > 0)
    if (!items.length) return { error: 'Το καλάθι σας είναι άδειο ή μη έγκυρο.' }

    // 1. Fresh cart
    const { cart } = await sdk.store.cart.create({
      region_id: region.id,
      email: input.email,
    })
    const cartId = cart.id

    // 2. Line items
    for (const it of items) {
      await sdk.store.cart.createLineItem(cartId, {
        variant_id: it.variantId,
        quantity: it.quantity,
      })
    }

    // 3. Addresses + metadata
    await sdk.store.cart.update(cartId, {
      email: input.email,
      shipping_address: input.shipping,
      billing_address: input.billing,
      metadata: input.metadata ?? {},
    })

    // 4. Coupon (best-effort — an invalid code must not block the order)
    if (input.coupon) {
      try {
        await sdk.client.fetch(`/store/carts/${cartId}/promotions`, {
          method: 'POST',
          body: { promo_codes: [input.coupon] },
        })
      } catch {
        // ignore — the client already validated known demo codes
      }
    }

    // 5. Shipping method — book the exact option the custom checkout displayed
    const { shipping_options } = await sdk.client.fetch<{
      shipping_options: HttpTypes.StoreCartShippingOption[]
    }>('/store/shipping-options', {
      method: 'GET',
      query: { cart_id: cartId },
      cache: 'no-store',
    })
    const option =
      shipping_options.find((o) => o.name === input.shippingOptionName) ??
      shipping_options[0]
    if (!option) return { error: 'Δεν υπάρχει διαθέσιμος τρόπος αποστολής.' }
    await sdk.store.cart.addShippingMethod(cartId, { option_id: option.id })

    // 6. Payment (system default provider — auto-authorizes)
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
    // Pick the provider explicitly. Stay on the manual/system provider even after
    // Stripe is enabled on the region — the Stripe card flow (Elements +
    // confirmCardPayment before complete()) doesn't exist yet, so blindly taking
    // payment_providers[0] could hijack checkout with an unconfirmed Stripe session.
    // Switch this to 'pp_stripe_stripe' when the Stripe Elements flow lands (see STRIPE.md).
    const providerId =
      payment_providers.find((p) => p.id === 'pp_system_default')?.id ??
      payment_providers?.[0]?.id
    if (!providerId) return { error: 'Δεν υπάρχει διαθέσιμος τρόπος πληρωμής.' }
    await sdk.store.payment.initiatePaymentSession(fresh.cart, { provider_id: providerId })

    // 7. Complete → order
    const res = await sdk.store.cart.complete(cartId)
    if (res.type === 'order') return { orderId: res.order.id }

    return {
      error:
        (res as { error?: { message?: string } }).error?.message ||
        'Η ολοκλήρωση της παραγγελίας απέτυχε. Ελέγξτε τα στοιχεία σας και δοκιμάστε ξανά.',
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Παρουσιάστηκε σφάλμα στην παραγγελία.' }
  }
}
