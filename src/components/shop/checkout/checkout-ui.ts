/**
 * Bilingual UI chrome for the checkout flow (`checkout-form.tsx`,
 * `order-confirmation.tsx`) and the checkout/order pages. el = Greek source of
 * truth, en = English.
 *
 * DISPLAY text only. Business logic — shipping thresholds, the Cyprus city list,
 * the Medusa shipping-option NAMES (`shippingOptionName`), coupon codes and
 * metadata keys — lives in `checkout-form.tsx` and is NOT localized here.
 *
 * Read the active locale with `useLocale()` (client) / `getLocale()` (server).
 */

/** Nominative article per refrigerated product, for the Greek notice grammar. */
const REFRIGERATED_ARTICLE: Record<string, string> = {
  'vasilikos-poltos-oros-machaira': 'Ο',
  'gyri-oros-machaira': 'Η',
}

/** English display names for the (Greek-valued) Cyprus cities — display only;
 *  the option VALUES stay Greek so the shipping logic keeps matching. */
const CITY_EN: Record<string, string> = {
  Λευκωσία: 'Nicosia',
  Λεμεσός: 'Limassol',
  Λάρνακα: 'Larnaca',
  Πάφος: 'Paphos',
  Αμμόχωστος: 'Famagusta',
}

/** English display names for the (Greek-valued) ACS pickup points and their town
 *  groups — display only, like CITY_EN: the option VALUES stay Greek, so the
 *  shipping logic, the order metadata and the admin keep one canonical spelling. */
const ACS_TOWN_EN: Record<string, string> = { ...CITY_EN, Αθήνα: 'Athens' }

