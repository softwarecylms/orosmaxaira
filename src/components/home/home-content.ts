/**
 * Single source of truth for the bespoke OROS MACHAIRA home page.
 *
 * All Greek copy + image paths extracted from the Figma design
 * (node 118:359). Product/blog sections fall back to these constants and
 * swap to live Medusa / Payload data when it's available.
 */

export type Cta = { label: string; href: string }

/** Primary nav — Greek labels from the Figma header. A nav item can carry a flat
 *  `children` dropdown or a `groups` dropdown (titled sub-menus). */
export const NAV: {
  label: string
  href: string
  children?: { label: string; href: string }[]
  groups?: { title: string; links: { label: string; href: string }[] }[]
}[] = [
  { label: 'Αρχική', href: '/' },
  {
    label: 'Προϊόντα',
    href: '/proionta',
    children: [
      { label: 'Μέλι Όρος Μαχαιρά', href: '/' },
      { label: 'Προϊόντα Μέλισσας', href: '/' },
      { label: 'Φυσικά Καλλυντικά', href: '/' },
      { label: 'Πακέτα δώρων', href: '/' },
    ],
  },
  { label: 'Ποιοί είμαστε', href: '/poioi-eimaste' },
  {
    label: 'Δραστηριότητες',
    href: '/drastiriotites',
    groups: [
      {
        title: 'Εμπειρίες',
        links: [
          { label: 'Γνωρίζω τη Μέλισσα', href: '/drastiriotites/xenagiseis' },
          { label: 'Περιπέτειες στις Κυψέλες', href: '/drastiriotites/peripeteies-stis-kypseles' },
          { label: 'Εργαστήρια', href: '/drastiriotites/ergastiria' },
          { label: 'Μελισσοθεραπεία', href: '/drastiriotites/melissotherapeia' },
        ],
      },
      {
        title: 'Προγράμματα',
        links: [
          { label: 'Εκπαιδευτικές Επισκέψεις Σχολείων', href: '/drastiriotites/scholeia' },
          { label: 'Υιοθετώ μια κυψέλη', href: '/yiotheto-mia-kypseli' },
        ],
      },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: 'Επικοινωνία', href: '/epikoinonia' },
]

export const ADOPT_LINK: Cta = { label: 'Υιοθετώ μια κυψέλη', href: '/yiotheto-mia-kypseli' }
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
    href: '/proionta/meli',
    links: [
      { label: 'Μέλι Ανθέων', href: '/product/meli-antheon-oros-machaira' },
      { label: 'Άβραστο (άθερμο) Μέλι Ανθέων', href: '/product/avrasto-meli-antheon-oros-machaira' },
      { label: 'Θυμαρίσιο Μέλι', href: '/product/thymarisio-meli-oros-machaira' },
    ],
  },
  {
    title: 'Προϊόντα Μέλισσας',
    href: '/proionta/proionta-melissas',
    links: [
      { label: 'Υδρόμελο', href: '/product/ydromelo' },
      { label: 'Βασιλικός πολτός', href: '/product/vasilikos-poltos-oros-machaira' },
      { label: 'Μέλι με Φυστίκια', href: '/product/meli-me-fistikia' },
    ],
  },
  {
    title: 'Φυσικά Καλλυντικά',
    href: '/proionta/kallyntika',
    links: [
      { label: 'Κρέμα Σώματος', href: '/product/krema-somatos' },
      { label: 'Φυσική Κηραλοιφή Προσώπου', href: '/product/fysiki-kiraloifi-gia-prosopo' },
      { label: 'Βάλσαμο για τα Χείλη', href: '/product/valsamo-gia-ta-cheili' },
    ],
  },
  {
    title: 'Πακέτα δώρων',
    href: '/proionta/paketa-doron',
    links: [
      { label: 'Nourish Care Gift Set', href: '/product/nourish-care-gift-set' },
      { label: 'Everyday Care Duo Gift Set', href: '/product/everyday-care-duo-gift-set' },
      { label: 'Balance Care Gift Set', href: '/product/balance-care-gift-set' },
    ],
  },
]

