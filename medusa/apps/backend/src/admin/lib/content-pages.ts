/**
 * The editable pages of the site, as the content editor presents them: name,
 * group, where the page lives (for the live preview), what its sections are
 * called, and per-page field rules. The content itself — its shape and values —
 * comes from the entry stored in Medusa; this file only labels it.
 *
 * Keys match the storefront's src/lib/content/registry.ts.
 */

export type ContentPage = {
  key: string
  label: string
  group: "Γενικά" | "Σελίδες" | "Νομικά"
  /** Greek path of the page shown in the preview. */
  path: string
  description?: string
  /** Label per top-level key (each is one section of the page). */
  sections?: Record<string, string>
  /** Keys that are per-language on this page although usually shared (e.g. an
   *  image that has English text in it). */
  translatable?: string[]
}

export const CONTENT_PAGES: ContentPage[] = [
  {
    key: "site",
    label: "Κεφαλίδα & υποσέλιδο",
    group: "Γενικά",
    path: "/",
    description: "Μενού, μέγα-μενού προϊόντων, στοιχεία επικοινωνίας, υποσέλιδο — σε όλες τις σελίδες.",
    sections: {
      NAV: "Κύριο μενού",
      ADOPT_LINK: "Σύνδεσμος «Υιοθετώ μια κυψέλη»",
      MEGA_MENU: "Μέγα-μενού προϊόντων",
      CONTACT: "Στοιχεία επικοινωνίας",
      SEARCH_PLACEHOLDERS: "Αναζήτηση — ενδείξεις",
      SEARCH_PLACEHOLDER: "Αναζήτηση — βασική ένδειξη",
      FOOTER: "Υποσέλιδο",
      ANNOUNCEMENT: "Ανακοίνωση (παλιά)",
      READ_MORE: "Κείμενο «Διαβάστε περισσότερα»",
    },
  },
  {
    key: "home",
    label: "Αρχική",
    group: "Σελίδες",
    path: "/",
    sections: {
      HERO: "Κεντρικές κάρτες",
      TRUST: "Εγγυήσεις",
      DEAL: "Τα Διαμάντια του Μαχαιρά",
      TICKER: "Κυλιόμενη λωρίδα",
      CATEGORIES: "Κατηγορίες προϊόντων",
      ADOPT: "Υιοθετώ μια κυψέλη",
      HERITAGE: "Η ιστορία μας",
      FLATLAY: "Προϊόντα στη φωτογραφία",
      BLOG: "Blog",
    },
  },
  {
    key: "about",
    label: "Ποιοι είμαστε",
    group: "Σελίδες",
    path: "/poioi-eimaste/",
    sections: {
      meta: "SEO",
      breadcrumb: "Διαδρομή (breadcrumb)",
      hero: "Κεντρική ενότητα",
      stats: "Αριθμοί",
      values: "Αξίες",
      indoor: "Εσωτερικοί χώροι",
      outdoor: "Εξωτερικοί χώροι",
      band: "Λωρίδα",
      family: "Η οικογένεια",
      goal: "Ο στόχος μας",
    },
  },
  {
    key: "contact",
    label: "Επικοινωνία",
    group: "Σελίδες",
    path: "/epikoinonia/",
    sections: {
      meta: "SEO",
      breadcrumb: "Διαδρομή (breadcrumb)",
      hero: "Κεντρική ενότητα",
      map: "Χάρτης",
      connect: "Κάρτες επικοινωνίας",
      form: "Φόρμα",
      values: "Αξίες",
    },
  },
  {
    key: "adopt",
    label: "Υιοθετώ μια κυψέλη",
    group: "Σελίδες",
    path: "/yiotheto-mia-kypseli/",
    sections: {
      meta: "SEO",
      hero: "Κεντρική ενότητα",
      stats: "Αριθμοί",
      intro: "Εισαγωγή & οφέλη",
      package: "Το πακέτο",
      visits: "Επισκέψεις",
      gallery: "Γκαλερί",
      goal: "Ο στόχος μας",
      progress: "Πρόοδος υιοθεσιών",
      faq: "Συχνές ερωτήσεις",
      partners: "Συνεργάτες",
      testimonials: "Μαρτυρίες",
      form: "Φόρμα",
      cta: "Κλείσιμο (επικοινωνία)",
    },
  },
  {
    key: "activities",
    label: "Δραστηριότητες (αρχική)",
    group: "Σελίδες",
    path: "/drastiriotites/",
    description: "Η σελίδα-κατάλογος. Κάθε δραστηριότητα έχει τη δική της σελίδα στις «Δραστηριότητες».",
    sections: {
      hero: "Κεντρική ενότητα",
      experiences: "Εμπειρίες",
      programs: "Προγράμματα",
      fact: "Λωρίδα με στοιχείο",
      cta: "Κλείσιμο",
    },
  },
  {
    key: "certificates",
    label: "Πιστοποιήσεις",
    group: "Σελίδες",
    path: "/pistopioiseis/",
    sections: { hero: "Κεντρική ενότητα", intro: "Εισαγωγή", certificates: "Πιστοποιητικά" },
    translatable: ["image", "pdfEn"],
  },
  {
    key: "awards",
    label: "Βραβεία",
    group: "Σελίδες",
    path: "/vraveia/",
    sections: { breadcrumb: "Διαδρομή (breadcrumb)", hero: "Κεντρική ενότητα", awards: "Βραβεία" },
  },
  {
    key: "nature",
    label: "Αφανείς ήρωες της φύσης",
    group: "Σελίδες",
    path: "/afaneis-iroes-tis-fysis/",
    sections: {
      hero: "Κεντρική ενότητα",
      sections: "Ενότητες",
      stats: "Αριθμοί",
      matters: "Γιατί μετράει",
      adoptBody: "Υιοθεσία — κείμενο",
    },
  },
  ...(
    [
      ["legal.terms", "Όροι & Προϋποθέσεις", "/terms/"],
      ["legal.privacy", "Πολιτική Απορρήτου & Cookies", "/privacy-amp-cookie-policy/"],
      ["legal.orders", "Παραγγελίες & Επιστροφές", "/paraggelies-kai-epistrofes/"],
      ["legal.shipping", "Πολιτική Αποστολής", "/politiki-apostolis-proionton/"],
    ] as const
  ).map(
    ([key, label, path]): ContentPage => ({
      key,
      label,
      group: "Νομικά",
      path,
      sections: {
        title: "Τίτλος",
        lastUpdated: "Τελευταία ενημέρωση",
        intro: "Εισαγωγή",
        sections: "Ενότητες",
        seo: "SEO",
      },
    })
  ),
]