const ACS_POINT_EN: Record<string, string> = {
  // Nicosia
  'Ευαγόρου 30, 1097 Λευκωσία': 'Evagorou 30, 1097 Nicosia',
  'Λεωφ. Κων. Παλαιολόγου 6Α, 1011 Λευκωσία (Πλατεία Ελευθερίας)':
    'Kon. Palaiologou Ave. 6A, 1011 Nicosia (Eleftheria Square)',
  'Α. Μιχαλακοπούλου 22, 1075 Λευκωσία': 'A. Michalakopoulou 22, 1075 Nicosia',
  'Λεωφ. Αθαλάσσας 70, 2012 Στρόβολος': 'Athalassas Ave. 70, 2012 Strovolos',
  'Βάρκιζας 14, 2033 Στρόβολος': 'Varkizas 14, 2033 Strovolos',
  '28ης Οκτωβρίου 34Β, 2414 Έγκωμη': '28is Oktovriou 34B, 2414 Engomi',
  'Λεωφ. Μακαρίου 40Η, 2324 Λακατάμια': 'Makariou Ave. 40H, 2324 Lakatamia',
  'Κυριάκου Μάτση 7, 1035 Παλλουριώτισσα': 'Kyriakou Matsi 7, 1035 Pallouriotissa',
  'Λεωφ. Αρχ. Μακαρίου 33, 2220 Λατσιά': 'Archbishop Makariou Ave. 33, 2220 Latsia',
  'Μακαρίου 27Γ, 2572 Πέρα Χωριό Νήσου': 'Makariou 27C, 2572 Pera Chorio Nisou',
  'Λεωφ. Αρχ. Μακαρίου Γ΄ 351, 2313 Πάνω Λακατάμια':
    'Archbishop Makariou III Ave. 351, 2313 Pano Lakatamia',
  'Γρ. Αυξεντίου & Αυλώνας 2, 2660 Κοκκινοτριμιθιά': 'Gr. Afxentiou & Avlonas 2, 2660 Kokkinotrimithia',
  'Μεγάλου Αλεξάνδρου 2, 2643 Εργάτες': 'Megalou Alexandrou 2, 2643 Ergates',
  'Γρίβα Διγενή 70Α, 2722 Αστρομερίτης': 'Griva Digeni 70A, 2722 Astromeritis',
  'Μακαρίου 47, 2800 Κακοπετριά': 'Makariou 47, 2800 Kakopetria',
  // Limassol
  'Στ. Κυριακίδη 41, 3080 Λεμεσός': 'St. Kyriakidi 41, 3080 Limassol',
  'Ρήγα Φεραίου 3, 3095 Λεμεσός': 'Riga Feraiou 3, 3095 Limassol',
  'Βασιλέως Παύλου 35Α, 3052 Λεμεσός': 'Vasileos Pavlou 35A, 3052 Limassol',
  '16ης Ιουνίου 1943 αρ. 18, 3022 Λεμεσός': '16is Iouniou 1943 no. 18, 3022 Limassol',
  'Λεωφ. Σπ. Κυπριανού 17, 4043 Γερμασόγεια': 'Sp. Kyprianou Ave. 17, 4043 Germasogeia',
  'Ηλία Καννάουρου 38, 4180 Ύψωνας': 'Ilia Kannaourou 38, 4180 Ypsonas',
  'Αρχ. Μακαρίου 31, 4620 Επισκοπή': 'Archbishop Makariou 31, 4620 Episkopi',
  'Στ. Χατζηπετρή 17, Αγρός': 'St. Chatzipetri 17, Agros',
  'Μαξιμιανού 6, 4607 Πισσούρι': 'Maximianou 6, 4607 Pissouri',
  // Larnaca
  'Αρχ. Κυπριανού 18, 6016 Λάρνακα': 'Archbishop Kyprianou 18, 6016 Larnaca',
  'Λεωφ. Αρτέμιδος 24, 6030 Λάρνακα': 'Artemidos Ave. 24, 6030 Larnaca',
  'Λεωφ. Μακαρίου Γ΄ 127, 7102 Αραδίππου': 'Makariou III Ave. 127, 7102 Aradippou',
  'Αρχ. Μακαρίου 56, 7550 Κίτι': 'Archbishop Makariou 56, 7550 Kiti',
  'Ελευθερίας 16, 7520 Ξυλοφάγου': 'Eleftherias 16, 7520 Xylofagou',
  'Μετοχίου 21, 7530 Ορμίδια': 'Metochiou 21, 7530 Ormideia',
  'Ελ. Βενιζέλου 38, 7600 Αθηαίνου': 'El. Venizelou 38, 7600 Athienou',
  'Αγίας Παρασκευής 41, 7741 Χοιροκοιτία': 'Agias Paraskevis 41, 7741 Choirokoitia',
  'Αρχ. Μακαρίου 102Α, 7640 Κόρνος': 'Archbishop Makariou 102A, 7640 Kornos',
  // Paphos
  'Λεωφ. Μεσόγης 53, 8280 Πάφος': 'Mesogis Ave. 53, 8280 Paphos',
  'Ν. Νικολαΐδη & Κινύρα 4, 8010 Πάφος': 'N. Nikolaidi & Kinyra 4, 8010 Paphos',
  'Αγαπήνορος 28, 8049 Κάτω Πάφος': 'Agapinoros 28, 8049 Kato Paphos',
  'Λεωφ. Χλώρακας, 8220 Χλώρακα': 'Chlorakas Ave., 8220 Chlorakas',
  'Βασιλέως Στασίοικου 11, 8820 Πόλη Χρυσοχούς': 'Vasileos Stasioikou 11, 8820 Polis Chrysochous',
  // Famagusta
  'Σταδίου 84, 5280 Παραλίμνι': 'Stadiou 84, 5280 Paralimni',
  '1ης Απριλίου 5, 5320 Λιοπέτρι': '1is Apriliou 5, 5320 Liopetri',
  'Ελευθερίας 4, 5380 Δερύνεια': 'Eleftherias 4, 5380 Deryneia',
  'Διονυσίου Σολωμού 1, 5330 Αγία Νάπα': 'Dionysiou Solomou 1, 5330 Ayia Napa',
  // Greece
  'Κεντρικά Γραφεία ACS — Π. Ράλλη 36-38, 12241 Αιγάλεω':
    'ACS Head Office — P. Ralli 36-38, 12241 Aigaleo',
}

type RefItem = { handle: string; title: string }
type BlockedOpts = { inGreece: boolean; city: string }

