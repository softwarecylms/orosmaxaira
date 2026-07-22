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

// ── Workshop experience combos (Half / Full) ────────────────────────────────
// A workshop combo is priced per person by age. `comboAgeTiers` flattens a
// combo's `prices` + `age_labels` into the same {key,label,price} tier shape the
// booking UI already uses for activities.

const DEFAULT_AGE_LABELS = {
  adult: 'Ενήλικες (12+ ετών)',
  child: 'Παιδιά (4–11 ετών)',
  infant: 'Βρέφη & Νήπια (0–3 ετών)',
}

export type AgeKey = 'adult' | 'child' | 'infant'
export type AgeTier = { key: AgeKey; label: string; price: number; note?: string }

/** Per-age tiers for a workshop combo (adults / children / infants). */
export function comboAgeTiers(combo: PriceTier): AgeTier[] {
  const prices = combo.prices ?? {}
  const labels = combo.age_labels ?? {}
  const keys: AgeKey[] = ['adult', 'child', 'infant']
  return keys.map((key) => ({
    key,
    label: labels[key] ?? DEFAULT_AGE_LABELS[key],
    price: Number(prices[key]) || 0,
    note: key === 'infant' ? 'Δωρεάν' : undefined,
  }))
}

/** The lowest (adult) "from" price of a combo, for the summary card. */
export function comboFromPrice(combo: PriceTier): number {
  return Number(combo.prices?.adult) || 0
}
