/**
 * Free-shipping rule — the single source of truth.
 *
 * Cyprus orders ship free once the goods total reaches €70. "Goods total" means
 * the subtotal AFTER any discount code and EXCLUDING shipping itself: a €72 cart
 * with a €5 coupon settles at €67 and so still pays shipping. Greece always pays.
 *
 * The storefront works in cents (the local cart stores unit prices as integers);
 * Medusa v2 totals are decimal euros, hence the two units below. Keep every
 * free-shipping check pointed at these constants — the threshold used to be
 * copy-pasted into each surface, which is how the cart and the product copy
 * drifted to different numbers.
 */

/** €70,00 in cents — for the storefront cart/checkout, which count in cents. */
export const FREE_SHIPPING_THRESHOLD = 7000

/** €70,00 in decimal euros — for Medusa v2 cart totals, which are major units. */
export const FREE_SHIPPING_THRESHOLD_EUR = FREE_SHIPPING_THRESHOLD / 100

/** Exact name of the €0 Medusa shipping option (see seed-oros-checkout.ts). */
export const FREE_SHIPPING_OPTION_NAME = 'Δωρεάν μεταφορικά'

/**
 * Does this cart earn free Cyprus shipping?
 * @param goodsTotal subtotal minus discount, in cents, shipping excluded.
 */
export function earnsFreeShipping(goodsTotal: number): boolean {
  return goodsTotal >= FREE_SHIPPING_THRESHOLD
}
