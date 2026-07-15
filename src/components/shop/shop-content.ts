/**
 * Shop page content (Figma 209:4095). The product list is a static snapshot of
 * the live catalogue at orosmaxaira.com (scraped via the WooCommerce Store API —
 * see scripts/scrape-shop.mjs). Cards link out to the live product page where
 * purchase actually happens; swap `href`/data for Medusa once products are seeded.
 */

import { GENERATED_PRODUCT_DETAILS } from './product-details.generated'

export type ShopCategory = 'Μέλι' | 'Προϊόντα Μέλισσας' | 'Καλλυντικά' | 'Πακέτα Δώρων'

export type ShopProduct = {
  category: ShopCategory
  title: string
  price: string
  /** starting price in cents — used for price filter + price sort */
  sortPrice: number
  inStock: boolean
  image: string
  imageAlt: string
  href: string
}

/** Filter sidebar categories, in Figma order. */
export const SHOP_CATEGORIES: ShopCategory[] = [
  'Μέλι',
  'Προϊόντα Μέλισσας',
  'Καλλυντικά',
  'Πακέτα Δώρων',
]

export const SHOP_SORTS = [
  { value: 'default', label: 'Προεπιλεγμένη ταξινόμηση' },
  { value: 'price-asc', label: 'Τιμή: από χαμηλή σε υψηλή' },
  { value: 'price-desc', label: 'Τιμή: από υψηλή σε χαμηλή' },
  { value: 'name-asc', label: 'Αλφαβητικά: Α → Ω' },
] as const

export type ShopSort = (typeof SHOP_SORTS)[number]['value']

