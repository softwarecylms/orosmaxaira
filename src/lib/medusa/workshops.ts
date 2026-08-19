import { sdk } from './client'
import type { AvailabilitySlot, Feature, GalleryImage, PriceTier } from './activities'

/**
 * Storefront data layer for the Εργαστήρια (Medusa `workshop` model). All calls
 * are server-side; reads are `no-store` so admin edits reflect immediately.
 * Callers fall back to the static `src/lib/data/workshops.ts` when these return
 * null (Medusa unavailable) — so the pages work even if the backend is down.
 */
export type Workshop = {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  description?: string | null
  season_label?: string | null
  months?: number[] | null
  image?: string | null
  gallery?: GalleryImage[] | null
  duration_label?: string | null
  age_label?: string | null
  currency?: string
  /** Booking = experience combinations, each a priced tier. */
  price_tiers?: PriceTier[] | null
  features?: Feature[] | null
  rank?: number
  /** When true, the storefront shows a seasonal "bookings closed" notice. */
  booking_closed?: boolean | null
  meta_title?: string | null
  meta_description?: string | null
  /** Per-locale overlay edited in the Medusa admin. Text fields overlay directly;
   *  `combo_labels` (keyed by price-tier key) overlays the tier label/long_label
   *  while leaving prices on the base record. */
  translations?: {
    en?: Partial<Omit<Workshop, 'translations'>> & {
      combo_labels?: Record<string, { label?: string; long_label?: string; note?: string }>
    }
  } | null
}

/** Apply the `translations.en` overlay when locale === 'en' (text fields + the
 *  per-tier combo_labels). Prices/keys/images stay on the Greek base. */
function localizeWorkshop(w: Workshop, locale?: string): Workshop {
  if (locale !== 'en' || !w.translations?.en) return w
  const { combo_labels, ...text } = w.translations.en
  const merged: Workshop = { ...w, ...text }
  if (combo_labels && Array.isArray(w.price_tiers)) {
    merged.price_tiers = w.price_tiers.map((t) => ({ ...t, ...(combo_labels[t.key] ?? {}) }))
  }
  return merged
}

/** All published workshops (ordered), or null if Medusa is unavailable. */
export async function getWorkshops(locale?: string): Promise<Workshop[] | null> {
  return sdk.client
    .fetch<{ workshops: Workshop[] }>('/store/workshops', { method: 'GET', cache: 'no-store' })
    .then((r) => r.workshops.map((w) => localizeWorkshop(w, locale)))
    .catch(() => null)
}

/** A published workshop by slug, or null. */
export async function getWorkshop(slug: string, locale?: string): Promise<Workshop | null> {
  return sdk.client
    .fetch<{ workshop: Workshop }>(`/store/workshops/${slug}`, {
      method: 'GET',
      cache: 'no-store',
    })
    .then((r) => localizeWorkshop(r.workshop, locale))
    .catch(() => null)
}

/**
 * Open slots (with remaining capacity) for a workshop over a date range. Each
 * slot carries `combo_key` ("half" / "full") — the Half and Full programs run at
 * different times, so the combo is fixed by the slot. Returns [] if Medusa is
 * unavailable (the storefront then falls back to the enquiry form).
 */
export async function getWorkshopAvailability(
  slug: string,
  from?: string,
  to?: string,
): Promise<{ slots: AvailabilitySlot[]; currency: string }> {
  const query: Record<string, string> = {}
  if (from) query.from = from
  if (to) query.to = to
  return sdk.client
    .fetch<{ slots: AvailabilitySlot[]; currency: string }>(
      `/store/workshops/${slug}/availability`,
      { method: 'GET', query, cache: 'no-store' },
    )
    .catch(() => ({ slots: [] as AvailabilitySlot[], currency: 'eur' }))
}

/** True when a workshop has any upcoming open slot → book online (else enquiry). */
export async function workshopIsBookable(slug: string): Promise<boolean> {
  const today = new Date()
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const to = iso(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()))
  const { slots } = await getWorkshopAvailability(slug, iso(today), to)
  return slots.length > 0
}
