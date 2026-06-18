/**
 * Single source of truth for the bespoke OROS MACHAIRA home page.
 *
 * All Greek copy + image paths extracted from the Figma design
 * (node 118:359). Product/blog sections fall back to these constants and
 * swap to live Medusa / Payload data when it's available.
 */

export type Cta = { label: string; href: string }

/** Primary nav — Greek labels from the Figma header. */
export const NAV: { label: string; href: string; children?: { label: string; href: string }[] }[] = [
  { label: 'Αρχική', href: '/' },
  {
    label: 'Προϊόντα',
    href: '/',
    children: [
      { label: 'Μέλι Όρος Μαχαιρά', href: '/' },
      { label: 'Προϊόντα Μέλισσας', href: '/' },
      { label: 'Φυσικά Καλλυντικά', href: '/' },
      { label: 'Πακέτα δώρων', href: '/' },
    ],
  },
  { label: 'Ποιοί είμαστε', href: '/' },
  { label: 'Δραστηριότητες', href: '/' },
  { label: 'Blog', href: '/' },
  { label: 'Επικοινωνία', href: '/' },
]

export const ADOPT_LINK: Cta = { label: 'Υιοθετώ μια κυψέλη', href: '/' }
export const READ_MORE = 'Δείτε περισσότερα'

/** Mega menu shown on hover of "Προϊόντα" (Figma 305:2612). */
export type MegaColumn = {
  title: string
  href: string
  links: { label: string; href: string }[]
}
export const MEGA_MENU: MegaColumn[] = [
  {
    title: 'Μέλι',
    href: '/',
    links: [
      { label: 'Μέλι Ανθέων', href: '/' },
      { label: 'Άβραστο (άθερμο) Μέλι Ανθέων', href: '/' },
      { label: 'Θυμαρίσιο Μέλι', href: '/' },
    ],
  },
  {
    title: 'Προϊόντα Μέλισσας',
    href: '/',
    links: [
      { label: 'Υδρόμελο', href: '/' },
      { label: 'Βασιλικός πολτός', href: '/' },
      { label: 'Μέλι με Φυστίκια', href: '/' },
    ],
  },
  {
    title: 'Φυσικά Καλλυντικά',
    href: '/',
    links: [
      { label: 'Κρέμα Σώματος', href: '/' },
      { label: 'Φυσική Κηραλοιφή Προσώπου', href: '/' },
      { label: 'Βάλσαμο για τα Χείλη', href: '/' },
    ],
  },
  {
    title: 'Πακέτα δώρων',
    href: '/',
    links: [
      { label: 'Nourish Care Gift Set', href: '/' },
      { label: 'Everyday Care Duo Gift Set', href: '/' },
      { label: 'Balance Care Gift Set', href: '/' },
    ],
  },
]

export const ANNOUNCEMENT =
  'ΔΩΡΕΑΝ αποστολή σε όλες τις παραγγελίες άνω των €70'

export const CONTACT = {
  phone: '+357 25622305',
  phoneShort: '25 622305',
  phoneHref: 'tel:+35725622305',
  email: 'info@orosmaxaira.com',
}

// --- Section 2: Hero pair -------------------------------------------------
export const HERO = {
  left: {
    eyebrow: 'ΑΥΘΕΝΤΙΚΗ ΠΑΡΑΔΟΣΗ',
    heading: 'Οι Θησαυροί της Κυψέλης',
    body: 'Ανακαλύψτε μεταξύ άλλων το βραβευμένο μας μέλι, το εκλεκτό υδρόμελο και τον βασιλικό πολτό μας.',
    cta: { label: READ_MORE, href: '/' },
    image: '/images/home/hero-jars.webp',
    imageAlt: 'Βραβευμένο μέλι Όρος Μαχαιρά σε ξύλινη βάση',
  },
  right: {
    eyebrow: 'ΒΙΩΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ',
    heading: 'Εργαστήρια & Εκδηλώσεις',
    body: 'Ελάτε στο βουνό και ζήστε τη μαγεία του μελισσιού μέσα από μοναδικά, διαδραστικά εργαστήρια για όλη την οικογένεια.',
    cta: { label: READ_MORE, href: '/' },
    image: '/images/home/hero-bee.webp',
    imageAlt: 'Μέλισσα πάνω σε κηρήθρα',
  },
}