export const SHOP_PAGE = {
  breadcrumb: [
    { label: 'Αρχική', href: '/' },
    { label: 'Προϊόντα' },
  ] as { label: string; href?: string }[],
  title: 'Τα Προϊόντα μας',
  subtitle: 'Όλα τα προϊόντα μας — αγνό μέλι, προϊόντα μέλισσας, φυσικά καλλυντικά και πακέτα δώρων.',
  addToCart: 'Προσθήκη στο καλάθι',
  filters: {
    category: 'Κατηγορία',
    price: 'Τιμή',
    clear: 'Καθαρισμός φίλτρων',
    empty: 'Δεν βρέθηκαν προϊόντα με αυτά τα φίλτρα.',
  },
  banner: {
    heading: 'Δραστηριότητες',
    body: 'Επισκεφθείτε το μελισσοκομείο μας για μια ξεχωριστή οικογενειακή εμπειρία! Δείτε τις κυψέλες από κοντά και μάθετε τα μυστικά της μέλισσας και του μελιού.',
    cta: { label: 'Δείτε περισσότερα', href: '/drastiriotites' },
    image: '/images/shop/activities-bee.webp',
    imageAlt: 'Μέλισσα σε κηρήθρα — Όρος Μαχαιρά',
  },
  findUs: 'Βρείτε μας:',
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  { category: 'Πακέτα Δώρων', title: 'Balance Care Gift Set', price: '€49,90', sortPrice: 4990, inStock: false, image: 'https://orosmaxaira.com/wp-content/uploads/2026/04/BALANCE-CARE-SET-WEBSITE.jpg', imageAlt: 'Skincare gift set labeled Balance Care on a pastel gradient sleeve resting on a beige textured bag in a wooden surface booth.', href: 'https://orosmaxaira.com/product/balance-care-gift-set/' },
  { category: 'Πακέτα Δώρων', title: 'Nourish Care Gift Set', price: '€28,50', sortPrice: 2850, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2026/04/NOURISH-SET-WEBSITE.jpg', imageAlt: 'Beige zippered cosmetic bag with a pink label showcasing a Nourish Care skincare set and small bottles on a wooden surface.', href: 'https://orosmaxaira.com/product/nourish-care-gift-set/' },
  { category: 'Πακέτα Δώρων', title: 'Everyday Care Duo Gift Set', price: '€14,25', sortPrice: 1425, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2026/04/EVERYDAY-CARE-DUO-SET-WEBSITE.jpg', imageAlt: "Beige cosmetic bag with a peach label reading 'EVERYDAY CARE DUO' and small skincare bottles pictured on the front label (gift set).", href: 'https://orosmaxaira.com/product/everyday-care-duo-gift-set/' },
  { category: 'Πακέτα Δώρων', title: 'Κιτ Χειροποίητης Πασχαλινής Μελισσολαμπάδας «Όρος Μαχαιρά» – Special Easter Release', price: '€12,50', sortPrice: 1250, inStock: false, image: 'https://orosmaxaira.com/wp-content/uploads/2026/03/kit-pasxalinis-lampadas-2.jpg', imageAlt: 'Κιτ Χειροποίητης Πασχαλινής Μελισσολαμπάδας «Όρος Μαχαιρά» – Special Easter Release', href: 'https://orosmaxaira.com/product/kit-cheiropoiitis-paschalinis-melissolampadas-quot-oros-machaira-quot-special-easter-release-2/' },
  { category: 'Καλλυντικά', title: 'Κρέμα Σώματος', price: '€15,90', sortPrice: 1590, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2026/02/body-lotion-oros-maxaira.png', imageAlt: 'Κρέμα Σώματος', href: 'https://orosmaxaira.com/product/krema-somatos/' },
  { category: 'Πακέτα Δώρων', title: 'Υδρόμελο – Valentine’s Gift Box', price: '€22,00', sortPrice: 2200, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2026/02/melite.jpg', imageAlt: 'Υδρόμελο – Valentine’s Gift Box', href: 'https://orosmaxaira.com/product/ydromelo-valentine-gift-box/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Μέλι με Φουντούκια', price: '€5,40', sortPrice: 540, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2024/08/Oros-Maxaira-meli-me-fountoukia-2.jpg', imageAlt: 'Μέλι με Φουντούκια', href: 'https://orosmaxaira.com/product/meli-me-foyntoykia/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Μέλι με Φυστίκια', price: '€4,80', sortPrice: 480, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2024/08/Oros-Maxaira-meli-me-fistikia-2.jpg', imageAlt: 'Μέλι με Φυστίκια', href: 'https://orosmaxaira.com/product/meli-me-fistikia/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Μέλι με Γύρη', price: '€6,20', sortPrice: 620, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2024/08/Oros-Maxaira-meli-me-gyri.jpg', imageAlt: 'Μέλι με Γύρη', href: 'https://orosmaxaira.com/product/meli-me-gyri/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Μέλι με Χαρούπι και Φουντούκια', price: '€5,40', sortPrice: 540, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2024/08/Oros-Maxaira-meli-me-charoupi-fountouki-2.jpg', imageAlt: 'Μέλι με Χαρούπι και Φουντούκια', href: 'https://orosmaxaira.com/product/meli-me-charoypi-kai-foyntoykia/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή για Εντριβές στο Στήθος και Μυϊκό Μασάζ', price: '€17,90', sortPrice: 1790, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2024/04/Oros-Maxaira-kiraloifi-gia-entrives-sto-stithos-miiko-masaz-1.jpg', imageAlt: 'Φυσική Κηραλοιφή για Εντριβές στο Στήθος και Μυϊκό Μασάζ', href: 'https://orosmaxaira.com/product/kiraloifi-gia-entrives-sto-stithos-kai-myiko-masaz/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή για Κυτταρίτιδα', price: '€17,90', sortPrice: 1790, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2024/04/Oros-Maxaira-kiraloifi-gia-kittaritida-1.jpg', imageAlt: 'Φυσική Κηραλοιφή για Κυτταρίτιδα', href: 'https://orosmaxaira.com/product/kiraloifi-gia-kyttaritida/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Μείγμα μελιού γύρης και βασιλικού πολτού', price: '€3,50', sortPrice: 350, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2023/07/Oros-Maxaira-meigma-melioy-gyris-kai-vasilikoy-poltoy.jpg', imageAlt: 'Μείγμα μελιού γύρης και βασιλικού πολτού', href: 'https://orosmaxaira.com/product/meigma-melioy-gyris-kai-vasilikoy-poltoy/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Υδρόμελο', price: '€16,00', sortPrice: 1600, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2023/07/Oros-Maxaira-ydromelo.jpg', imageAlt: 'Υδρόμελο', href: 'https://orosmaxaira.com/product/ydromelo/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή για Ευαίσθητες Επιδερμίδες', price: '€17,90', sortPrice: 1790, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2021/10/Oros-Maxaira-kiraloifi-gia-eyaisthites-epidermides-1.jpg', imageAlt: 'Φυσική Κηραλοιφή για Ευαίσθητες Επιδερμίδες', href: 'https://orosmaxaira.com/product/kiraloifi-gia-eyaisthites-epidermides/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή για Σκασμένα Χέρια', price: '€17,90', sortPrice: 1790, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2021/10/Oros-Maxaira-kiraloifi-gia-skasmena-cheria-1.jpg', imageAlt: 'Φυσική Κηραλοιφή για Σκασμένα Χέρια', href: 'https://orosmaxaira.com/product/kiraloifi-gia-skasmena-cheria/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή Προσώπου', price: '€24,90', sortPrice: 2490, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2024/04/Oros-Maxaira-fysiki-kiraloifi-gia-prosopo-1.jpg', imageAlt: 'Φυσική Κηραλοιφή Προσώπου', href: 'https://orosmaxaira.com/product/fysiki-kiraloifi-gia-prosopo/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή για Σπυράκια και Τσιμπήματα Εντόμων', price: '€17,90', sortPrice: 1790, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2021/10/Oros-Maxaira-fysiki-kiraloifi-gia-spyrakia-kai-tsimpimata-entomon-1.jpg', imageAlt: 'Φυσική Κηραλοιφή για Σπυράκια και Τσιμπήματα Εντόμων', href: 'https://orosmaxaira.com/product/fysiki-kiraloifi-gia-spyrakia-kai-tsimpimata-entomon/' },
  { category: 'Καλλυντικά', title: 'Φυσική Ενυδατική Κρέμα Προσώπου', price: '€24,90', sortPrice: 2490, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2021/10/Oros-Maxaira-enydatiki-krema-prosopoy.jpg', imageAlt: 'Φυσική Ενυδατική Κρέμα Προσώπου', href: 'https://orosmaxaira.com/product/enydatiki-krema-prosopoy/' },
  { category: 'Καλλυντικά', title: 'Φυσική Αντιγηραντική Κρέμα Ματιών', price: '€24,90', sortPrice: 2490, inStock: false, image: 'https://orosmaxaira.com/wp-content/uploads/2024/04/Oros-Maxaira-krema-matiwn.jpg', imageAlt: 'Φυσική Αντιγηραντική Κρέμα Ματιών', href: 'https://orosmaxaira.com/product/fysiki-antigirantiki-krema-mation/' },
  { category: 'Καλλυντικά', title: 'Κρέμα Χεριών (Milk & Honey)', price: '€9,90', sortPrice: 990, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2021/10/Oros-Maxaira-krema-cherion-milk-amp-honey.pg_.jpg', imageAlt: 'Κρέμα Χεριών (Milk & Honey)', href: 'https://orosmaxaira.com/product/krema-cherion-milk-amp-honey/' },
  { category: 'Καλλυντικά', title: 'Κρέμα Χεριών (Red Grape)', price: '€9,90', sortPrice: 990, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2021/10/Oros-Maxaira-krema-cherion-red-grape.jpg', imageAlt: 'Κρέμα Χεριών (Red Grape)', href: 'https://orosmaxaira.com/product/krema-cherion-red-grape/' },
  { category: 'Καλλυντικά', title: 'Βάλσαμο για τα Χείλη', price: '€5,90', sortPrice: 590, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2021/10/Oros-Maxaira-lip-balm.jpg', imageAlt: 'Βάλσαμο για τα Χείλη', href: 'https://orosmaxaira.com/product/valsamo-gia-ta-cheili/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Γύρη Μελισσών «Όρος Μαχαιρά»', price: '€15,00 – €24,00', sortPrice: 1500, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-gyri.jpg', imageAlt: 'Γύρη Μελισσών «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/gyri-oros-machaira/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Βασιλικός πολτός «Όρος Μαχαιρά»', price: '€22,00', sortPrice: 2200, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-vasilikos-poltos.jpg', imageAlt: 'Βασιλικός πολτός «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/vasilikos-poltos-oros-machaira/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Κηρήθρα με μέλι «Όρος Μαχαιρά»', price: '€7,00', sortPrice: 700, inStock: false, image: 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-kirithra.jpg', imageAlt: 'Κηρήθρα με μέλι «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/kirithra-oros-machaira/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Βάμμα πρόπολης «Όρος Μαχαιρά»', price: '€11,00', sortPrice: 1100, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-vamma-propolis.jpg', imageAlt: 'Βάμμα πρόπολης «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/vamma-propolis-oros-machaira/' },
  { category: 'Μέλι', title: 'Μέλι Ανθέων «Όρος Μαχαιρά»', price: '€3,00 – €27,50', sortPrice: 300, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-meli-anthewn.jpg', imageAlt: 'Μέλι Ανθέων «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/meli-antheon-oros-machaira/' },
  { category: 'Μέλι', title: 'Άβραστο (άθερμο) Μέλι Ανθέων «Όρος Μαχαιρά»', price: '€3,50 – €31,00', sortPrice: 350, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-avrasto-meli.jpg', imageAlt: 'Άβραστο (άθερμο) Μέλι Ανθέων «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/avrasto-meli-antheon-oros-machaira/' },
  { category: 'Μέλι', title: 'Θυμαρίσιο Μέλι «Όρος Μαχαιρά»', price: '€4,00 – €33,00', sortPrice: 400, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-thimarisio-meli.jpg', imageAlt: 'Θυμαρίσιο Μέλι «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/thymarisio-meli-oros-machaira/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Κερί Μέλισσας (200-250γρ)', price: '€4,50', sortPrice: 450, inStock: true, image: 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-melissokeri.jpg', imageAlt: 'Κερί Μέλισσας (200-250γρ)', href: 'https://orosmaxaira.com/product/melissokeri/' },
]

/** Price-filter bounds derived from the catalogue (in whole euros). */
// SHOP_PRICE_MIN / SHOP_PRICE_MAX and productPriceRangeCents() are defined at
// the end of this file — they read PRODUCT_DETAILS, which is declared below.

// ─── Inner product page (detail) ────────────────────────────────────────────
// Rich per-product content for the internal product page (Figma 237:1211).
// Keyed by handle. Only fully populated for the first product under review;
// the rest fall back to sensible defaults (gallery = [product.image], no
// variations → buy buttons enabled from the start).

export type ShopVariationSize = {
  label: string
  /** container/packaging for this size, e.g. 'Πλαστικό' / 'Γυάλινο' */
  container?: string
  /** display price for this size, e.g. '€5,70' */
  price: string
  /** numeric price in cents — used for cart totals */
  sortPrice: number
  /** gallery image shown when this size is selected */
  image?: string
}
export type ShopVariations = {
  sizes: ShopVariationSize[]
}
export type ShopSection = { heading?: string; body: string }
export type ShopNutritionRow = { label: string; value: string }

export type ShopProductDetail = {
  /** detail-page images; falls back to [product.image] */
  gallery?: string[]
  /** short blurb under the price */
  description?: string
  /** “Περιγραφή” tab content */
  sections?: ShopSection[]
  /** “Διατροφική Αξία” tab rows */
  nutrition?: { unit: string; rows: ShopNutritionRow[] }
  variations?: ShopVariations
  /** cross-sell product handles for “Συνδυάστε το με” */
  addons?: string[]
}

const THYM_IMG = {
  '100g': 'https://orosmaxaira.com/wp-content/uploads/2023/07/Oros-Maxaira-thimarisio-meli-100g-600x600.jpg',
  '330g': 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-thimarisio-meli-330g-600x600.jpg',
  '480g': 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-thimarisio-meli-480g-600x600.jpg',
  '500g': 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-thimarisio-meli-500g-600x600.jpg',
  '790g': 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-thimarisio-meli-790g-600x600.jpg',
  '3kg': 'https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-thimarisio-meli-3kg-600x600.jpg',
} as const

export const PRODUCT_DETAILS: Record<string, ShopProductDetail> = {
  'thymarisio-meli-oros-machaira': {
    description:
      'Το Θυμαρίσιο μέλι «Όρος Μαχαιρά» έχει δυνατό άρωμα και γεμάτη γεύση. Θεωρείται το καλύτερο και πιο ακριβό μέλι της Κύπρου.',
    gallery: [
      THYM_IMG['100g'],
      THYM_IMG['330g'],
      THYM_IMG['480g'],
      THYM_IMG['500g'],
      THYM_IMG['790g'],
      THYM_IMG['3kg'],
    ],
    variations: {
      sizes: [
        { label: '100g', container: 'Γυάλινο', price: '€3,50', sortPrice: 350, image: THYM_IMG['100g'] },
        { label: '330g', container: 'Πλαστικό', price: '€5,70', sortPrice: 570, image: THYM_IMG['330g'] },
        { label: '480g', container: 'Squeeze Μπουκάλι', price: '€8,00', sortPrice: 800, image: THYM_IMG['480g'] },
        { label: '500g', container: 'Γυάλινο', price: '€8,50', sortPrice: 850, image: THYM_IMG['500g'] },
        { label: '790g', container: 'Γυάλινο', price: '€12,00', sortPrice: 1200, image: THYM_IMG['790g'] },
        { label: '3kg', container: 'Πλαστικό', price: '€31,00', sortPrice: 3100, image: THYM_IMG['3kg'] },
      ],
    },
    addons: ['ydromelo', 'vasilikos-poltos-oros-machaira', 'meli-me-foyntoykia'],
    sections: [
      {
        body: 'Το θυμαρίσιο μέλι είναι ένα είδος μελιού που φτιάχνεται από το νέκταρ των αγριολούλουδων. Είναι ένα σκουρόχρωμο μέλι που έχει μοναδική, έντονη γεύση και άρωμα. Χρησιμοποιείται συχνά στη μεσογειακή μαγειρική και συχνά συνδυάζεται με τυρί, κρέατα και λαχανικά.',
      },
      {
        heading: 'Ιδιότητες και οφέλη για την υγεία',
        body: 'Το θυμαρίσιο μέλι είναι πηγή αντιοξειδωτικών, συμπεριλαμβανομένων των φαινολικών οξέων και των φλαβονοειδών, τα οποία πιστεύεται ότι βοηθούν στην προστασία από το οξειδωτικό άγχος. Περιέχει επίσης αντιβακτηριακές και αντιμυκητιακές ιδιότητες και μπορεί να βοηθήσει στη μείωση της φλεγμονής και στη βελτίωση της πέψης. Επιπλέον, πιστεύεται ότι βοηθά στην ενίσχυση του ανοσοποιητικού συστήματος και στη μείωση της κόπωσης.',
      },
      {
        heading: 'Πότε παράγεται το θυμαρίσιο μέλι',
        body: 'Το θυμαρίσιο μέλι παράγεται συνήθως τους καλοκαιρινούς μήνες και αρχές του φθινοπώρου, όταν ανθίζει το θυμάρι, συνήθως τον Ιούνιο και τον Ιούλιο μέχρι και τον Σεπτέμβριο.',
      },
      {
        heading: 'Τι γεύση έχει το θυμαρίσιο μέλι',
        body: 'Το θυμαρίσιο μέλι έχει γλυκιά και ελαφρώς γήινη γεύση. Δεν είναι τόσο έντονα γλυκό όσο άλλες ποικιλίες μελιού, αλλά εξακολουθεί να είναι αρκετά γλυκό για να χρησιμοποιείται σε επιδόρπια και ποτά.',
      },
      {
        heading: 'Τι χρώμα έχει το θυμαρίσιο μέλι',
        body: 'Το θυμαρίσιο μέλι έχει συνήθως σκούρο κεχριμπαρένιο χρώμα.',
      },
      {
        heading: 'Από που να το αγοράσετε',
        body: 'Προτείνουμε να κάνετε την παραγγελία online μέσα από το website μας καθώς η διαθεσιμότητα στις υπεραγορές είναι περιορισμένη.',
      },
    ],
  },

  // All other products are generated from the live WooCommerce Store API.
  ...GENERATED_PRODUCT_DETAILS,
}

/** Slug used for the internal product URL (/shop/<handle>), derived from the
 *  live-site href so we don't have to duplicate it on every product row. */
export function handleOf(product: ShopProduct): string {
  const m = product.href.match(/\/product\/([^/]+)\/?$/)
  return m ? m[1] : ''
}

export function getProductByHandle(handle: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => handleOf(p) === handle)
}

export function getProductDetail(handle: string): ShopProductDetail {
  return PRODUCT_DETAILS[handle] ?? {}
}

/** Up to `limit` related products — a mix of the same category and others, so
 *  the row always surfaces products from across the catalogue. */
export function getRelatedProducts(product: ShopProduct, limit = 4): ShopProduct[] {
  const others = SHOP_PRODUCTS.filter((p) => p !== product && p.inStock)
  const sameCategory = others.filter((p) => p.category === product.category)
  const otherCategories = others.filter((p) => p.category !== product.category)
  return [...sameCategory.slice(0, 2), ...otherCategories].slice(0, limit)
}

/** Min/max price (in cents) across a product's variants, from the merged
 *  product detail (hand-written + generated); products without variants fall
 *  back to their starting price. The shop price filter uses this so a product
 *  matches when ANY of its sizes is in range — e.g. a honey whose 1Kg/3Kg
 *  sizes cost more than its 100g starting price. */
export function productPriceRangeCents(product: ShopProduct): [number, number] {
  const sizes = PRODUCT_DETAILS[handleOf(product)]?.variations?.sizes ?? []
  const prices = sizes.map((s) => s.sortPrice).filter((n) => typeof n === 'number' && n > 0)
  if (!prices.length) return [product.sortPrice, product.sortPrice]
  return [Math.min(...prices), Math.max(...prices)]
}

// Slider bounds span the full variant price range across all products.
export const SHOP_PRICE_MIN = Math.floor(
  Math.min(...SHOP_PRODUCTS.map((p) => productPriceRangeCents(p)[0])) / 100,
)
export const SHOP_PRICE_MAX = Math.ceil(
  Math.max(...SHOP_PRODUCTS.map((p) => productPriceRangeCents(p)[1])) / 100,
)
