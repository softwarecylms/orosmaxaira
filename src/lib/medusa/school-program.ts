import { sdk } from './client'

/**
 * Storefront data layer for the singleton "Εκπαιδευτικές Επισκέψεις Σχολείων"
 * program (Medusa `school_program` model). Server-side, `no-store`. Callers fall
 * back to the static `src/lib/data/school-visit.ts` + page copy when null.
 */
export type SchoolProgram = {
  id: string
  title: string
  hero_image?: string | null
  hero_image_alt?: string | null
  intro?: string | null
  closing?: string | null
  program_note?: string | null
  tour_title?: string | null
  tour_intro?: string | null
  tour_stops?: { text: string }[] | null
  workshop_intro?: string | null
  workshop_options?: { key: string; short: string; description: string }[] | null
  workshop_note?: string | null
  play_title?: string | null
  play_text?: string | null
  duration_text?: string | null
  max_students?: number | null
  pricing?: { range: string; price: number | null; note?: string }[] | null
  notes?: { title: string; body: string }[] | null
  allergy_title?: string | null
  allergy_body?: string[] | null
  meta_title?: string | null
  meta_description?: string | null
}

export async function getSchoolProgram(): Promise<SchoolProgram | null> {
  return sdk.client
    .fetch<{ program: SchoolProgram }>('/store/school-program', {
      method: 'GET',
      cache: 'no-store',
    })
    .then((r) => r.program)
    .catch(() => null)
}
