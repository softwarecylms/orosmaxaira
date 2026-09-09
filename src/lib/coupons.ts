/**
 * Discount codes — the single source of truth for the storefront.
 *
 * BEE10 takes 10% off once the goods subtotal reaches €150. "Goods subtotal"
 * means the line items BEFORE any discount and EXCLUDING shipping, which is the
 * same figure Medusa calls `item_subtotal` — so the client-side check here and
 * the promotion rule on the Medusa record (see
 * `medusa/apps/backend/src/scripts/seed-oros-checkout.ts`) agree on what they
 * are measuring. Keep the two in step: the checkout only *displays* the
 * discount, Medusa is what actually applies it to the order.
 *
 * The storefront counts in cents (the local cart stores unit prices as
 * integers); Medusa v2 totals are decimal euros, hence the two units below.
 */

export type Coupon = {
  kind: 'pct' | 'fixed'
  /** Percent for 'pct', cents for 'fixed'. */
  value: number
  /** Minimum goods subtotal in cents, before discount and excluding shipping. */
  minSubtotal: number
}

/** €150,00 in cents. */
export const BEE10_MIN_SUBTOTAL = 15000

/** €150,00 in decimal euros — for Medusa, whose totals are major units. */
export const BEE10_MIN_SUBTOTAL_EUR = BEE10_MIN_SUBTOTAL / 100

export const COUPONS: Record<string, Coupon> = {
  BEE10: { kind: 'pct', value: 10, minSubtotal: BEE10_MIN_SUBTOTAL },
}

/**
 * Is `code` a real code, and does this cart qualify for it?
 * @param subtotal goods subtotal in cents, before discount, shipping excluded.
 */
export function checkCoupon(
  code: string,
  subtotal: number,
): { ok: true; coupon: Coupon } | { ok: false; reason: 'unknown' | 'below-minimum'; minSubtotal?: number } {
  const coupon = COUPONS[code]
  if (!coupon) return { ok: false, reason: 'unknown' }
  if (subtotal < coupon.minSubtotal) {
    return { ok: false, reason: 'below-minimum', minSubtotal: coupon.minSubtotal }
  }
  return { ok: true, coupon }
}

/**
 * The discount this cart earns, in cents. Returns 0 when no code is applied or
 * the cart has since dropped below the minimum — removing an item must take the
 * discount with it, not leave a stale one on the total.
 */
export function couponDiscount(code: string | null, subtotal: number): number {
  if (!code) return 0
  const check = checkCoupon(code, subtotal)
  if (!check.ok) return 0
  const { coupon } = check
  const raw = coupon.kind === 'pct' ? Math.round((subtotal * coupon.value) / 100) : coupon.value
  return Math.min(subtotal, raw)
}
