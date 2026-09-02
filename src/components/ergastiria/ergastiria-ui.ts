/**
 * Bilingual UI strings specific to the Εργαστήρια (workshops) components in this
 * folder. Greek is the source of truth; English mirrors the live site's wording
 * where it exists and faithful translations otherwise. Generic booking chrome
 * (steps, seats, totals, confirmation rows, calendar) is shared from
 * `@/components/booking/booking-ui` — this module only holds the ergastiria-
 * specific copy. Read the active locale via next-intl's `useLocale()` (client)
 * or `getLocale()` (server) and call `getErgastiriaUi(locale)`.
 */

export type ErgastiriaUi = {
  // Shared chrome
  experienceBy: string
  questions: string
  sending: string
  genericError: string

  // SeasonCalendar
  weAreInPre: string
  runningPre: string
  runningPost: string
  noWorkshopSuffix: string
  now: string
  viewWorkshop: string
  byAppointmentAllYear: string
  cardAria: (season: string, range: string, title: string) => string

  // WorkshopClosedNotice
  closedTitle: string
  closedBody: (season?: string) => string
  contactUs: string

  // WorkshopComboNotice
  comboTitle: string
  comboBodyPre: string
  comboBodyMid: string
  comboBodyPost: string
  gnorizwLabel: string
  peripeteiesLabel: string

  // WorkshopEnquiryForm
  chooseCombo: string
  required: string
  periodWorkshopPre: string
  noScheduledWorkshop: string
  enquirySent: string
  vExperience: string
  vName: string
  vEmail: string
  vPhone: string
  vDay: string
  vTime: string

  // WorkshopBooking (enquiry card + modal)
  optionsCost: string
  indicativePerPerson: string
  bookWorkshop: string
  comboSmallNote: string
  experienceCombo: string
  preferredDateOptional: string
  requestNoteShort: string
  sentTitle: string
  sentBody: string
  vPhoneShort: string
  vCombo: string
  reservationAria: (title: string) => string

  // WorkshopSeatBooking
  bookOnline: string
  instantConfirm: string
  workshopBookingTitle: string
  confirmTitle: string
  stepProgram: string
  noAvailableDatesShort: string
  confWorkshop: string
  confProgram: string
}

const EL: ErgastiriaUi = {
  experienceBy: 'Μια εμπειρία του',
  questions: 'Έχετε απορίες;',
  sending: 'Αποστολή…',
  genericError: 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.',

  weAreInPre: 'Βρισκόμαστε στον ',
  runningPre: ' — τρέχει το εργαστήρι ',
  runningPost: '.',
  noWorkshopSuffix: ' — τα εργαστήρια αυτή την περίοδο γίνονται κατόπιν ραντεβού.',
  now: 'Τώρα',
  viewWorkshop: 'Δείτε το εργαστήρι',
  byAppointmentAllYear: 'Κατόπιν ραντεβού, όλο τον χρόνο',
  cardAria: (s, r, t) => `${s} (${r}) — ${t}`,

  closedTitle: 'Οι κρατήσεις είναι κλειστές',
  closedBody: (season) =>
    `Πρόκειται για εποχιακό εργαστήρι${season ? ` (${season})` : ''}. Οι κρατήσεις θα ανοίξουν ξανά ενόψει της νέας περιόδου. Για ενημέρωση ή ομαδικό αίτημα, επικοινωνήστε μαζί μας.`,
  contactUs: 'Επικοινωνήστε μαζί μας',

  comboTitle: 'Πώς κρατούνται τα εργαστήρια',
  comboBodyPre:
    'Τα βιωματικά εργαστήρια δεν κρατούνται αυτόνομα. Συνδυάζονται πάντα είτε με την εμπειρία ',
  comboBodyMid: ', είτε με τον συνδυασμό ',
  comboBodyPost: '.',
  gnorizwLabel: '«Γνωρίζω τη μέλισσα»',
  peripeteiesLabel: '«Περιπέτειες στις Κυψέλες»',

  chooseCombo: 'Επιλέξτε συνδυασμό',
  required: '(υποχρεωτικό)',
  periodWorkshopPre: 'Το εργαστήρι αυτής της περιόδου: ',
  noScheduledWorkshop:
    'Για την ημερομηνία που επιλέξατε δεν υπάρχει προγραμματισμένο εργαστήρι — στείλτε το αίτημά σας και θα βρούμε μαζί την καλύτερη επιλογή.',
  enquirySent:
    'Λάβαμε το αίτημά σας! Πρόκειται για αίτημα κράτησης — θα επικοινωνήσουμε σύντομα μαζί σας για την επιβεβαίωση της διαθεσιμότητας. 🐝',
  vExperience: 'Επιλέξτε τον συνδυασμό εμπειρίας.',
  vName: 'Συμπληρώστε το ονοματεπώνυμό σας.',
  vEmail: 'Συμπληρώστε ένα έγκυρο email.',
  vPhone: 'Συμπληρώστε έγκυρο τηλέφωνο επικοινωνίας.',
  vDay: 'Επιλέξτε προτιμώμενη ημέρα.',
  vTime: 'Επιλέξτε ώρα έναρξης.',

  optionsCost: 'Επιλογές & κόστος',
  indicativePerPerson: 'Ενδεικτικές τιμές ανά άτομο.',
  bookWorkshop: 'Κλείστε το εργαστήρι',
  comboSmallNote:
    'Κάθε εργαστήρι συνδυάζεται με μία εμπειρία «Γνωρίζω τη Μέλισσα». Στείλτε το αίτημά σας και θα επικοινωνήσουμε για την επιβεβαίωση.',
  experienceCombo: 'Συνδυασμός εμπειρίας',
  preferredDateOptional: 'Προτιμώμενη ημερομηνία (προαιρετικό)',
  requestNoteShort: 'Το παρόν αποτελεί αίτημα κράτησης — θα επικοινωνήσουμε για την επιβεβαίωση.',
  sentTitle: 'Λάβαμε το αίτημά σας! 🐝',
  sentBody: 'Θα επικοινωνήσουμε σύντομα μαζί σας για την επιβεβαίωση της κράτησης.',
  vPhoneShort: 'Συμπληρώστε έγκυρο τηλέφωνο.',
  vCombo: 'Επιλέξτε συνδυασμό εμπειρίας.',
  reservationAria: (t) => `Κράτηση — ${t}`,

  bookOnline: 'Κλείστε online',
  instantConfirm: 'Άμεση επιβεβαίωση & email απόδειξης. Ακύρωση έως 72 ώρες πριν.',
  workshopBookingTitle: 'Κράτηση εργαστηρίου',
  confirmTitle: 'Επιβεβαίωση κράτησης',
  stepProgram: 'Επιλέξτε πρόγραμμα',
  noAvailableDatesShort: 'χωρίς διαθέσιμες ημερομηνίες',
  confWorkshop: 'Εργαστήρι',
  confProgram: 'Πρόγραμμα',
}