export type CheckoutUi = {
  // page/meta
  checkoutTitle: string
  orderTitle: string
  orderNote: string
  // empty state
  empty: string
  continueShopping: string
  // errors / notices (dynamic)
  variantError: string
  couponError: string
  // order failures, keyed by OrderErrorCode (src/lib/medusa/order-errors.ts)
  noRegionError: string
  emptyCartError: string
  freeShippingLostError: string
  noShippingError: string
  noPaymentError: string
  couponRejectedError: string
  totalMismatchError: string
  cardDeclinedError: string
  /** @param ref the Stripe payment reference, for support to trace the charge. */
  orderFinalisationError: (ref: string) => string
  orderFailedError: string
  /** @param min the minimum order value, already formatted (e.g. "€150,00"). */
  couponMinimum: (min: string) => string
  refrigeratedNotice: (items: RefItem[]) => string
  refrigeratedBlockedError: (opts: BlockedOpts) => string
  refrigeratedBlockedNotice: (opts: BlockedOpts) => string
  // billing form
  billingLegend: string
  firstName: string
  lastName: string
  phone: string
  phoneCountry: string
  phoneSuggested: string
  phoneAllCountries: string
  email: string
  countryRegion: string
  countryLabel: (value: string) => string
  address: string
  streetPlaceholder: string
  address2Placeholder: string
  city: string
  cityLabel: (value: string) => string
  /** ACS pickup point / town group, shown translated while the stored value stays Greek. */
  acsTownLabel: (value: string) => string
  acsPointLabel: (value: string) => string
  selectCity: string
  postal: string
  company: string
  vat: string
  shipDifferent: string
  notes: string
  notesPlaceholder: string
  // order summary
  orderSummary: string
  decreaseQty: string
  increaseQty: string
  quantity: string
  // delivery
  deliveryLegend: string
  courierDelivery: string
  homeDelivery: string
  acsPickup: string
  free: string
  selectAcsPoint: string
  selectAcsPointPlaceholder: string
  // payment
  paymentLegend: string
  cardPayment: string
  cardDetails: string
  securePaymentNote: string
  /** @param amount the order total, already formatted (e.g. "€52,40"). */
  payAmount: (amount: string) => string
  processingPayment: string
  finalisingOrder: string
  stripeTestModeNote: string
  // coupon
  couponActive: (code: string) => string
  remove: string
  couponCode: string
  apply: string
  // totals
  subtotal: string
  discount: string
  shipping: string
  total: string
  freeShippingRemaining: { pre: string; post: string }
  freeShippingEarned: string
  freeShippingProgress: string
  // consent + submit
  privacyPre: string
  privacyLink: string
  privacyPost: string
  termsPre: string
  termsLink: string
  termsPost: string
  /** Unticked newsletter opt-in (Klaviyo, double opt-in). */
  newsletterOptIn: string
  submit: string
  submitting: string
  testOrderNote: string
  // order confirmation
  thankYou: string
  orderNumber: string
  confirmationEmail: (email: string) => string
  orderPlacedFallback: string
}

