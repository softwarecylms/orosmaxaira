/**
 * The two ways a workshop can be booked (R1) — shared by the enquiry form
 * (client) and the `/api/workshop-enquiry` validation (server) so the required
 * combination rule is enforced identically on both ends.
 */
export const WORKSHOP_EXPERIENCE_KEYS = ['gnorizw', 'gnorizw-peripeteies'] as const

export type WorkshopExperienceKey = (typeof WORKSHOP_EXPERIENCE_KEYS)[number]

export const WORKSHOP_EXPERIENCES: { key: WorkshopExperienceKey; label: string }[] = [
  { key: 'gnorizw', label: 'Γνωρίζω τη μέλισσα + βιωματικό εργαστήρι' },
  {
    key: 'gnorizw-peripeteies',
    label: 'Γνωρίζω τη μέλισσα + Περιπέτειες στις Κυψέλες + βιωματικό εργαστήρι',
  },
]

export function experienceLabel(key: string): string | undefined {
  return WORKSHOP_EXPERIENCES.find((e) => e.key === key)?.label
}

// --- Bilingual bundle -----------------------------------------------------
// Greek above is the source of truth (also used server-side by the enquiry API,
// which stays Greek). EN mirrors it for the storefront form. Keys are
// locale-invariant; only the human-facing `label` is translated.
const WORKSHOP_EXPERIENCES_EN: { key: WorkshopExperienceKey; label: string }[] = [
  { key: 'gnorizw', label: 'Getting to Know the Bee + hands-on workshop' },
  {
    key: 'gnorizw-peripeteies',
    label: 'Getting to Know the Bee + Adventures in the Beehives + hands-on workshop',
  },
]

export type WorkshopEnquiryContent = { experiences: { key: WorkshopExperienceKey; label: string }[] }

/** Locale-aware workshop-enquiry options. el = Greek source of truth, en = the
 *  English bundle. Read the active locale via next-intl's `useLocale()`. */
export function getWorkshopEnquiry(locale: string): WorkshopEnquiryContent {
  return { experiences: locale === 'en' ? WORKSHOP_EXPERIENCES_EN : WORKSHOP_EXPERIENCES }
}