export const ANNOUNCEMENT =
  'ΔΩΡΕΑΝ αποστολή στην Κύπρο για παραγγελίες άνω των €70'

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
    cta: { label: READ_MORE, href: '/proionta' },
    image: '/images/home/hero-jars.webp',
    imageAlt: 'Βραβευμένο μέλι Όρος Μαχαιρά σε ξύλινη βάση',
  },
  right: {
    eyebrow: 'ΒΙΩΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ',
    heading: 'Εργαστήρια & Εκδηλώσεις',
    body: 'Ελάτε στο βουνό και ζήστε τη μαγεία του μελισσιού μέσα από μοναδικά, διαδραστικά εργαστήρια για όλη την οικογένεια.',
    cta: { label: READ_MORE, href: '/drastiriotites' },
    image: '/images/home/hero-bee-comb.webp',
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
    title: 'Γρήγορη Παράδοση',
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
  'ΓΡΗΓΟΡΗ ΠΑΡΑΔΟΣΗ',
  'ΑΣΦΑΛΕΙΣ ONLINE ΠΛΗΡΩΜΕΣ',
  'ΟΙΚΟΛΟΓΙΚΗ ΣΥΝΕΙΔΗΣΗ',
  'ΓΡΗΓΟΡΗ ΕΞΥΠΗΡΕΤΗΣΗ',
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
  cta: { label: READ_MORE, href: '/proionta' },
  featured: {
    title: 'Το Ελιξίριο των Θεών',
    href: '/product/ydromelo',
    image: '/images/home/deal-featured.webp',
    imageAlt: 'Υδρόμελο Melite — Όρος Μαχαιρά',
  },
  products: [
    { category: 'Μέλι', title: 'Μέλι Ανθέων «Όρος Μαχαιρά»', price: '€3,50 – €31,00', image: '/images/home/deal-1.webp', href: '/product/meli-antheon-oros-machaira' },
    { category: 'Μέλι', title: 'Άβραστο (άθερμο) Μέλι Ανθέων «Όρος Μαχαιρά»', price: '€3,50 – €31,00', image: '/images/home/deal-2.webp', href: '/product/avrasto-meli-antheon-oros-machaira' },
    { category: 'Μέλι', title: 'Βασιλικός πολτός «Όρος Μαχαιρά»', price: '€3,50 – €31,00', image: '/images/home/deal-3.webp', href: '/product/vasilikos-poltos-oros-machaira' },
    { category: 'Μέλι', title: 'Υδρόμελο', price: '€3,50 – €31,00', image: '/images/home/deal-4.webp', href: '/product/ydromelo' },
    { category: 'Μέλι', title: 'Θυμαρίσιο Μέλι «Όρος Μαχαιρά»', price: '€3,50 – €31,00', image: '/images/home/deal-5.webp', href: '/product/thymarisio-meli-oros-machaira' },
  ] satisfies HoneyProduct[],
}

// --- Section 6: Product categories ---------------------------------------
export const CATEGORIES = {
  heading: 'Τα προϊόντα μας',
  cta: { label: READ_MORE, href: '/proionta' },
  items: [
    { title: 'Μέλι Όρος Μαχαιρά', image: '/images/home/cat-honey.webp', href: '/proionta/meli' },
    { title: 'Προϊόντα Μέλισσας', image: '/images/home/cat-bee-products.webp', href: '/proionta/proionta-melissas' },
    { title: 'Φυσικά Καλλυντικά', image: '/images/home/cat-cosmetics.webp', href: '/proionta/kallyntika' },
    { title: 'Πακέτα δώρων', image: '/images/home/cat-gifts.webp', href: '/proionta/paketa-doron' },
  ],
}

