import { sdk } from './client'
import type { Feature, GalleryImage, PriceTier } from './activities'

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
