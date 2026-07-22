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
  meta_title?: string | null
  meta_description?: string | null
}

/** All published workshops (ordered), or null if Medusa is unavailable. */
export async function getWorkshops(): Promise<Workshop[] | null> {
  return sdk.client
    .fetch<{ workshops: Workshop[] }>('/store/workshops', { method: 'GET', cache: 'no-store' })
    .then((r) => r.workshops)
    .catch(() => null)
}

/** A published workshop by slug, or null. */
export async function getWorkshop(slug: string): Promise<Workshop | null> {
  return sdk.client
    .fetch<{ workshop: Workshop }>(`/store/workshops/${slug}`, {
      method: 'GET',
      cache: 'no-store',
    })
    .then((r) => r.workshop)
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
