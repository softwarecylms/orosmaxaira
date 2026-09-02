/**
 * Bilingual UI chrome for the product detail page — purchase panel, gallery,
 * tabs, benefits bar, related carousel and the page's breadcrumb/headings.
 * Product data (name, price, description, sections, category) is localized in
 * the data layer; this module only holds the surrounding chrome strings.
 *
 * Read the active locale via `getLocale()` (server) / `useLocale()` (client).
 * Mirrors `getHomeContent`.
 */

const PRODUCT_UI_EL = {
  /** Prefix for a variation range price, e.g. "Από €3,50". */
  fromPrice: 'Από',
  refrigerated: {
    label: 'Προϊόν ψυγείου',
    note: '— παράδοση μόνο κατ’ οίκον (εξαιρούνται Πάφος, Αμμόχωστος & Ελλάδα).',
  },
  qty: { decrease: 'Μείωση ποσότητας', increase: 'Αύξηση ποσότητας', label: 'Ποσότητα' },
  added: 'Προστέθηκε',
  addToCart: 'Προσθήκη στο καλάθι',
  addToCartShort: 'Προσθήκη',
  buyNow: 'Aγοράστε τώρα',
  selectSize: 'Επιλέξτε μέγεθος για να συνεχίσετε.',
  crossSellHeading: '🔥 Συνδυάστε το με',
  /** aria-label for an add-on's add button, e.g. "Προσθήκη <Υδρόμελο> στο καλάθι". */
  addonAria: (title: string) => `Προσθήκη ${title} στο καλάθι`,
  delivery: {
    reach: 'Παραδίδουμε σε Κύπρο & Ελλάδα',
    free: 'Δωρεάν μεταφορικά στην Κύπρο για παραγγελίες άνω των €70',
  },
  help: { title: 'Χρειάζεστε βοήθεια;', call: 'Καλέστε μας στο ' },
  share: { title: 'Κοινοποίηση σε:', aria: 'Κοινοποίηση' },
  tabs: {
    description: 'Περιγραφή',
    nutrition: 'Διατροφική Αξία',
    nutritionInfo: 'Διατροφική πληροφορία',
  },
  /** thumbnail aria-label, e.g. "<alt> — εικόνα 2". */
  galleryImage: (alt: string, n: number) => `${alt} — εικόνα ${n}`,
  benefits: [
    '100% ΕΓΓΥΗΣΗ ΑΓΝΟΤΗΤΑΣ',
    'ΑΜΕΣΗ ΠΑΡΑΔΟΣΗ',
    'ΑΣΦΑΛΕΙΣ ONLINE ΠΛΗΡΩΜΕΣ',
    'ΟΙΚΟΛΟΓΙΚΗ ΣΥΣΚΕΥΑΣΙΑ',
    'ΑΜΕΣΗ ΕΞΥΠΗΡΕΤΗΣΗ',
  ] as [string, string, string, string, string],
  carousel: { prev: 'Προηγούμενο προϊόν', next: 'Επόμενο προϊόν' },
  breadcrumbProducts: 'Προϊόντα',
  relatedHeading: 'Προϊόντα που ίσως σας ενδιαφέρουν',
  metaTitleFallback: 'Προϊόν',
}

export type ProductUi = typeof PRODUCT_UI_EL

const PRODUCT_UI_EN: ProductUi = {
  fromPrice: 'From',
  refrigerated: {
    label: 'Refrigerated product',
    note: '— home delivery only (excludes Paphos, Famagusta & Greece).',
  },
  qty: { decrease: 'Decrease quantity', increase: 'Increase quantity', label: 'Quantity' },
  added: 'Added',
  addToCart: 'Add to cart',
  addToCartShort: 'Add',
  buyNow: 'Buy now',
  selectSize: 'Select a size to continue.',
  crossSellHeading: '🔥 Pair it with',
  addonAria: (title: string) => `Add ${title} to cart`,
  delivery: {
    reach: 'We deliver to Cyprus & Greece',
    free: 'Free shipping in Cyprus on orders over €70',
  },
  help: { title: 'Need help?', call: 'Call us at ' },
  share: { title: 'Share on:', aria: 'Share' },
  tabs: {
    description: 'Description',
    nutrition: 'Nutrition Facts',
    nutritionInfo: 'Nutrition information',
  },
  galleryImage: (alt: string, n: number) => `${alt} — image ${n}`,
  benefits: [
    '100% PURITY GUARANTEE',
    'FAST DELIVERY',
    'SECURE ONLINE PAYMENTS',
    'ECO PACKAGING',
    'FAST SERVICE',
  ],
  carousel: { prev: 'Previous product', next: 'Next product' },
  breadcrumbProducts: 'Products',
  relatedHeading: 'Products you may also like',
  metaTitleFallback: 'Product',
}

/** Locale-aware product-page chrome. el = the Greek source of truth, en = the
 *  English bundle above. */
export function getProductUi(locale: string): ProductUi {
  return locale === 'en' ? PRODUCT_UI_EN : PRODUCT_UI_EL
}
