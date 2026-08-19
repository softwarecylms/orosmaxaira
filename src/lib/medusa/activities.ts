import { sdk } from './client'
import { ACTIVITY_EN } from './activities-en'

/**
 * Storefront data layer for the Medusa `bookings` module (activities +
 * availability). All calls are server-side; the SDK auto-attaches the
 * publishable key. Reads are `no-store` so admin edits + live seat counts
 * always reflect immediately.
 */

/** Per-age prices for a workshop experience combo (Half / Full). */
export type ComboPrices = {
  adult?: number | string
  child?: number | string
  infant?: number | string
}

export type PriceTier = {
  key: string
  label: string
  // Values originate from an admin-editable JSON blob → tolerate stringy numbers.
  // `price` is a single flat price (activities + enquiry combos); a workshop
  // seat combo instead carries per-age `prices`.
  price?: number | string
  prices?: ComboPrices | null
  /** Optional Sat/Sun price; when absent/blank, weekend uses `price`. */
  weekend_price?: number | string | null
  /** Workshop combos: full experience label + session time + per-age labels. */
  long_label?: string
  start_time?: string
  end_time?: string
  age_labels?: { adult?: string; child?: string; infant?: string }
  note?: string
}
export type GalleryImage = { url: string; alt?: string }
export type Feature = { title: string; text: string }
export type Policy = { title: string; body: string }
export type Review = { name: string; date?: string; rating?: number; body: string }

export type Activity = {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  hero_image?: string | null
  hero_image_alt?: string | null
  video_url?: string | null
  description?: string | null
  details?: string | null
  note?: string | null
  rating?: number | null
  review_count?: number | null
  duration_label?: string | null
  age_label?: string | null
  season_start_month?: number | null
  season_end_month?: number | null
  currency?: string
  status?: string
  meta_title?: string | null
  meta_description?: string | null
  /** 'seats' = real slot/seat checkout; 'enquiry' = appointment request (e.g. Μελισσοθεραπεία). */
  booking_type?: 'seats' | 'enquiry'
  price_tiers?: PriceTier[] | null
  gallery?: GalleryImage[] | null
  features?: Feature[] | null
  policies?: Policy[] | null
  reviews?: Review[] | null
  /** Optional "Οφέλη" list (e.g. Μελισσοθεραπεία conditions). */
  benefits?: { intro?: string; items: string[] } | null
  related_slugs?: string[] | null
  /** Per-locale overlay of the translatable fields, edited in the Medusa admin.
   *  When locale === 'en', `translations.en` is spread over the base record. */
  translations?: { en?: Partial<Activity> } | null
}

export type AvailabilitySlot = {
  id: string
  date: string // YYYY-MM-DD
  start_time: string // HH:mm
  end_time?: string | null
  capacity: number
  remaining: number
  /** Workshop slots only: which experience combo ("half" / "full") this is. */
  combo_key?: string | null
}

/**
 * Fetch a published activity by slug, or null if it isn't in Medusa.
 *
 * The English text is edited in the Medusa admin and stored on the record as
 * `translations.en`; when `locale === 'en'` we spread that overlay over the base
 * (Greek) record — translating text only and keeping id/slug/prices/images/
 * months/currency/video untouched. If the DB overlay is missing we fall back to
 * the bundled `activities-en.ts` overlay (e.g. Medusa not yet backfilled).
 */
export async function getActivity(slug: string, locale?: string): Promise<Activity | null> {
  const activity = await sdk.client
    .fetch<{ activity: Activity }>(`/store/activities/${slug}`, {
      method: 'GET',
      cache: 'no-store',
    })
    .then((r) => r.activity)
    .catch(() => null)

  if (!activity) return null
  if (locale === 'en') {
    const overlay = activity.translations?.en ?? ACTIVITY_EN[slug]
    if (overlay) return { ...activity, ...overlay }
  }
  return activity
}

/** Open slots (with remaining capacity) for a date range. */
export async function getAvailability(
  slug: string,
  from?: string,
  to?: string,
): Promise<{ slots: AvailabilitySlot[]; currency: string }> {
  const query: Record<string, string> = {}
  if (from) query.from = from
  if (to) query.to = to
  return sdk.client
    .fetch<{ slots: AvailabilitySlot[]; currency: string }>(
      `/store/activities/${slug}/availability`,
      { method: 'GET', query, cache: 'no-store' },
    )
    .catch(() => ({ slots: [] as AvailabilitySlot[], currency: 'eur' }))
}