// --- Section 3: Trust badges ----------------------------------------------
export type TrustIcon = 'purity' | 'delivery' | 'eco' | 'payment'
export const TRUST: { icon: TrustIcon; title: string; body: string }[] = [
  {
    icon: 'purity',
    title: '100% Εγγύηση Αγνότητας',
    body: 'Απευθείας από το μελισσοκομείο μας στη Μελίνη, χωρίς προσθήκες.',
  },
  {
    icon: 'delivery',
    title: 'Άμεση Παράδοση',
    body: 'Γρήγορη και ασφαλής αποστολή της παραγγελίας σας.',
  },
  {
    icon: 'eco',
    title: 'Οικολογική Συνείδηση',
    body: 'Χρησιμοποιούμε ανακυκλώσιμα και βιώσιμα υλικά συσκευασίας.',
  },
  {
    icon: 'payment',
    title: 'Ασφαλείς Online Πληρωμές',
    body: 'Αγοράστε με σιγουριά χρησιμοποιώντας πιστωτική/χρεωστική κάρτα.',
  },
]

// --- Section 5: Ticker strip ----------------------------------------------
export const TICKER: string[] = [
  '100% ΕΓΓΥΗΣΗ ΑΓΝΟΤΗΤΑΣ',
  'ΑΜΕΣΗ ΠΑΡΑΔΟΣΗ',
  'ΑΣΦΑΛΕΙΣ ONLINE ΠΛΗΡΩΜΕΣ',
  'ΟΙΚΟΛΟΓΙΚΗ ΣΥΝΕΙΔΗΣΗ',
  'ΑΜΕΣΗ ΕΞΥΠΗΡΕΤΗΣΗ',
]

// --- Section 4: Deal of the month ----------------------------------------
export type HoneyProduct = {
  href: string
  image: string
  imageAlt?: string
  category: string
  title: string
  price: string
}

export const DEAL = {
  heading: 'Τα Διαμάντια του Μαχαιρά',
  cta: { label: READ_MORE, href: '/' },
  featured: {
    title: 'Το Ελιξίριο των Θεών',
    href: '/',
    image: '/images/home/deal-featured.webp',
    imageAlt: 'Υδρόμελο Melite — Όρος Μαχαιρά',
  },
  products: [
    { category: 'Μέλι', title: 'Μέλι Ανθέων «Όρος Μαχαιρά»', price: '€3,50 – €31,00', image: '/images/home/deal-1.webp', href: '/' },
    { category: 'Μέλι', title: 'Άβραστο (άθερμο) Μέλι Ανθέων «Όρος Μαχαιρά»', price: '€3,50 – €31,00', image: '/images/home/deal-2.webp', href: '/' },
    { category: 'Μέλι', title: 'Βασιλικός πολτός «Όρος Μαχαιρά»', price: '€3,50 – €31,00', image: '/images/home/deal-3.webp', href: '/' },
    { category: 'Μέλι', title: 'Υδρόμελο', price: '€3,50 – €31,00', image: '/images/home/deal-4.webp', href: '/' },
    { category: 'Μέλι', title: 'Θυμαρίσιο Μέλι «Όρος Μαχαιρά»', price: '€3,50 – €31,00', image: '/images/home/deal-5.webp', href: '/' },
  ] satisfies HoneyProduct[],
}

// --- Section 6: Product categories ---------------------------------------
export const CATEGORIES = {
  heading: 'Τα προϊόντα μας',
  cta: { label: READ_MORE, href: '/' },
  items: [
    { title: 'Μέλι Όρος Μαχαιρά', image: '/images/home/cat-honey.webp', href: '/' },
    { title: 'Προϊόντα Μέλισσας', image: '/images/home/cat-bee-products.webp', href: '/' },
    { title: 'Φυσικά Καλλυντικά', image: '/images/home/cat-cosmetics.webp', href: '/' },
    { title: 'Πακέτα δώρων', image: '/images/home/cat-gifts.webp', href: '/' },
  ],
}

// --- Section 7: Adopt a hive banner --------------------------------------
export const ADOPT = {
  eyebrow: 'ΒΙΩΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ',
  heading: 'Υιοθετώ μια κυψέλη',
  body: 'Γίνε και εσύ με την ομάδα σου μέρος του προγράμματος "Υιοθετώ μια κυψέλη" και… "Bee-come a Hero" για τις μέλισσες και το περιβάλλον.',
  cta: { label: READ_MORE, href: '/' },
  image: '/images/home/adopt-bee.webp',
  imageAlt: 'Μέλισσα πάνω σε κηρήθρα',
}