const EL: CheckoutUi = {
  checkoutTitle: 'Ταμείο',
  orderTitle: 'Η παραγγελία σας',
  orderNote: 'Σας ευχαριστούμε! Η παραγγελία σας καταχωρήθηκε.',
  empty: 'Το καλάθι σας είναι άδειο.',
  continueShopping: 'Συνεχίστε τις αγορές',
  variantError:
    'Κάποια προϊόντα στο καλάθι σας χρειάζονται ανανέωση — αφαιρέστε τα και προσθέστε τα ξανά.',
  couponError: 'Μη έγκυρος κωδικός κουπονιού.',
  noRegionError: 'Δεν βρέθηκε διαθέσιμη περιοχή αποστολής.',
  emptyCartError: 'Το καλάθι σας είναι άδειο ή μη έγκυρο.',
  freeShippingLostError:
    'Η παραγγελία σας δεν πληροί πλέον το όριο για δωρεάν μεταφορικά. Ανανεώστε τη σελίδα και δοκιμάστε ξανά.',
  noShippingError: 'Δεν υπάρχει διαθέσιμος τρόπος αποστολής.',
  noPaymentError: 'Δεν υπάρχει διαθέσιμος τρόπος πληρωμής.',
  couponRejectedError:
    'Ο κωδικός κουπονιού δεν έγινε δεκτός για αυτή την παραγγελία. Αφαιρέστε τον και δοκιμάστε ξανά.',
  totalMismatchError:
    'Το σύνολο της παραγγελίας άλλαξε. Ανανεώστε τη σελίδα και δοκιμάστε ξανά.',
  cardDeclinedError:
    'Η πληρωμή δεν ολοκληρώθηκε. Ελέγξτε τα στοιχεία της κάρτας ή δοκιμάστε άλλη κάρτα.',
  orderFinalisationError: (ref) =>
    `Η πληρωμή σας ολοκληρώθηκε, αλλά η καταχώρηση της παραγγελίας δεν ολοκληρώθηκε. Έχουμε ειδοποιηθεί και θα επικοινωνήσουμε μαζί σας. Κωδικός πληρωμής: ${ref}`,
  orderFailedError:
    'Η ολοκλήρωση της παραγγελίας απέτυχε. Ελέγξτε τα στοιχεία σας και δοκιμάστε ξανά.',
  couponMinimum: (min) => `Ο κωδικός ισχύει για παραγγελίες από ${min} και άνω.`,
  refrigeratedNotice: (items) => {
    const subject = items
      .map((it, idx) => {
        const article = REFRIGERATED_ARTICLE[it.handle] ?? 'Το'
        return `${idx === 0 ? article : article.toLowerCase()} ${it.title}`
      })
      .join(' και ')
    return items.length === 1
      ? `${subject} είναι προϊόν ψυγείου και παραδίδεται μόνο κατ’ οίκον (εξαιρούνται Πάφος, Αμμόχωστος & Ελλάδα).`
      : `${subject} είναι προϊόντα ψυγείου και παραδίδονται μόνο κατ’ οίκον (εξαιρούνται Πάφος, Αμμόχωστος & Ελλάδα).`
  },
  refrigeratedBlockedError: ({ inGreece, city }) =>
    `Τα προϊόντα ψυγείου δεν αποστέλλονται ${
      inGreece ? 'στην Ελλάδα' : `στην περιοχή ${city}`
    }. Αφαιρέστε τα προϊόντα ψυγείου από το καλάθι σας για να συνεχίσετε.`,
  refrigeratedBlockedNotice: ({ inGreece, city }) =>
    `Δεν είναι δυνατή η παράδοση προϊόντων ψυγείου ${
      inGreece ? 'στην Ελλάδα' : `στην περιοχή ${city}`
    }. Αφαιρέστε τα προϊόντα ψυγείου από το καλάθι σας για να συνεχίσετε.`,
  billingLegend: 'Στοιχεία χρέωσης',
  firstName: 'Όνομα',
  lastName: 'Επώνυμο',
  phone: 'Τηλέφωνο',
  phoneCountry: 'Κωδικός χώρας',
  phoneSuggested: 'Προτεινόμενες',
  phoneAllCountries: 'Όλες οι χώρες',
  email: 'Διεύθυνση Email',
  countryRegion: 'Χώρα / Περιοχή',
  countryLabel: (value) => value,
  address: 'Διεύθυνση',
  streetPlaceholder: 'Αριθμός και όνομα οδού',
  address2Placeholder: 'Διαμέρισμα, όροφος, κ.λπ. (προαιρετικό)',
  city: 'Πόλη',
  cityLabel: (value) => value,
  acsTownLabel: (value) => value,
  acsPointLabel: (value) => value,
  selectCity: 'Επιλέξτε πόλη…',
  postal: 'Ταχ. Κώδικας',
  company: 'Επωνυμία εταιρείας (προαιρετικό)',
  vat: 'Α.Φ.Μ. (προαιρετικό)',
  shipDifferent: 'Αποστολή σε διαφορετική διεύθυνση',
  notes: 'Σημειώσεις παραγγελίας (προαιρετικό)',
  notesPlaceholder:
    'Σημειώσεις για την παραγγελία σας, π.χ. ειδικές οδηγίες για την παράδοση.',
  orderSummary: 'Η παραγγελία σας',
  decreaseQty: 'Μείωση ποσότητας',
  increaseQty: 'Αύξηση ποσότητας',
  quantity: 'Ποσότητα',
  deliveryLegend: 'Τρόπος παράδοσης',
  courierDelivery: 'Αποστολή με courier',
  homeDelivery: 'Παράδοση κατ’ οίκον',
  acsPickup: 'Παραλαβή από κατάστημα ACS',
  free: 'Δωρεάν',
  selectAcsPoint: 'Επιλέξτε σημείο παραλαβής ACS',
  selectAcsPointPlaceholder: 'Επιλέξτε σημείο παραλαβής…',
  paymentLegend: 'Τρόπος πληρωμής',
  cardPayment: 'Πιστωτική / Χρεωστική κάρτα',
  cardDetails: 'Στοιχεία κάρτας',
  securePaymentNote:
    'Ασφαλής πληρωμή μέσω Stripe. Δεν αποθηκεύουμε τα στοιχεία της κάρτας σας.',
  payAmount: (amount) => `Πληρωμή ${amount}`,
  processingPayment: 'Επεξεργασία πληρωμής…',
  finalisingOrder: 'Ολοκλήρωση παραγγελίας…',
  stripeTestModeNote:
    'Δοκιμαστική λειτουργία — χρησιμοποιήστε την κάρτα 4242 4242 4242 4242.',
  couponActive: (code) => `Κουπόνι «${code}» ενεργό`,
  remove: 'Αφαίρεση',
  couponCode: 'Κωδικός κουπονιού',
  apply: 'Εφαρμογή',
  subtotal: 'Υποσύνολο',
  discount: 'Έκπτωση',
  shipping: 'Μεταφορικά',
  total: 'Σύνολο',
  freeShippingRemaining: {
    pre: 'Προσθέστε ',
    post: ' ακόμη για δωρεάν μεταφορικά στην Κύπρο.',
  },
  freeShippingEarned: 'Κερδίσατε δωρεάν μεταφορικά!',
  freeShippingProgress: 'Πρόοδος για δωρεάν μεταφορικά',
  privacyPre:
    'Τα προσωπικά σας δεδομένα θα χρησιμοποιηθούν για την επεξεργασία της παραγγελίας σας, την υποστήριξη της εμπειρίας σας σε αυτόν τον ιστότοπο και για άλλους σκοπούς που περιγράφονται στην ',
  privacyLink: 'πολιτική απορρήτου',
  privacyPost: ' μας.',
  termsPre: 'Έχω διαβάσει και αποδέχομαι τους ',
  termsLink: 'όρους και προϋποθέσεις',
  termsPost: ' του ιστότοπου',
  newsletterOptIn:
    'Θέλω να λαμβάνω email με νέα, συνταγές και προσφορές από το Όρος Μαχαιρά. Μπορώ να διαγραφώ όποτε θέλω.',
  submit: 'Ολοκλήρωση παραγγελίας',
  submitting: 'Επεξεργασία…',
  testOrderNote: 'Δοκιμαστική παραγγελία — δεν πραγματοποιείται χρέωση.',
  thankYou: 'Ευχαριστούμε για την παραγγελία σας!',
  orderNumber: 'Αριθμός παραγγελίας:',
  confirmationEmail: (email) => `Θα στείλουμε επιβεβαίωση στο ${email}.`,
  orderPlacedFallback:
    'Η παραγγελία σας καταχωρήθηκε. Θα λάβετε σύντομα επιβεβαίωση μέσω email.',
}