export const pageFor = (key: string) => CONTENT_PAGES.find((p) => p.key === key)

/** Greek labels for field keys, used wherever a key appears. Anything missing
 *  falls back to a readable form of the key itself. */
export const FIELD_LABELS: Record<string, string> = {
  a: "Απάντηση",
  accent: "Τονισμένο κείμενο",
  activities: "Δραστηριότητες",
  address: "Διεύθυνση",
  adopted: "Υιοθετημένες",
  alt: "Εναλλακτικό κείμενο",
  arrows: "Βέλη",
  author: "Συντάκτης",
  avatar: "Φωτογραφία",
  awards: "Βραβεία",
  breadcrumb: "Διαδρομή (breadcrumb)",
  certificates: "Πιστοποιητικά",
  awardsCta: "Κουμπί βραβείων",
  badge: "Σήμα",
  badges: "Σήματα",
  benefits: "Οφέλη",
  body: "Κείμενο",
  cards: "Κάρτες",
  category: "Κατηγορία",
  children: "Υπομενού",
  closing: "Κλείσιμο",
  code: "Κωδικός",
  columns: "Στήλες",
  company: "Εταιρεία",
  consentLink: "Σύνδεσμος συγκατάθεσης",
  consentPost: "Συγκατάθεση — μετά",
  consentPre: "Συγκατάθεση — πριν",
  contact: "Επικοινωνία",
  cta: "Κουμπί",
  ctaLabel: "Κείμενο κουμπιού",
  ctaPrimary: "Κύριο κουμπί",
  ctaSecondary: "Δεύτερο κουμπί",
  cyprusAlt: "Κείμενο λογότυπου Κύπρου",
  description: "Περιγραφή",
  email: "Email",
  embedSrc: "Διεύθυνση ενσωμάτωσης",
  emphasis: "Έμφαση",
  euAlt: "Κείμενο λογότυπου ΕΕ",
  event: "Διοργάνωση",
  excerpt: "Περίληψη",
  eyebrow: "Υπέρτιτλος",
  featured: "Προβεβλημένο",
  firstName: "Όνομα",
  funding: "Χρηματοδότηση",
  gallery: "Γκαλερί",
  groups: "Ομάδες",
  h: "Ύψος",
  handle: "Προϊόν (handle)",
  heading: "Επικεφαλίδα",
  headingLines: "Γραμμές επικεφαλίδας",
  highlights: "Σημεία",
  hook: "Εισαγωγική φράση",
  hours: "Ωράριο",
  href: "Σύνδεσμος",
  icon: "Εικονίδιο",
  id: "Αναγνωριστικό",
  image: "Εικόνα",
  imageAlt: "Εναλλακτικό κείμενο εικόνας",
  imageClass: "Στοίχιση εικόνας",
  images: "Εικόνες",
  impact: "Αντίκτυπος",
  impactHeading: "Επικεφαλίδα αντίκτυπου",
  intro: "Εισαγωγή",
  items: "Στοιχεία",
  label: "Ετικέτα",
  lastName: "Επώνυμο",
  lastUpdated: "Τελευταία ενημέρωση",
  lead: "Εισαγωγή",
  left: "Θέση — οριζόντια (υπολογιστής)",
  legal: "Νομικό κείμενο",
  legalBrand: "Εταιρεία (υποσέλιδο)",
  legalBrandHref: "Σύνδεσμος εταιρείας",
  lines: "Γραμμές",
  link: "Σύνδεσμος",
  linkHref: "Σύνδεσμος",
  linkLabel: "Κείμενο συνδέσμου",
  links: "Σύνδεσμοι",
  logos: "Λογότυπα",
  mLeft: "Θέση — οριζόντια (κινητό)",
  mTop: "Θέση — κάθετη (κινητό)",
  members: "Μέλη",
  message: "Μήνυμα",
  meta: "SEO",
  name: "Όνομα",
  next: "Επόμενο",
  note: "Σημείωση",
  num: "Αριθμός",
  ofGoal: "Του στόχου",
  openLabel: "Κείμενο ανοίγματος",
  org: "Οργανισμός",
  paragraphs: "Παράγραφοι",
  pdfEn: "PDF (αγγλικά)",
  pdfGr: "PDF (ελληνικά)",
  phone: "Τηλέφωνο",
  phoneHref: "Τηλέφωνο (σύνδεσμος)",
  phoneShort: "Τηλέφωνο (σύντομο)",
  photo: "Φωτογραφία",
  pills: "Ετικέτες",
  placement: "Άνοιγμα κάρτας (πάνω/κάτω)",
  policies: "Πολιτικές",
  prev: "Προηγούμενο",
  price: "Τιμή",
  prices: "Τιμές στη φωτογραφία",
  primary: "Κύριο",
  product: "Προϊόν",
  products: "Προϊόντα",
  q: "Ερώτηση",
  quote: "Μαρτυρία",
  rating: "Βαθμολογία",
  remainingPost: "Υπόλοιπες — μετά",
  remainingPre: "Υπόλοιπες — πριν",
  requiredNote: "Σημείωση υποχρεωτικών",
  reversed: "Αντεστραμμένη διάταξη",
  reviews: "Κριτικές",
  right: "Δεξιά κάρτα",
  role: "Ιδιότητα",
  secondary: "Δεύτερο",
  sections: "Ενότητες",
  seo: "SEO",
  size: "Μέγεθος",
  slides: "Διαφάνειες",
  slug: "Αναγνωριστικό URL",
  social: "Κοινωνικά δίκτυα",
  src: "Εικόνα",
  stat: "Αριθμός",
  stats: "Αριθμοί",
  steps: "Βήματα",
  sub: "Υπότιτλος",
  subject: "Θέμα",
  submit: "Κουμπί αποστολής",
  tagline: "Σύνθημα",
  taglineAccent: "Σύνθημα — τονισμένο",
  taglinePost: "Σύνθημα — μετά",
  taglinePre: "Σύνθημα — πριν",
  tel: "Τηλέφωνο",
  text: "Κείμενο",
  thaleiaAlt: "Κείμενο λογότυπου ΘΑλΕΙΑ",
  thankYou: "Μήνυμα ευχαριστίας",
  tier: "Διάκριση",
  title: "Τίτλος",
  top: "Θέση — κάθετη (υπολογιστής)",
  unit: "Μονάδα",
  value: "Τιμή",
  values: "Αξίες",
  w: "Πλάτος",
  whyHeading: "Επικεφαλίδα «Γιατί»",
  wordmark: "Λογότυπο",
  wordmarkAlt: "Κείμενο λογότυπου",
  year: "Έτος",
}