// --- Section 8: Heritage --------------------------------------------------
export type Segment = { text: string; bold?: boolean }
export const HERITAGE = {
  heading: 'Από γενιά σε γενιά',
  cta: { label: READ_MORE, href: '/' },
  image: '/images/home/family-photo.webp',
  imageAlt: 'Η οικογένεια Όρος Μαχαιρά',
  paragraphs: [
    [
      { text: 'Η ιστορία του μελιού ' },
      { text: '«Όρος Μαχαιρά» ', bold: true },
      { text: 'πάει πίσω στο 1983. Τότε ο Μιχάλης Φιλίππου άρχισε τη μελισοκομία μαζί με τον γαμπρό του, τον Κώστα Χειμώνα έχοντας πέντε κυψέλες τις οποίες πήραν από τον πατέρα του Κώστα Χειμώνα. Για 30 περίπου χρόνια δούλεψα μαζί σκληρά και με ' },
      { text: 'αγάπη για τη φύση', bold: true },
      { text: ', τη μέλισσα και τα προϊόντα της.' },
    ],
    [
      { text: 'Αφού μεγάλωσαν τα παιδιά τους αποφάσισαν ότι θα ήταν καλύτερα για όλη την οικογένεια ο καθένας να τραβήξει τον δρόμο του. Οι γιοι του Μιχάλη Φιλίππου ανέλαβαν σήμερα τα ηνία της εταιρείας η οποία δραστηριοποιείται στην παραγωγή όλων των προϊόντων της μέλισσας, στην συσκευασία τους και στην διάθεσή τους στην αγορά με την επωνυμία «Όρος Μαχαιρά».' },
    ],
  ] satisfies Segment[][],
}

// --- Section 9: Flatlay band ---------------------------------------------
export type FlatlayPrice = {
  value: string
  /** Position over the wide desktop crop (lg+). */
  left: string
  top: string
  /** Position over the full square image shown on mobile/tablet (< lg). */
  mLeft: string
  mTop: string
  href: string
  /** Which way the hover quick-view card opens. */
  placement: 'top' | 'bottom'
  product: { category: string; title: string; price: string; image: string }
}

export const FLATLAY: {
  image: string
  imageAlt: string
  prices: FlatlayPrice[]
} = {
  image: '/images/home/products-bg.jpg',
  imageAlt: 'Προϊόντα Όρος Μαχαιρά σε μαρμάρινη επιφάνεια',
  prices: [
    {
      value: '7,50',
      left: '27%',
      top: '31%',
      mLeft: '28%',
      mTop: '28%',
      href: '/',
      placement: 'bottom',
      product: {
        category: 'Μέλι',
        title: 'Μέλι Ανθέων «Όρος Μαχαιρά»',
        price: '€3,50 – €31,00',
        image: '/images/home/products/unheated-honey.webp',
      },
    },
    {
      value: '12,50',
      left: '80%',
      top: '31%',
      mLeft: '75%',
      mTop: '33%',
      href: '/',
      placement: 'bottom',
      product: {
        category: 'Μέλι',
        title: 'Θυμαρίσιο Μέλι «Όρος Μαχαιρά»',
        price: '€4,00 – €33,00',
        image: '/images/home/products/thyme-honey.webp',
      },
    },
    {
      value: '16,00',
      left: '49%',
      top: '59%',
      mLeft: '50%',
      mTop: '53%',
      href: '/',
      placement: 'top',
      product: {
        category: 'Προϊόντα Μέλισσας',
        title: 'Υδρόμελο «Όρος Μαχαιρά»',
        price: '€16,00',
        image: '/images/home/products/mead.webp',
      },
    },
    {
      value: '22,00',
      left: '72%',
      top: '71%',
      mLeft: '71%',
      mTop: '62%',
      href: '/',
      placement: 'top',
      product: {
        category: 'Προϊόντα Μέλισσας',
        title: 'Βασιλικός Πολτός «Όρος Μαχαιρά»',
        price: '€22,00',
        image: '/images/home/products/royal-jelly.webp',
      },
    },
    {
      value: '9,90',
      left: '30%',
      top: '83%',
      mLeft: '32%',
      mTop: '74%',
      href: '/',
      placement: 'top',
      product: {
        category: 'Φυσικά Καλλυντικά',
        title: 'Κρέμα Χεριών Milk & Honey',
        price: '€9,90',
        image: '/images/home/products/hand-cream.webp',
      },
    },
  ],
}

