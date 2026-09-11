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
