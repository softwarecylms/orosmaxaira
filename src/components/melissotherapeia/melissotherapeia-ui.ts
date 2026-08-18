/**
 * Bilingual UI strings for the Μελισσοθεραπεία booking card + enquiry modal.
 * Greek is the source of truth; English mirrors the live site's "Bee Therapy"
 * naming and faithful translations otherwise. Read the active locale via
 * next-intl's `useLocale()` and call `getMelissoUi(locale)`.
 */

export type MelissoUi = {
  activityName: string
  appointmentGlance: string
  duration: string
  cost: string
  period: string
  bookAppointment: string
  nonBinding: string
  questionsAppointment: string
  experienceBy: string
  modalAria: string
  modalTitle: string
}

const EL: MelissoUi = {
  activityName: 'Μελισσοθεραπεία',
  appointmentGlance: 'Το ραντεβού με μια ματιά',
  duration: 'Διάρκεια',
  cost: 'Κόστος',
  period: 'Περίοδος',
  bookAppointment: 'Κλείστε ραντεβού',
  nonBinding: 'Το αίτημα δεν δεσμεύει — θα επικοινωνήσουμε για την επιβεβαίωση του ραντεβού.',
  questionsAppointment: 'Έχετε απορίες για το ραντεβού;',
  experienceBy: 'Μια εμπειρία του',
  modalAria: 'Κράτηση ραντεβού — Μελισσοθεραπεία',
  modalTitle: 'Κλείστε το ραντεβού σας',
}

const EN: MelissoUi = {
  activityName: 'Bee Therapy',
  appointmentGlance: 'The appointment at a glance',
  duration: 'Duration',
  cost: 'Cost',
  period: 'Period',
  bookAppointment: 'Book an appointment',
  nonBinding: 'The request is not binding — we will contact you to confirm the appointment.',
  questionsAppointment: 'Any questions about the appointment?',
  experienceBy: 'An experience by',
  modalAria: 'Appointment booking — Bee Therapy',
  modalTitle: 'Book your appointment',
}

export function getMelissoUi(locale: string): MelissoUi {
  return locale === 'en' ? EN : EL
}