// --- Section 10: Blog -----------------------------------------------------
export const BLOG = {
  heading: 'Ο Κόσμος της Μέλισσας & της Φύσης',
  cta: { label: READ_MORE, href: '/' },
  badge: 'Άρθρα',
  featured: {
    image: '/images/home/blog-featured.webp',
    imageAlt: 'Αγνό κυπριακό μέλι Όρος Μαχαιρά',
    title: 'Πού να Αγοράσεις Αγνό Κυπριακό Μέλι στην Κύπρο',
    excerpt:
      'Το φυσικό αγνό μέλι τοπικής παραγωγής δεν είναι απλά θέμα trend η πολυτέλειας, είναι και θέμα υγείας και βιωσιμότητας...',
    author: 'orosmachaira',
    avatar: '/images/home/blog-avatar.webp',
    href: '/',
  },
  items: [
    {
      image: '/images/home/blog-1.webp',
      title:
        'Η Μ.Φ. Όρος Μαχαιρά Λτδ Ενισχύει τη Βιωσιμότητά της με Εξειδικευμένη Υποστήριξη και Συγχρηματοδότηση της ΕΕ',
      href: '/',
    },
    {
      image: '/images/home/blog-2.webp',
      title:
        'Αναβίωση της κυπριακής αυτόχθονης μέλισσας: Καινοτόμος συνεργασία για την διατήρηση και ταυτοποίηση της φυλής',
      href: '/',
    },
  ],
}

// --- Header + Footer ------------------------------------------------------
export const SEARCH_PLACEHOLDER = '🍯 Μέλι'
/** Rotating search placeholders (🥃 ≈ the brown Melite mead bottle). */
export const SEARCH_PLACEHOLDERS = ['🍯 Μέλι', '🥜 Μέλι με Φυστίκια', '🥃 Υδρόμελο']

export const FOOTER = {
  tagline: '100% ανεπεξέργαστο μέλι από τα άνθη και τα βότανα του Μαχαιρά.',
  columns: [
    {
      title: 'Χρήσιμοι Σύνδεσμοι',
      links: [
        { label: 'Αρχική', href: '/' },
        { label: 'Ποιοί είμαστε', href: '/' },
        { label: 'Προϊόντα', href: '/' },
        { label: 'Δραστηριότητες', href: '/' },
        { label: 'Υιοθετώ μια κυψέλη', href: '/' },
        { label: 'Blog', href: '/' },
        { label: 'Επικοινωνία', href: '/' },
      ],
    },
    {
      title: 'Προϊόντα',
      links: [
        { label: 'Μέλι', href: '/' },
        { label: 'Φυσικά Καλλυντικά', href: '/' },
        { label: 'Πακέτα δώρων', href: '/' },
      ],
    },
    {
      title: 'Επικοινωνία',
      lines: [
        'M.F. (OROS MAXAIRA) LTD.',
        'Τηλ.: +357 25622305',
        'Μελίνη, Λάρνακα 7716',
        'P.O.BOX: 7718',
        'Δε-Πα 08:00 – 16:00',
        'info@orosmaxaira.com',
      ],
    },
  ],
  social: [
    { name: 'Facebook', href: 'https://www.facebook.com/orosmaxaira' },
    { name: 'Instagram', href: 'https://www.instagram.com/oros_maxaira/' },
    { name: 'YouTube', href: 'https://www.youtube.com/channel/UCUY_LTKIT5W3GRl8-K7D6rA' },
    { name: 'Pinterest', href: 'https://www.pinterest.com/orosmaxaira_/' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/oros-maxaira/' },
  ],
  legal: '© 2026 Oros Machaira | All rights reserved | Powered and Designed by',
  legalBrand: 'SoftwareCy',
  legalBrandHref: 'https://softwarecy.com',
  policies: 'Παραγγελίες & Επιστροφές | Πολιτική Αποστολών | Πολιτική Απορρήτου & Cookies',
}
