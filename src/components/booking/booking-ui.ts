/**
 * Bilingual UI strings for the booking primitives in this folder
 * (booking-calendar, booking-form, booking-modal). Greek is the source of
 * truth; English mirrors the live site's wording where it exists and faithful
 * translations otherwise. Read the active locale via next-intl's `useLocale()`
 * and call `getBookingUi(locale)` at the call site.
 */

const MONTHS_NOM_EL = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
]
const MONTHS_GEN_EL = [
  'Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου',
  'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου',
]
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export type BookingUi = {
  // Calendar (month grid)
  weekdays: string[] // Monday-first, two-letter
  monthsNom: string[]
  prevMonth: string
  nextMonth: string
  dayAria: (day: number, monthNom: string, year: number) => string
  /** "13 Αυγούστου 2025" / "13 August 2025". */
  formatDate: (ds: string) => string

  // Generic chrome
  close: string
  fullName: string
  email: string
  phone: string
  phoneOptional: string

  // BookingForm (enquiry)
  preferredDay: string
  startTime: string
  chooseTime: string
  seasonAvailable: string
  requestNote: string
  sendRequest: string
  sentMessage: (activity: string) => string

  // BookingModal (seat checkout)
  bookingTitle: string
  confirmTitle: string
  loadingAvailability: string
  noDatesAvailable: string
  callAt: (phone: string) => string
  stepDate: string
  stepTime: string
  stepPeople: string
  stepContact: string
  free: string
  seatsLabel: string // "θέσεις" / "seats"
  seatsAvailable: (remaining: number, total: number) => string
  totalLabel: string
  person: string
  people: string
  processing: string
  payAndBook: string
  completeBooking: string
  bookingFailed: string
  decrease: string
  increase: string
  // Confirmation
  bookingConfirmed: string
  bookingRef: string
  fActivity: string
  fDate: string
  fTime: string
  fPeople: string
  fTotal: string
  emailSentTo: (email: string) => string
  adults: (n: number) => string
  children: (n: number) => string
  infants: (n: number) => string
  priceLocale: string
}

const EL: BookingUi = {
  weekdays: ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ'],
  monthsNom: MONTHS_NOM_EL,
  prevMonth: 'Προηγούμενος μήνας',
  nextMonth: 'Επόμενος μήνας',
  dayAria: (d, mn, y) => `${d} ${mn} ${y}`,
  formatDate: (ds) => {
    if (!ds) return ''
    const [y, m, d] = ds.split('-').map(Number)
    return `${d} ${MONTHS_GEN_EL[(m ?? 1) - 1]} ${y}`
  },

  close: 'Κλείσιμο',
  fullName: 'Ονοματεπώνυμο',
  email: 'Email',
  phone: 'Τηλέφωνο',
  phoneOptional: 'Τηλέφωνο (προαιρετικό)',

  preferredDay: 'Προτιμώμενη ημέρα',
  startTime: 'Ώρα έναρξης',
  chooseTime: 'Επιλέξτε ώρα',
  seasonAvailable: '',
  requestNote:
    'Το παρόν αποτελεί αίτημα κράτησης. Θα επικοινωνήσουμε μαζί σας για την επιβεβαίωση της διαθεσιμότητας.',
  sendRequest: 'Αποστολή αιτήματος',
  sentMessage: (a) =>
    `Λάβαμε το αίτημά σας για την «${a}»! Πρόκειται για αίτημα κράτησης — θα επικοινωνήσουμε σύντομα μαζί σας για την επιβεβαίωση. 🐝`,

  bookingTitle: 'Κράτηση',
  confirmTitle: 'Επιβεβαίωση κράτησης',
  loadingAvailability: 'Φόρτωση διαθεσιμότητας…',
  noDatesAvailable: 'Δεν υπάρχει διαθέσιμη ημερομηνία αυτή τη στιγμή.',
  callAt: (p) => `Καλέστε στο ${p}`,
  stepDate: 'Επιλέξτε ημερομηνία',
  stepTime: 'Επιλέξτε ώρα',
  stepPeople: 'Άτομα',
  stepContact: 'Στοιχεία επικοινωνίας',
  free: 'Δωρεάν',
  seatsLabel: 'θέσεις',
  seatsAvailable: (r, t) => `Διαθέσιμες θέσεις: ${r} από ${t}`,
  totalLabel: 'Σύνολο',
  person: 'άτομο',
  people: 'άτομα',
  processing: 'Επεξεργασία…',
  payAndBook: 'Πληρωμή & Κράτηση',
  completeBooking: 'Ολοκλήρωση κράτησης',
  bookingFailed: 'Η κράτηση δεν ολοκληρώθηκε. Δοκιμάστε ξανά.',
  decrease: 'Μείωση',
  increase: 'Αύξηση',
  bookingConfirmed: 'Η κράτησή σας επιβεβαιώθηκε! 🐝',
  bookingRef: 'Κωδικός κράτησης:',
  fActivity: 'Δραστηριότητα',
  fDate: 'Ημερομηνία',
  fTime: 'Ώρα',
  fPeople: 'Άτομα',
  fTotal: 'Σύνολο',
  emailSentTo: (e) => `Στείλαμε email επιβεβαίωσης στο ${e}.`,
  adults: (n) => `${n} ${n === 1 ? 'ενήλικας' : 'ενήλικες'}`,
  children: (n) => `${n} ${n === 1 ? 'παιδί' : 'παιδιά'}`,
  infants: (n) => `${n} ${n === 1 ? 'βρέφος' : 'βρέφη'}`,
  priceLocale: 'el-GR',
}

