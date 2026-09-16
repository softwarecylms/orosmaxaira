/**
 * Shop and booking events for Google Analytics, pushed into Tag Manager's data
 * layer under GA4's standard names — so revenue, cart drop-off, best sellers and
 * booking enquiries appear in the reports without a tag being wired up page by
 * page.
 *
 * Pushing an event is not the same as sending it: with statistics refused in the
 * cookie banner, Tag Manager's tags store nothing on the visitor's device.
 *
 * Every amount here is in euros. Shop prices are cents in code — `toEuros`
 * converts them; activity and workshop prices already come in euros.
 */

/** Shop prices are euro cents; GA4 wants decimal euros. */
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

function pushEvent(event: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const w = window as Window & { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer ?? []
  w.dataLayer.push({ event, ...params })
}

function pushEcommerce(event: string, ecommerce: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const w = window as Window & { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer ?? []
  // Clearing first stops the previous event's items from leaking into this one.
  w.dataLayer.push({ ecommerce: null })
  w.dataLayer.push({ event, ecommerce: { currency: CURRENCY, ...ecommerce } })
}

export function trackViewItem(item: ShopItem): void {
  pushEcommerce('view_item', { value: item.price, items: [item] })
}

export function trackAddToCart(items: ShopItem[]): void {
  pushEcommerce('add_to_cart', { value: sumItems(items), items })
}

export function trackRemoveFromCart(items: ShopItem[]): void {
  pushEcommerce('remove_from_cart', { value: sumItems(items), items })
}

export function trackViewCart(items: ShopItem[], value: number): void {
  pushEcommerce('view_cart', { value: round(value), items })
}

export function trackBeginCheckout(
  items: ShopItem[],
  value: number,
  options: { coupon?: string; currency?: string } = {},
): void {
  pushEcommerce('begin_checkout', {
    value: round(value),
    items,
    ...(options.coupon ? { coupon: options.coupon } : {}),
    ...(options.currency ? { currency: options.currency.toUpperCase() } : {}),
  })
}

export function trackPurchase(order: {
  transactionId: string
  items: ShopItem[]
  value: number
  shipping?: number
  coupon?: string
  currency?: string
}): void {
  pushEcommerce('purchase', {
    transaction_id: order.transactionId,
    value: round(order.value),
    ...(order.shipping === undefined ? {} : { shipping: round(order.shipping) }),
    items: order.items,
    ...(order.coupon ? { coupon: order.coupon } : {}),
    ...(order.currency ? { currency: order.currency.toUpperCase() } : {}),
  })
}

/**
 * One item per price tier that has people on it — activities and workshops both
 * price per age group (adults, children, infants).
 */
export function bookingItems(
  subject: { id: string; name: string; category: string },
  tiers: Array<{ key: string; label: string; price: number }>,
  counts: Record<string, number>,
): ShopItem[] {
  return tiers
    .filter((tier) => (counts[tier.key] ?? 0) > 0)
    .map((tier) => ({
      item_id: `${subject.id}:${tier.key}`,
      item_name: `${subject.name} — ${tier.label}`,
      price: round(tier.price),
      quantity: counts[tier.key] ?? 0,
      item_category: subject.category,
    }))
}

/** GA4 categories for the bookable things, so they group in the reports. */
export const BOOKING_CATEGORY = {
  activity: 'Δραστηριότητες',
  workshop: 'Εργαστήρια',
} as const

/**
 * An enquiry that asks the farm to get in touch — workshop and school-visit
 * requests. GA4's `generate_lead`, which is not an ecommerce event.
 */
export function trackLead(kind: 'workshop' | 'school_visit', subject?: string): void {
  pushEvent('generate_lead', { lead_type: kind, ...(subject ? { lead_subject: subject } : {}) })
}