// --- Section 7: Adopt a hive banner --------------------------------------
export const ADOPT = {
  eyebrow: 'ΒΙΩΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ',
  heading: 'Υιοθετώ μια κυψέλη',
  body: 'Γίνε και εσύ με την ομάδα σου μέρος του προγράμματος "Υιοθετώ μια κυψέλη" και… "Bee-come a Hero" για τις μέλισσες και το περιβάλλον.',
  cta: { label: READ_MORE, href: '/yiotheto-mia-kypseli' },
  image: '/images/home/adopt-bee.webp',
  imageAlt: 'Μέλισσα πάνω σε κηρήθρα',
}

// --- Section 8: Heritage --------------------------------------------------
export type Segment = { text: string; bold?: boolean }
export const HERITAGE = {
  heading: 'Από γενιά σε γενιά',
  cta: { label: READ_MORE, href: '/poioi-eimaste' },
  image: '/images/home/family-photo.webp',
  imageAlt: 'Η οικογένεια Όρος Μαχαιρά',
  paragraphs: [
    [
      { text: 'Η ιστορία του μελιού ' },
      { text: '«Όρος Μαχαιρά» ', bold: true },
      { text: 'πάει πίσω στο 1983. Τότε ο Μιχάλης Φιλίππου άρχισε τη μελισοκομία μαζί με τον γαμπρό του, τον Κώστα Χειμώνα έχοντας πέντε κυψέλες τις οποίες πήραν από τον πατέρα του Κώστα Χειμώνα. Για 30 περίπου χρόνια δούλεψαν μαζί σκληρά και με ' },
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
      href: '/product/thymarisio-meli-oros-machaira',
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
  cta: { label: READ_MORE, href: '/blog' },
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
        { label: 'Ποιοί είμαστε', href: '/poioi-eimaste' },
        { label: 'Βραβεία', href: '/awards' },
        { label: 'Προϊόντα', href: '/proionta' },
        { label: 'Δραστηριότητες', href: '/drastiriotites' },
        { label: 'Υιοθετώ μια κυψέλη', href: '/yiotheto-mia-kypseli' },
        { label: 'Γνωρίζω τη Μέλισσα', href: '/drastiriotites/xenagiseis' },
        { label: 'Blog', href: '/blog' },
        { label: 'Επικοινωνία', href: '/epikoinonia' },
      ],
    },
    {
      title: 'Προϊόντα',
      links: [
        { label: 'Μέλι', href: '/proionta/meli' },
        { label: 'Προϊόντα Μέλισσας', href: '/proionta/proionta-melissas' },
        { label: 'Φυσικά Καλλυντικά', href: '/proionta/kallyntika' },
        { label: 'Πακέτα δώρων', href: '/proionta/paketa-doron' },
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
  policies: [
    { label: 'Παραγγελίες & Επιστροφές', href: '/paraggelies-kai-epistrofes' },
    { label: 'Πολιτική Αποστολών', href: '/politiki-apostolis-proionton' },
    { label: 'Πολιτική Απορρήτου & Cookies', href: '/privacy-amp-cookie-policy' },
  ],
}

// --- Bilingual bundle -----------------------------------------------------
// The Greek constants above are the source of truth and remain byte-identical.
// HOME_EN overrides only the user-facing text (hrefs/images/prices/positions and
// CONTACT/social are locale-invariant and reused). `getHomeContent(locale)`
// returns the right bundle; EN labels are the live site's own English copy where
// it exists (nav/footer/products) and faithful translations for the bespoke
// home-page sections (which the live EN site lays out differently).

const HOME_EL = {
  NAV, ADOPT_LINK, READ_MORE, MEGA_MENU, ANNOUNCEMENT, CONTACT, HERO, TRUST,
  TICKER, DEAL, CATEGORIES, ADOPT, HERITAGE, FLATLAY, BLOG, SEARCH_PLACEHOLDER,
  SEARCH_PLACEHOLDERS, FOOTER,
}
export type HomeContent = typeof HOME_EL

const HOME_EN: HomeContent = {
  READ_MORE: 'Learn More',
  ANNOUNCEMENT: 'FREE shipping in Cyprus for orders over €70',
  CONTACT,
  SEARCH_PLACEHOLDER: '🍯 Honey',
  SEARCH_PLACEHOLDERS: ['🍯 Honey', '🥜 Honey with Peanuts', '🥃 Mead'],
  ADOPT_LINK: { label: 'Adopt a Hive', href: ADOPT_LINK.href },
  NAV: [
    { label: 'Home', href: '/' },
    {
      label: 'Products',
      href: '/proionta',
      children: [
        { label: 'Oros Machaira Honey', href: '/' },
        { label: 'Bee Products', href: '/' },
        { label: 'Natural Cosmetics', href: '/' },
        { label: 'Gift Sets', href: '/' },
      ],
    },
    { label: 'About Us', href: '/poioi-eimaste' },
    {
      label: 'Activities',
      href: '/drastiriotites',
      groups: [
        {
          title: 'Experiences',
          links: [
            { label: 'Getting to Know the Bee', href: '/drastiriotites/xenagiseis' },
            { label: 'Adventures in the Beehives', href: '/drastiriotites/peripeteies-stis-kypseles' },
            { label: 'Workshops', href: '/drastiriotites/ergastiria' },
            { label: 'Bee Therapy', href: '/drastiriotites/melissotherapeia' },
          ],
        },
        {
          title: 'Programs',
          links: [
            { label: 'School Educational Visits', href: '/drastiriotites/scholeia' },
            { label: 'Adopt a Hive', href: '/yiotheto-mia-kypseli' },
          ],
        },
      ],
    },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/epikoinonia' },
  ],
  MEGA_MENU: [
    {
      title: 'Honey',
      href: '/proionta/meli',
      links: [
        { label: 'Flower Honey', href: '/product/meli-antheon-oros-machaira' },
        { label: 'Raw (Unheated) Flower Honey', href: '/product/avrasto-meli-antheon-oros-machaira' },
        { label: 'Thyme Honey', href: '/product/thymarisio-meli-oros-machaira' },
      ],
    },
    {
      title: 'Bee Products',
      href: '/proionta/proionta-melissas',
      links: [
        { label: 'Mead', href: '/product/ydromelo' },
        { label: 'Royal Jelly', href: '/product/vasilikos-poltos-oros-machaira' },
        { label: 'Honey with Peanuts', href: '/product/meli-me-fistikia' },
      ],
    },
    {
      title: 'Natural Cosmetics',
      href: '/proionta/kallyntika',
      links: [
        { label: 'Body Cream', href: '/product/krema-somatos' },
        { label: 'Natural Face Balm', href: '/product/fysiki-kiraloifi-gia-prosopo' },
        { label: 'Lip Balm', href: '/product/valsamo-gia-ta-cheili' },
      ],
    },
    {
      title: 'Gift Sets',
      href: '/proionta/paketa-doron',
      links: [
        { label: 'Nourish Care Gift Set', href: '/product/nourish-care-gift-set' },
        { label: 'Everyday Care Duo Gift Set', href: '/product/everyday-care-duo-gift-set' },
        { label: 'Balance Care Gift Set', href: '/product/balance-care-gift-set' },
      ],
    },
  ],
  HERO: {
    left: {
      eyebrow: 'AUTHENTIC TRADITION',
      heading: 'Treasures of the Hive',
      body: 'Discover our award-winning honey, our fine mead and our royal jelly, among others.',
      cta: { label: 'Learn More', href: HERO.left.cta.href },
      image: HERO.left.image,
      imageAlt: 'Award-winning Oros Machaira honey on a wooden stand',
    },
    right: {
      eyebrow: 'HANDS-ON EXPERIENCE',
      heading: 'Workshops & Events',
      body: 'Come up to the mountain and live the magic of the apiary through unique, interactive workshops for the whole family.',
      cta: { label: 'Learn More', href: HERO.right.cta.href },
      image: HERO.right.image,
      imageAlt: 'A bee on a honeycomb',
    },
  },
  TRUST: [
    { icon: 'purity', title: '100% Purity Guarantee', body: 'Straight from our apiary in Melini, with no additives.' },
    { icon: 'delivery', title: 'Fast Delivery', body: 'Fast and secure shipping of your order.' },
    { icon: 'eco', title: 'Eco Conscious', body: 'We use recyclable and sustainable packaging materials.' },
    { icon: 'payment', title: 'Secure Online Payments', body: 'Shop with confidence using a credit/debit card.' },
  ],
  TICKER: ['100% PURITY GUARANTEE', 'FAST DELIVERY', 'SECURE ONLINE PAYMENTS', 'ECO CONSCIOUS', 'FAST SERVICE'],
  DEAL: {
    heading: 'The Diamonds of Machaira',
    cta: { label: 'Learn More', href: DEAL.cta.href },
    featured: { ...DEAL.featured, title: 'The Elixir of the Gods', imageAlt: 'Melite Mead — Oros Machaira' },
    products: [
      { ...DEAL.products[0], category: 'Honey', title: 'Flower Honey «Oros Machaira»' },
      { ...DEAL.products[1], category: 'Honey', title: 'Raw (Unheated) Flower Honey «Oros Machaira»' },
      { ...DEAL.products[2], category: 'Honey', title: 'Royal Jelly «Oros Machaira»' },
      { ...DEAL.products[3], category: 'Honey', title: 'Mead' },
      { ...DEAL.products[4], category: 'Honey', title: 'Thyme Honey «Oros Machaira»' },
    ],
  },
  CATEGORIES: {
    heading: 'Our Products',
    cta: { label: 'Learn More', href: CATEGORIES.cta.href },
    items: [
      { ...CATEGORIES.items[0], title: 'Oros Machaira Honey' },
      { ...CATEGORIES.items[1], title: 'Bee Products' },
      { ...CATEGORIES.items[2], title: 'Natural Cosmetics' },
      { ...CATEGORIES.items[3], title: 'Gift Sets' },
    ],
  },
  ADOPT: {
    ...ADOPT,
    eyebrow: 'HANDS-ON EXPERIENCE',
    heading: 'Adopt a Hive',
    body: 'Join the “Adopt a Hive” programme with your team and… “Bee-come a Hero” for the bees and the environment.',
    cta: { label: 'Learn More', href: ADOPT.cta.href },
    imageAlt: 'A bee on a honeycomb',
  },
  HERITAGE: {
    heading: 'From Generation to Generation',
    cta: { label: 'Learn More', href: HERITAGE.cta.href },
    image: HERITAGE.image,
    imageAlt: 'The Oros Machaira family',
    paragraphs: [
      [
        { text: 'The story of ' },
        { text: '«Oros Machaira» ', bold: true },
        { text: 'honey goes back to 1983, when Michalis Filippou began beekeeping together with his son-in-law, Costas Chimonas, starting with five hives they received from Costas Chimonas’s father. For around 30 years they worked hard together, with ' },
        { text: 'a love for nature', bold: true },
        { text: ', for the bee and its products.' },
      ],
      [
        { text: 'Once their children had grown up, they decided it would be best for the whole family for each to follow his own path. The sons of Michalis Filippou have today taken the reins of the company, which produces the full range of bee products, packages them and brings them to market under the «Oros Machaira» brand.' },
      ],
    ],
  },
  FLATLAY: {
    image: FLATLAY.image,
    imageAlt: 'Oros Machaira products on a marble surface',
    prices: [
      { ...FLATLAY.prices[0], product: { ...FLATLAY.prices[0].product, category: 'Honey', title: 'Flower Honey «Oros Machaira»' } },
      { ...FLATLAY.prices[1], product: { ...FLATLAY.prices[1].product, category: 'Honey', title: 'Thyme Honey «Oros Machaira»' } },
      { ...FLATLAY.prices[2], product: { ...FLATLAY.prices[2].product, category: 'Bee Products', title: 'Mead «Oros Machaira»' } },
      { ...FLATLAY.prices[3], product: { ...FLATLAY.prices[3].product, category: 'Bee Products', title: 'Royal Jelly «Oros Machaira»' } },
      { ...FLATLAY.prices[4], product: { ...FLATLAY.prices[4].product, category: 'Natural Cosmetics', title: 'Milk & Honey Hand Cream' } },
    ],
  },
  BLOG: {
    heading: 'The World of Bees & Nature',
    cta: { label: 'Learn More', href: BLOG.cta.href },
    badge: 'Articles',
    featured: {
      ...BLOG.featured,
      imageAlt: 'Pure Cypriot Oros Machaira honey',
      title: 'Where to Buy Pure Cypriot Honey in Cyprus',
      excerpt:
        'Locally produced, pure natural honey isn’t just a matter of trend or luxury — it’s a matter of health and sustainability…',
    },
    items: [
      { ...BLOG.items[0], title: 'M.F. Oros Machaira Ltd Strengthens its Sustainability with Specialised Support and EU Co-financing' },
      { ...BLOG.items[1], title: 'Reviving the Cypriot native bee: an innovative collaboration to preserve and identify the breed' },
    ],
  },
  FOOTER: {
    tagline: '100% raw honey from the flowers and herbs of Machaira.',
    columns: [
      {
        title: 'Useful Links',
        links: [
          { label: 'Home', href: '/' },
          { label: 'About Us', href: '/poioi-eimaste' },
          { label: 'Awards', href: '/awards' },
          { label: 'Products', href: '/proionta' },
          { label: 'Activities', href: '/drastiriotites' },
          { label: 'Adopt a Hive', href: '/yiotheto-mia-kypseli' },
          { label: 'Getting to Know the Bee', href: '/drastiriotites/xenagiseis' },
          { label: 'Blog', href: '/blog' },
          { label: 'Contact', href: '/epikoinonia' },
        ],
      },
      {
        title: 'Products',
        links: [
          { label: 'Honey', href: '/proionta/meli' },
          { label: 'Bee Products', href: '/proionta/proionta-melissas' },
          { label: 'Natural Cosmetics', href: '/proionta/kallyntika' },
          { label: 'Gift Sets', href: '/proionta/paketa-doron' },
        ],
      },
      {
        title: 'Contact',
        lines: [
          'M.F. (OROS MAXAIRA) LTD.',
          'Tel.: +357 25622305',
          'Melini, Larnaca 7716',
          'P.O.BOX: 7718',
          'Mon–Fri 08:00 – 16:00',
          'info@orosmaxaira.com',
        ],
      },
    ],
    social: FOOTER.social,
    legal: '© 2026 Oros Machaira | All rights reserved | Powered and Designed by',
    legalBrand: FOOTER.legalBrand,
    legalBrandHref: FOOTER.legalBrandHref,
    policies: [
      { label: 'Orders & Returns', href: '/paraggelies-kai-epistrofes' },
      { label: 'Shipping Policy', href: '/politiki-apostolis-proionton' },
      { label: 'Privacy & Cookie Policy', href: '/privacy-amp-cookie-policy' },
    ],
  },
}

/** Locale-aware home/chrome content. el = the Greek source of truth, en = the
 *  English bundle above. Read the active locale via next-intl's
 *  `getLocale()` (server) / `useLocale()` (client) at the call site. */
export function getHomeContent(locale: string): HomeContent {
  return locale === 'en' ? HOME_EN : HOME_EL
}