const EN: BookingUi = {
  weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  monthsNom: MONTHS_EN,
  prevMonth: 'Previous month',
  nextMonth: 'Next month',
  dayAria: (d, mn, y) => `${d} ${mn} ${y}`,
  formatDate: (ds) => {
    if (!ds) return ''
    const [y, m, d] = ds.split('-').map(Number)
    return `${d} ${MONTHS_EN[(m ?? 1) - 1]} ${y}`
  },

  close: 'Close',
  fullName: 'Full name',
  email: 'Email',
  phone: 'Phone',
  phoneOptional: 'Phone (optional)',

  preferredDay: 'Preferred day',
  startTime: 'Start time',
  chooseTime: 'Choose a time',
  seasonAvailable: '',
  requestNote:
    'This is a booking request. We will contact you to confirm availability.',
  sendRequest: 'Send request',
  sentMessage: (a) =>
    `We have received your request for “${a}”! This is a booking request — we will contact you shortly to confirm. 🐝`,

  bookingTitle: 'Booking',
  confirmTitle: 'Booking confirmation',
  loadingAvailability: 'Loading availability…',
  noDatesAvailable: 'There is no available date at the moment.',
  callAt: (p) => `Call ${p}`,
  stepDate: 'Choose a date',
  stepTime: 'Choose a time',
  stepPeople: 'People',
  stepContact: 'Contact details',
  free: 'Free',
  seatsLabel: 'seats',
  seatsAvailable: (r, t) => `Available seats: ${r} of ${t}`,
  totalLabel: 'Total',
  person: 'person',
  people: 'people',
  processing: 'Processing…',
  payAndBook: 'Pay & Book',
  completeBooking: 'Complete booking',
  bookingFailed: 'The booking could not be completed. Please try again.',
  decrease: 'Decrease',
  increase: 'Increase',
  bookingConfirmed: 'Your booking is confirmed! 🐝',
  bookingRef: 'Booking reference:',
  fActivity: 'Activity',
  fDate: 'Date',
  fTime: 'Time',
  fPeople: 'People',
  fTotal: 'Total',
  emailSentTo: (e) => `We sent a confirmation email to ${e}.`,
  adults: (n) => `${n} ${n === 1 ? 'adult' : 'adults'}`,
  children: (n) => `${n} ${n === 1 ? 'child' : 'children'}`,
  infants: (n) => `${n} ${n === 1 ? 'infant' : 'infants'}`,
  priceLocale: 'en-GB',
}

export function getBookingUi(locale: string): BookingUi {
  return locale === 'en' ? EN : EL
}