const EN: CheckoutUi = {
  checkoutTitle: 'Checkout',
  orderTitle: 'Your order',
  orderNote: 'Thank you! Your order has been placed.',
  empty: 'Your cart is empty.',
  continueShopping: 'Continue shopping',
  variantError:
    'Some products in your cart need refreshing — remove them and add them again.',
  couponError: 'Invalid coupon code.',
  noRegionError: 'No shipping region is available.',
  emptyCartError: 'Your cart is empty or invalid.',
  freeShippingLostError:
    'Your order no longer qualifies for free shipping. Refresh the page and try again.',
  noShippingError: 'No shipping method is available.',
  noPaymentError: 'No payment method is available.',
  couponRejectedError:
    'The coupon code was not accepted for this order. Remove it and try again.',
  totalMismatchError: 'Your order total changed. Refresh the page and try again.',
  cardDeclinedError:
    'Payment was not completed. Check your card details or try another card.',
  orderFinalisationError: (ref) =>
    `Your payment went through, but we could not finalise the order. We have been notified and will contact you. Payment reference: ${ref}`,
  orderFailedError: 'Could not place your order. Check your details and try again.',
  couponMinimum: (min) => `This code applies to orders of ${min} or more.`,
  refrigeratedNotice: (items) => {
    const subject = items.map((it) => it.title).join(' and ')
    return items.length === 1
      ? `${subject} is a refrigerated product and is delivered to home addresses only (excluding Paphos, Famagusta & Greece).`
      : `${subject} are refrigerated products and are delivered to home addresses only (excluding Paphos, Famagusta & Greece).`
  },
  refrigeratedBlockedError: ({ inGreece, city }) =>
    `Refrigerated products cannot be shipped to ${
      inGreece ? 'Greece' : `the ${CITY_EN[city] ?? city} area`
    }. Remove the refrigerated products from your cart to continue.`,
  refrigeratedBlockedNotice: ({ inGreece, city }) =>
    `Refrigerated products cannot be delivered to ${
      inGreece ? 'Greece' : `the ${CITY_EN[city] ?? city} area`
    }. Remove the refrigerated products from your cart to continue.`,
  billingLegend: 'Billing details',
  firstName: 'First name',
  lastName: 'Last name',
  phone: 'Phone',
  phoneCountry: 'Country code',
  phoneSuggested: 'Suggested',
  phoneAllCountries: 'All countries',
  email: 'Email address',
  countryRegion: 'Country / Region',
  countryLabel: (value) => (value === 'Κύπρος' ? 'Cyprus' : value === 'Ελλάδα' ? 'Greece' : value),
  address: 'Address',
  streetPlaceholder: 'House number and street name',
  address2Placeholder: 'Apartment, floor, etc. (optional)',
  city: 'City',
  cityLabel: (value) => CITY_EN[value] ?? value,
  acsTownLabel: (value) => ACS_TOWN_EN[value] ?? value,
  acsPointLabel: (value) => ACS_POINT_EN[value] ?? value,
  selectCity: 'Select a city…',
  postal: 'Postal code',
  company: 'Company name (optional)',
  vat: 'VAT number (optional)',
  shipDifferent: 'Ship to a different address',
  notes: 'Order notes (optional)',
  notesPlaceholder: 'Notes about your order, e.g. special delivery instructions.',
  orderSummary: 'Your order',
  decreaseQty: 'Decrease quantity',
  increaseQty: 'Increase quantity',
  quantity: 'Quantity',
  deliveryLegend: 'Delivery method',
  courierDelivery: 'Courier delivery',
  homeDelivery: 'Home delivery',
  acsPickup: 'ACS store pickup',
  free: 'Free',
  selectAcsPoint: 'Select an ACS pickup point',
  selectAcsPointPlaceholder: 'Select a pickup point…',
  paymentLegend: 'Payment method',
  cardPayment: 'Credit / Debit card',
  cardDetails: 'Card details',
  securePaymentNote: 'Secure payment via Stripe. We never store your card details.',
  payAmount: (amount) => `Pay ${amount}`,
  processingPayment: 'Processing payment…',
  finalisingOrder: 'Finalising your order…',
  stripeTestModeNote: 'Test mode — use card 4242 4242 4242 4242.',
  couponActive: (code) => `Coupon “${code}” applied`,
  remove: 'Remove',
  couponCode: 'Coupon code',
  apply: 'Apply',
  subtotal: 'Subtotal',
  discount: 'Discount',
  shipping: 'Shipping',
  total: 'Total',
  freeShippingRemaining: {
    pre: 'Add ',
    post: ' more for free shipping to Cyprus.',
  },
  freeShippingEarned: 'You’ve earned free shipping!',
  freeShippingProgress: 'Progress toward free shipping',
  privacyPre:
    'Your personal data will be used to process your order, support your experience on this website, and for other purposes described in our ',
  privacyLink: 'privacy policy',
  privacyPost: '.',
  termsPre: 'I have read and accept the website ',
  termsLink: 'terms and conditions',
  termsPost: '',
  newsletterOptIn:
    'Send me emails with news, recipes and offers from Oros Machaira. I can unsubscribe at any time.',
  submit: 'Place order',
  submitting: 'Processing…',
  testOrderNote: 'Test order — no payment is taken.',
  thankYou: 'Thank you for your order!',
  orderNumber: 'Order number:',
  confirmationEmail: (email) => `We’ll send a confirmation to ${email}.`,
  orderPlacedFallback:
    'Your order has been placed. You’ll receive a confirmation by email shortly.',
}

export function getCheckoutUi(locale: string): CheckoutUi {
  return locale === 'en' ? EN : EL
}
