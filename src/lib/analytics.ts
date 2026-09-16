/**
 * Shop events for Google Analytics, pushed into Tag Manager's data layer under
 * GA4's standard ecommerce names — so revenue, cart drop-off and best sellers
 * appear in the reports without a tag being wired up page by page.
 *
 * Pushing an event is not the same as sending it: with statistics refused in
 * the cookie banner, Tag Manager's tags store nothing on the visitor's device.
 */

/** Prices are euro cents everywhere in the shop; GA4 wants decimal euros. */
export const toEuros = (cents: number): number => Math.round(cents) / 100

export type ShopItem = {
  item_id: string
  item_name: string
  /** unit price in euros */
  price: number
  quantity?: number
  item_variant?: string
  item_category?: string
}

const CURRENCY = 'EUR'

const round = (value: number): number => Math.round(value * 100) / 100

const sumItems = (items: ShopItem[]): number =>
  round(items.reduce((total, i) => total + i.price * (i.quantity ?? 1), 0))

function push(event: string, ecommerce: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const w = window as Window & { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer ?? []
  // Clearing first stops the previous event's items from leaking into this one.
  w.dataLayer.push({ ecommerce: null })
  w.dataLayer.push({ event, ecommerce: { currency: CURRENCY, ...ecommerce } })
}

export function trackViewItem(item: ShopItem): void {
  push('view_item', { value: item.price, items: [item] })
}

export function trackAddToCart(items: ShopItem[]): void {
  push('add_to_cart', { value: sumItems(items), items })
}

export function trackRemoveFromCart(items: ShopItem[]): void {
  push('remove_from_cart', { value: sumItems(items), items })
}

export function trackViewCart(items: ShopItem[], subtotalCents: number): void {
  push('view_cart', { value: toEuros(subtotalCents), items })
}

export function trackBeginCheckout(items: ShopItem[], subtotalCents: number, coupon?: string): void {
  push('begin_checkout', { value: toEuros(subtotalCents), items, ...(coupon ? { coupon } : {}) })
}

export function trackPurchase(order: {
  id: string
  items: ShopItem[]
  totalCents: number
  shippingCents: number
  coupon?: string
}): void {
  push('purchase', {
    transaction_id: order.id,
    value: toEuros(order.totalCents),
    shipping: toEuros(order.shippingCents),
    items: order.items,
    ...(order.coupon ? { coupon: order.coupon } : {}),
  })
}
