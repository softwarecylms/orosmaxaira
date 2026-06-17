'use server'

import type { HttpTypes } from '@medusajs/types'
import { redirect } from 'next/navigation'
import { sdk } from './client'
import { getCartId, removeCartId, setCartId } from './cookies'
import { getDefaultRegion } from './region'

const CART_FIELDS = [
  '*items',
  '*items.variant',
  '*items.variant.options',
  '*items.product',
  '+items.total',
  '+items.unit_price',
  '*region',
  '*region.countries',
  '*shipping_methods',
  '*shipping_address',
  '*billing_address',
  '*payment_collection',
  '*payment_collection.payment_sessions',
  '*promotions',
].join(',')

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/** Fetch the current cart (by cookie id) with totals + relations, or null. */
export async function retrieveCart(): Promise<HttpTypes.StoreCart | null> {
  const id = await getCartId()
  if (!id) return null

  return sdk.client
    .fetch<{ cart: HttpTypes.StoreCart }>(`/store/carts/${id}`, {
      method: 'GET',
      query: { fields: CART_FIELDS },
      cache: 'no-store',
    })
    .then((r) => r.cart)
    .catch(() => null)
}

async function getOrCreateCart(): Promise<HttpTypes.StoreCart> {
  const region = await getDefaultRegion()
  if (!region) throw new Error('No region configured in Medusa.')

  const existing = await retrieveCart()
  if (existing) {
    if (existing.region_id !== region.id) {
      const { cart } = await sdk.store.cart.update(existing.id, {
        region_id: region.id,
      })
      return cart
    }
    return existing
  }

  const { cart } = await sdk.store.cart.create({ region_id: region.id })
  await setCartId(cart.id)
  return cart
}

// ---------------------------------------------------------------------------
// Cart mutations
// ---------------------------------------------------------------------------

export async function addToCart(variantId: string, quantity = 1): Promise<void> {
  if (!variantId) throw new Error('Missing variant id.')
  const cart = await getOrCreateCart()
  await sdk.store.cart.createLineItem(cart.id, {
    variant_id: variantId,
    quantity,
  })}

export async function updateLineItem(
  lineId: string,
  quantity: number,
): Promise<void> {
  const id = await getCartId()
  if (!id) throw new Error('No cart found.')
  if (quantity < 1) {
    await sdk.store.cart.deleteLineItem(id, lineId)
  } else {
    await sdk.store.cart.updateLineItem(id, lineId, { quantity })
  }}

export async function removeLineItem(lineId: string): Promise<void> {
  const id = await getCartId()
  if (!id) throw new Error('No cart found.')
  await sdk.store.cart.deleteLineItem(id, lineId)}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export type CheckoutAddress = {
  email: string
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  company?: string
  postal_code: string
  city: string
  province?: string
  country_code: string
  phone?: string
}

/** Set the customer email + shipping/billing address on the cart. */
export async function setCheckoutAddress(
  data: CheckoutAddress,
): Promise<void> {
  const id = await getCartId()
  if (!id) throw new Error('No cart found.')

  const address = {
    first_name: data.first_name,
    last_name: data.last_name,
    address_1: data.address_1,
    address_2: data.address_2 ?? '',
    company: data.company ?? '',
    postal_code: data.postal_code,
    city: data.city,
    province: data.province ?? '',
    country_code: data.country_code,
    phone: data.phone ?? '',
  }

  await sdk.store.cart.update(id, {
    email: data.email,
    shipping_address: address,
    billing_address: address,
  })}

/** Shipping options available for the current cart. */
export async function listShippingOptions(): Promise<
  HttpTypes.StoreCartShippingOption[]
> {
  const id = await getCartId()
  if (!id) return []
  return sdk.client
    .fetch<{ shipping_options: HttpTypes.StoreCartShippingOption[] }>(
      '/store/shipping-options',
      { method: 'GET', query: { cart_id: id }, cache: 'no-store' },
    )
    .then((r) => r.shipping_options ?? [])
    .catch(() => [])
}

export async function setShippingMethod(optionId: string): Promise<void> {
  const id = await getCartId()
  if (!id) throw new Error('No cart found.')
  await sdk.store.cart.addShippingMethod(id, { option_id: optionId })}

/**
 * Initiate a payment session. This shop uses Medusa's default system payment
 * provider (no real gateway), which auto-authorizes on completion.
 */
export async function initiatePayment(): Promise<void> {
  const cart = await retrieveCart()
  if (!cart) throw new Error('No cart found.')

  const { payment_providers } = await sdk.client.fetch<{
    payment_providers: { id: string }[]
  }>('/store/payment-providers', {
    method: 'GET',
    query: { region_id: cart.region_id },
    cache: 'no-store',
  })

  const providerId = payment_providers?.[0]?.id
  if (!providerId) throw new Error('No payment provider available.')

  // Skip if an active session for this provider already exists.
  const existing = cart.payment_collection?.payment_sessions?.find(
    (s) => s.provider_id === providerId,
  )
  if (!existing) {
    await sdk.store.payment.initiatePaymentSession(cart, {
      provider_id: providerId,
    })
  }}

/** Complete the cart -> create the order, then redirect to the confirmation. */
export async function placeOrder(): Promise<void> {
  const id = await getCartId()
  if (!id) throw new Error('No cart found.')

  const res = await sdk.store.cart.complete(id)

  if (res.type === 'order') {
    await removeCartId()
    redirect(`/order/${res.order.id}`)
  }

  throw new Error(
    (res as { error?: { message?: string } }).error?.message ||
      'Could not place the order. Please review your details and try again.',
  )
}
