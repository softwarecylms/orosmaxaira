/**
 * "Εκπαιδευτικές Επισκέψεις Σχολείων" — the single source of truth for the
 * school-visit page (/drastiriotites/scholeia), its booking form and the
 * enquiry API. The two Δραστηριότητα-2 workshop options and the pricing tiers
 * live here so the page, the form and the server-side validation can never
 * drift apart.
 */

export type SchoolWorkshopOption = {
  key: string
  /** Full label (used in the form's radio + the confirmation email). */
  label: string
  /** Short label for compact UI. */
  short: string
  description: string
}

export const SCHOOL_WORKSHOP_OPTIONS = [
  {
    key: 'keria',
    label: 'Εργαστήριο κατασκευής κεριών & δημιουργία poster για την προστασία των μελισσών',
    short: 'Κατασκευή κεριών & poster',
    description:
      'Τα παιδιά κατασκευάζουν το δικό τους κερί από φύλλο κηρήθρας και το διακοσμούν με κορδέλες και μπιχλιμπίδια, αφήνοντας την προσωπική τους πινελιά.',
  },
  {
    key: 'fytefsi',
    label: 'Εργαστήρι φύτευσης μελισσοκομικών σπόρων σε κεραμικά γλαστράκια & ζωγράφισμα',
    short: 'Φύτευση σπόρων & ζωγραφική',
    description:
      'Τα παιδιά φυτεύουν μελισσοκομικούς σπόρους σε κεραμικά γλαστράκια — ένας τρόπος προστασίας των μελισσών — και ύστερα τα ζωγραφίζουν με πινέλα.',
  },
] as const satisfies readonly SchoolWorkshopOption[]

export type SchoolWorkshopKey = (typeof SCHOOL_WORKSHOP_OPTIONS)[number]['key']

/** Non-empty tuple of keys for the API's zod `.enum()`. */
export const SCHOOL_WORKSHOP_KEYS = SCHOOL_WORKSHOP_OPTIONS.map((o) => o.key) as [
  SchoolWorkshopKey,
  ...SchoolWorkshopKey[],
]

export function schoolWorkshopLabel(key: string): string | undefined {
  return SCHOOL_WORKSHOP_OPTIONS.find((o) => o.key === key)?.label
}

/** Hard cap on participants per visit. */
export const MAX_STUDENTS = 50

export type SchoolPriceTier = {
  range: string
  price: number | null // null = free (teachers/escorts)
  note: string
}

export const SCHOOL_PRICING: SchoolPriceTier[] = [
  { range: 'Μέχρι 25 παιδιά', price: 8, note: 'ανά παιδί, με ΦΠΑ' },
  { range: 'Από 26 έως 54 παιδιά', price: 7, note: 'ανά παιδί, με ΦΠΑ' },
  { range: 'Δάσκαλοι & συνοδοί', price: null, note: 'όσοι συνοδεύουν την τάξη' },
]

/** Per-child price for a headcount (teachers/escorts are free). ≤25 ⇒ €8, else €7. */
export function pricePerChild(students: number): number {
  return students <= 25 ? 8 : 7
}

/** Estimated total for the children (teachers/escorts excluded — they're free). */
export function estimateCost(students: number): number {
  if (!Number.isFinite(students) || students < 1) return 0
  return students * pricePerChild(students)
}
