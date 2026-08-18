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

// --- Bilingual bundle -----------------------------------------------------
// The Greek constants above are the source of truth (also used server-side by
// the enquiry API + zod enum, which stay Greek). EN mirrors only the human-
// facing text: option labels/short/description and the price-tier `range`/`note`.
// Keys, prices (numbers) and `MAX_STUDENTS` are locale-invariant and reused.

const SCHOOL_WORKSHOP_OPTIONS_EN: SchoolWorkshopOption[] = [
  {
    key: 'keria',
    label: 'Candle-making workshop & creating a poster for the protection of bees',
    short: 'Candle-making & poster',
    description:
      'The children make their own candle from a sheet of honeycomb and decorate it with ribbons and beads, adding their personal touch.',
  },
  {
    key: 'fytefsi',
    label: 'Workshop planting bee-friendly seeds in ceramic pots & painting',
    short: 'Seed planting & painting',
    description:
      'The children plant bee-friendly seeds in little ceramic pots — a way of protecting the bees — and then paint them with brushes.',
  },
]

const SCHOOL_PRICING_EN: SchoolPriceTier[] = [
  { range: 'Up to 25 children', price: 8, note: 'per child, incl. VAT' },
  { range: 'From 26 to 54 children', price: 7, note: 'per child, incl. VAT' },
  { range: 'Teachers & escorts', price: null, note: 'everyone accompanying the class' },
]

export type SchoolVisitContent = {
  workshopOptions: SchoolWorkshopOption[]
  pricing: SchoolPriceTier[]
  maxStudents: number
}

/** Locale-aware school-visit content. el = the Greek source of truth, en = the
 *  English bundle. Read the active locale via next-intl's `useLocale()`. */
export function getSchoolVisit(locale: string): SchoolVisitContent {
  const en = locale === 'en'
  return {
    workshopOptions: en ? SCHOOL_WORKSHOP_OPTIONS_EN : (SCHOOL_WORKSHOP_OPTIONS as unknown as SchoolWorkshopOption[]),
    pricing: en ? SCHOOL_PRICING_EN : SCHOOL_PRICING,
    maxStudents: MAX_STUDENTS,
  }
}
