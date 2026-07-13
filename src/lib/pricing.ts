import type { PriceTier } from './medusa/activities'

/**
 * Weekday/weekend tier pricing — a single source of truth shared by the booking
 * card and the booking modal so the storefront preview can never diverge from
 * the amount the server charges.
 *
 * This mirrors the authoritative rule in the Medusa bookings route
 * (`medusa/apps/backend/src/api/store/bookings/route.ts`): a Sat/Sun slot uses a
 * tier's `weekend_price` when it is set (non-null, non-blank), otherwise the base
 * `price`. Values may arrive as stringy numbers from the admin JSON, so both
 * ends coerce with `Number(...) || 0`.
 */

/** Base (weekday) price of a tier, as a number. */
export function weekdayPrice(t: PriceTier): number {
  return Number(t.price) || 0
}

/** Effective weekend (Sat/Sun) price of a tier: `weekend_price` when set,
 *  otherwise the weekday price. */
export function weekendPrice(t: PriceTier): number {
  const wp = t.weekend_price
  return wp != null && wp !== '' ? Number(wp) || 0 : weekdayPrice(t)
}

/** Price for a tier on a given day (weekend flag decides which rule applies). */
export function tierPrice(t: PriceTier, weekend: boolean): number {
  return weekend ? weekendPrice(t) : weekdayPrice(t)
}

/** True when at least one tier is priced differently on weekends. */
export function hasWeekendPricing(tiers: PriceTier[]): boolean {
  return tiers.some((t) => weekendPrice(t) !== weekdayPrice(t))
}
