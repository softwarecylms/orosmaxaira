/**
 * Bilingual UI strings for the school-visit components in this folder
 * (school-booking-card, school-booking-modal, school-visit-form). Greek is the
 * source of truth; English is a faithful translation (the live EN school-visit
 * page is not yet published). Generic field labels (Email, Phone, date
 * formatting, "Send request") are shared from `@/components/booking/booking-ui`.
 * Read the active locale via next-intl's `useLocale()` and call
 * `getScholeiaUi(locale)`.
 */

export type ScholeiaUi = {
  costPerChild: string
  free: string
  perChildSuffix: string // " / παιδί"
  bookVisit: string
  priceIncludes: string
  questionsVisit: string
  experienceBy: string

  modalTitle: string
  modalAria: string

  school: string
  contactPerson: string
  numberOfChildren: string
  gradeLabel: string
  gradePlaceholder: string
  gradeAria: string
  preferredDate: string
  weekdaysOnly: string
  selectedDate: string
  workshopLegend: string
  required: string
  notesPlaceholder: string
  notesAria: string
  estimatedTotal: string
  estimateBreakdown: (count: number, perChild: number) => string
  requestNote: string
  sending: string
  successTitle: string
  successBody: string
  genericError: string

  // Validation
  vSchool: string
  vName: string
  vEmail: string
  vPhone: string
  vCount: string
  vMax: (max: number) => string
  vWorkshop: string
  vDate: string
  vWeekday: string
}

const EL: ScholeiaUi = {
  costPerChild: 'Κόστος ανά παιδί',
  free: 'Δωρεάν',
  perChildSuffix: ' / παιδί',
  bookVisit: 'Κλείστε επίσκεψη',
  priceIncludes: 'Η τιμή περιλαμβάνει όλα τα υλικά των εργαστηρίων και τα δώρα του quiz.',
  questionsVisit: 'Έχετε απορίες για την επίσκεψη;',
  experienceBy: 'Μια εμπειρία του',

  modalTitle: 'Κράτηση σχολικής επίσκεψης',
  modalAria: 'Κράτηση σχολικής επίσκεψης',

  school: 'Σχολείο',
  contactPerson: 'Υπεύθυνος/η επικοινωνίας',
  numberOfChildren: 'Αριθμός παιδιών',
  gradeLabel: 'Τάξη / Τάξεις (προαιρετικό)',
  gradePlaceholder: 'π.χ. Γ′ & Δ′ Δημοτικού',
  gradeAria: 'Τάξη ή τάξεις',
  preferredDate: 'Προτιμώμενη ημερομηνία',
  weekdaysOnly: '(μόνο Δευτέρα–Παρασκευή)',
  selectedDate: 'Επιλεγμένη ημερομηνία:',
  workshopLegend: 'Εργαστήριο (Δραστηριότητα 2)',
  required: '(υποχρεωτικό)',
  notesPlaceholder:
    'Σημειώσεις — ενημερώστε μας για τυχόν αλλεργίες (ξηροί καρποί, μέλι, μέλισσες) ή ιατρικές καταστάσεις.',
  notesAria: 'Σημειώσεις και αλλεργίες',
  estimatedTotal: 'Εκτιμώμενο σύνολο',
  estimateBreakdown: (count, per) =>
    `${count} ${count === 1 ? 'παιδί' : 'παιδιά'} × €${per} ανά παιδί · οι συνοδοί δωρεάν`,
  requestNote:
    'Το παρόν αποτελεί αίτημα κράτησης — θα επικοινωνήσουμε για την επιβεβαίωση της διαθεσιμότητας.',
  sending: 'Αποστολή…',
  successTitle: 'Λάβαμε το αίτημά σας! 🐝',
  successBody:
    'Θα επικοινωνήσουμε σύντομα μαζί σας για την επιβεβαίωση της ημερομηνίας και των λεπτομερειών της επίσκεψης.',
  genericError: 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.',

  vSchool: 'Συμπληρώστε το όνομα του σχολείου.',
  vName: 'Συμπληρώστε το όνομα του/της υπευθύνου.',
  vEmail: 'Συμπληρώστε ένα έγκυρο email.',
  vPhone: 'Συμπληρώστε έγκυρο τηλέφωνο επικοινωνίας.',
  vCount: 'Συμπληρώστε τον αριθμό των μαθητών.',
  vMax: (max) => `Ο μέγιστος αριθμός συμμετεχόντων είναι ${max} μαθητές.`,
  vWorkshop: 'Επιλέξτε ένα από τα δύο εργαστήρια (Δραστηριότητα 2).',
  vDate: 'Επιλέξτε προτιμώμενη ημερομηνία.',
  vWeekday: 'Οι επισκέψεις γίνονται μόνο εργάσιμες ημέρες (Δευτέρα–Παρασκευή).',
}

const EN: ScholeiaUi = {
  costPerChild: 'Cost per child',
  free: 'Free',
  perChildSuffix: ' / child',
  bookVisit: 'Book a visit',
  priceIncludes: 'The price includes all workshop materials and the quiz gifts.',
  questionsVisit: 'Any questions about the visit?',
  experienceBy: 'An experience by',

  modalTitle: 'Book a school visit',
  modalAria: 'Book a school visit',

  school: 'School',
  contactPerson: 'Contact person',
  numberOfChildren: 'Number of children',
  gradeLabel: 'Class / Classes (optional)',
  gradePlaceholder: 'e.g. 3rd & 4th grade',
  gradeAria: 'Class or classes',
  preferredDate: 'Preferred date',
  weekdaysOnly: '(Monday–Friday only)',
  selectedDate: 'Selected date:',
  workshopLegend: 'Workshop (Activity 2)',
  required: '(required)',
  notesPlaceholder:
    'Notes — let us know of any allergies (nuts, honey, bees) or medical conditions.',
  notesAria: 'Notes and allergies',
  estimatedTotal: 'Estimated total',
  estimateBreakdown: (count, per) =>
    `${count} ${count === 1 ? 'child' : 'children'} × €${per} per child · accompanying adults free`,
  requestNote:
    'This is a booking request — we will contact you to confirm availability.',
  sending: 'Sending…',
  successTitle: 'We have received your request! 🐝',
  successBody:
    'We will contact you shortly to confirm the date and the details of the visit.',
  genericError: 'Something went wrong. Please try again.',

  vSchool: 'Please enter the school name.',
  vName: 'Please enter the contact person’s name.',
  vEmail: 'Please enter a valid email.',
  vPhone: 'Please enter a valid contact phone number.',
  vCount: 'Please enter the number of pupils.',
  vMax: (max) => `The maximum number of participants is ${max} pupils.`,
  vWorkshop: 'Choose one of the two workshops (Activity 2).',
  vDate: 'Choose a preferred date.',
  vWeekday: 'Visits take place on weekdays only (Monday–Friday).',
}

export function getScholeiaUi(locale: string): ScholeiaUi {
  return locale === 'en' ? EN : EL
}