/**
 * Reading order for fields inside a group. Postgres `jsonb` does not keep
 * object key order (it sorts shorter keys first), so the editor re-sorts:
 * keys listed here first, in this order, then the rest as stored.
 */
const FIELD_ORDER = [
  "slug", "event", "org", "year", "subject",
  "eyebrow", "badge", "wordmark", "wordmarkAlt",
  "title", "heading", "headingLines", "name", "q", "label", "sub", "tagline",
  "taglinePre", "taglineAccent", "taglinePost", "hook", "lead",
  "description", "intro", "body", "text", "a", "quote", "excerpt", "paragraphs", "bold", "emphasis",
  "role", "category", "price", "value", "unit",
  "image", "imageAlt", "src", "alt", "photo", "avatar", "images", "gallery",
  "cta", "ctaLabel", "ctaPrimary", "ctaSecondary", "primary", "secondary", "link", "linkLabel", "linkHref", "href",
  "items", "links", "columns", "cards", "steps", "stats", "benefits",
]
const ORDER_INDEX = new Map(FIELD_ORDER.map((k, i) => [k, i]))

/** Sort a group's keys into reading order (see FIELD_ORDER). */
export function orderKeys(keys: string[]): string[] {
  return keys
    .map((k, i) => [k, i] as const)
    .sort(([a, ai], [b, bi]) => (ORDER_INDEX.get(a) ?? 1000 + ai) - (ORDER_INDEX.get(b) ?? 1000 + bi))
    .map(([k]) => k)
}