const EN: ErgastiriaUi = {
  experienceBy: 'An experience by',
  questions: 'Any questions?',
  sending: 'Sending…',
  genericError: 'Something went wrong. Please try again.',

  weAreInPre: 'We are in ',
  runningPre: ' — the ',
  runningPost: ' workshop is running.',
  noWorkshopSuffix: ' — workshops this period run by appointment.',
  now: 'Now',
  viewWorkshop: 'See the workshop',
  byAppointmentAllYear: 'By appointment, all year round',
  cardAria: (s, r, t) => `${s} (${r}) — ${t}`,

  closedTitle: 'Bookings are closed',
  closedBody: (season) =>
    `This is a seasonal workshop${season ? ` (${season})` : ''}. Bookings will reopen ahead of the new season. For updates or a group request, please get in touch with us.`,
  contactUs: 'Contact us',

  comboTitle: 'How workshops are booked',
  comboBodyPre:
    'Workshops are always booked together with ',
  comboBodyMid: ', or with “Getting to Know the Bee” and ',
  comboBodyPost: ' combined.',
  gnorizwLabel: '“Getting to Know the Bee”',
  peripeteiesLabel: '“Adventures at the Hives”',

  chooseCombo: 'Choose a combination',
  required: '(required)',
  periodWorkshopPre: 'This season’s workshop: ',
  noScheduledWorkshop:
    'There is no scheduled workshop for the date you chose — send us your request and we’ll find the best option together.',
  enquirySent:
    'We have received your request! This is a booking request — we will contact you shortly to confirm availability. 🐝',
  vExperience: 'Choose the experience combination.',
  vName: 'Please enter your full name.',
  vEmail: 'Please enter a valid email.',
  vPhone: 'Please enter a valid contact phone number.',
  vDay: 'Choose a preferred day.',
  vTime: 'Choose a start time.',

  optionsCost: 'Options & cost',
  indicativePerPerson: 'Indicative prices per person.',
  bookWorkshop: 'Book the workshop',
  comboSmallNote:
    'Every workshop is combined with a “Getting to Know the Bee” experience. Send us your request and we will contact you to confirm.',
  experienceCombo: 'Experience combination',
  preferredDateOptional: 'Preferred date (optional)',
  requestNoteShort: 'This is a booking request — we will contact you to confirm.',
  sentTitle: 'We have received your request! 🐝',
  sentBody: 'We will contact you shortly to confirm your booking.',
  vPhoneShort: 'Please enter a valid phone number.',
  vCombo: 'Choose the experience combination.',
  reservationAria: (t) => `Booking — ${t}`,

  bookOnline: 'Book online',
  instantConfirm: 'You’ll receive instant confirmation and a receipt by email. Cancellation up to 72 hours before.',
  workshopBookingTitle: 'Workshop booking',
  confirmTitle: 'Booking confirmation',
  stepProgram: 'Choose a programme',
  noAvailableDatesShort: 'no available dates',
  confWorkshop: 'Workshop',
  confProgram: 'Programme',
}

export function getErgastiriaUi(locale: string): ErgastiriaUi {
  return locale === 'en' ? EN : EL
}