/** Top-level keys in the page's own section order, then any others. */
export function orderSections(keys: string[], page?: ContentPage): string[] {
  const listed = Object.keys(page?.sections ?? {})
  return [...listed.filter((k) => keys.includes(k)), ...keys.filter((k) => !listed.includes(k))]
}

/** Labels for keys that name a group (an object or list) rather than a value —
 *  `left` is a card on the home hero but a pin position on the flatlay. */
const GROUP_LABELS: Record<string, string> = {
  left: "Αριστερή κάρτα",
  right: "Δεξιά κάρτα",
  top: "Πάνω",
}

/** Human label for a key: the dictionary, else the key made readable. */
export function labelFor(key: string, page?: ContentPage, topLevel = false, group = false): string {
  if (topLevel && page?.sections?.[key]) return page.sections[key]
  if (group && GROUP_LABELS[key]) return GROUP_LABELS[key]
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase())
}

/** Layout details editors rarely need: tucked into "Για προχωρημένους" (plain
 *  values only — a group with one of these names is ordinary content). */
export const ADVANCED_KEYS = new Set([
  "left",
  "top",
  "mLeft",
  "mTop",
  "placement",
  "imageClass",
  "w",
  "h",
  "id",
  "slug",
  "embedSrc",
  "phoneHref",
])

/** The same in every language: edited in Greek, read-only in English. */
const SHARED_KEYS = new Set([
  "href",
  "linkHref",
  "legalBrandHref",
  "phoneHref",
  "image",
  "src",
  "photo",
  "avatar",
  "logo",
  "wordmark",
  "embedSrc",
  "pdfGr",
  "pdfEn",
  "icon",
  "slug",
  "handle",
  "size",
  "left",
  "top",
  "mLeft",
  "mTop",
  "placement",
  "imageClass",
  "w",
  "h",
  "id",
  "rating",
  "reversed",
  "num",
  "year",
  "code",
  "tier",
  "email",
  "value",
  "price",
])

const PHONE_LIKE = /^[+\d][\d\s()+-]{5,}$/

/** Whether a leaf is shared across languages (read-only in English). */
export function isSharedLeaf(key: string, value: unknown, page?: ContentPage): boolean {
  if (page?.translatable?.includes(key)) return false
  if (typeof value === "number" || typeof value === "boolean") return true
  if ((key === "phone" || key === "phoneShort" || key === "tel") && typeof value === "string") {
    return PHONE_LIKE.test(value.trim())
  }
  return SHARED_KEYS.has(key)
}

/** An image path or URL the picker should handle. */
export function looksLikeImage(key: string, value: unknown): boolean {
  if (typeof value !== "string") return false
  if (/^(image|src|photo|avatar|logo|wordmark)$/i.test(key)) return true
  return /\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i.test(value) && /^(\/|https?:)/.test(value)
}
