/**
 * Shop page content (Figma 209:4095). The product list is a static snapshot of
 * the live catalogue at orosmaxaira.com (scraped via the WooCommerce Store API —
 * see scripts/scrape-shop.mjs). Cards link out to the live product page where
 * purchase actually happens; swap `href`/data for Medusa once products are seeded.
 */

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
    cta: { label: 'Δείτε περισσότερα', href: '/' },
    image: '/images/home/adopt-bee.webp',
    imageAlt: 'Μέλισσα σε κηρήθρα — Όρος Μαχαιρά',
  },
  findUs: 'Βρείτε μας:',
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  { category: 'Πακέτα Δώρων', title: 'Balance Care Gift Set', price: '€49,90', sortPrice: 4990, inStock: false, image: '/images/shop/balance-care-gift-set.webp', imageAlt: 'Skincare gift set labeled Balance Care on a pastel gradient sleeve resting on a beige textured bag in a wooden surface booth.', href: 'https://orosmaxaira.com/product/balance-care-gift-set/' },
  { category: 'Πακέτα Δώρων', title: 'Nourish Care Gift Set', price: '€28,50', sortPrice: 2850, inStock: true, image: '/images/shop/nourish-care-gift-set.webp', imageAlt: 'Beige zippered cosmetic bag with a pink label showcasing a Nourish Care skincare set and small bottles on a wooden surface.', href: 'https://orosmaxaira.com/product/nourish-care-gift-set/' },
  { category: 'Πακέτα Δώρων', title: 'Everyday Care Duo Gift Set', price: '€14,25', sortPrice: 1425, inStock: true, image: '/images/shop/everyday-care-duo-gift-set.webp', imageAlt: "Beige cosmetic bag with a peach label reading 'EVERYDAY CARE DUO' and small skincare bottles pictured on the front label (gift set).", href: 'https://orosmaxaira.com/product/everyday-care-duo-gift-set/' },
  { category: 'Πακέτα Δώρων', title: 'Κιτ Χειροποίητης Πασχαλινής Μελισσολαμπάδας «Όρος Μαχαιρά» – Special Easter Release', price: '€12,50', sortPrice: 1250, inStock: false, image: '/images/shop/kit-cheiropoiitis-paschalinis-melissolampadas-quot-oros-machaira-quot-special-easter-release-2.webp', imageAlt: 'Κιτ Χειροποίητης Πασχαλινής Μελισσολαμπάδας «Όρος Μαχαιρά» – Special Easter Release', href: 'https://orosmaxaira.com/product/kit-cheiropoiitis-paschalinis-melissolampadas-quot-oros-machaira-quot-special-easter-release-2/' },
  { category: 'Καλλυντικά', title: 'Κρέμα Σώματος', price: '€15,90', sortPrice: 1590, inStock: true, image: '/images/shop/krema-somatos.webp', imageAlt: 'Κρέμα Σώματος', href: 'https://orosmaxaira.com/product/krema-somatos/' },
  { category: 'Πακέτα Δώρων', title: 'Υδρόμελο – Valentine’s Gift Box', price: '€22,00', sortPrice: 2200, inStock: true, image: '/images/shop/ydromelo-valentine-gift-box.webp', imageAlt: 'Υδρόμελο – Valentine’s Gift Box', href: 'https://orosmaxaira.com/product/ydromelo-valentine-gift-box/' },
  { category: 'Μέλι', title: 'Μέλι με Φουντούκια', price: '€5,40', sortPrice: 540, inStock: true, image: '/images/shop/meli-me-foyntoykia.webp', imageAlt: 'Μέλι με Φουντούκια', href: 'https://orosmaxaira.com/product/meli-me-foyntoykia/' },
  { category: 'Μέλι', title: 'Μέλι με Φυστίκια', price: '€4,80', sortPrice: 480, inStock: true, image: '/images/shop/meli-me-fistikia.webp', imageAlt: 'Μέλι με Φυστίκια', href: 'https://orosmaxaira.com/product/meli-me-fistikia/' },
  { category: 'Μέλι', title: 'Μέλι με Γύρη', price: '€6,20', sortPrice: 620, inStock: true, image: '/images/shop/meli-me-gyri.webp', imageAlt: 'Μέλι με Γύρη', href: 'https://orosmaxaira.com/product/meli-me-gyri/' },
  { category: 'Μέλι', title: 'Μέλι με Χαρούπι και Φουντούκια', price: '€5,40', sortPrice: 540, inStock: true, image: '/images/shop/meli-me-charoypi-kai-foyntoykia.webp', imageAlt: 'Μέλι με Χαρούπι και Φουντούκια', href: 'https://orosmaxaira.com/product/meli-me-charoypi-kai-foyntoykia/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή για Εντριβές στο Στήθος και Μυϊκό Μασάζ', price: '€17,90', sortPrice: 1790, inStock: true, image: '/images/shop/kiraloifi-gia-entrives-sto-stithos-kai-myiko-masaz.webp', imageAlt: 'Φυσική Κηραλοιφή για Εντριβές στο Στήθος και Μυϊκό Μασάζ', href: 'https://orosmaxaira.com/product/kiraloifi-gia-entrives-sto-stithos-kai-myiko-masaz/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή για Κυτταρίτιδα', price: '€17,90', sortPrice: 1790, inStock: true, image: '/images/shop/kiraloifi-gia-kyttaritida.webp', imageAlt: 'Φυσική Κηραλοιφή για Κυτταρίτιδα', href: 'https://orosmaxaira.com/product/kiraloifi-gia-kyttaritida/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Μείγμα μελιού γύρης και βασιλικού πολτού', price: '€3,50', sortPrice: 350, inStock: true, image: '/images/shop/meigma-melioy-gyris-kai-vasilikoy-poltoy.webp', imageAlt: 'Μείγμα μελιού γύρης και βασιλικού πολτού', href: 'https://orosmaxaira.com/product/meigma-melioy-gyris-kai-vasilikoy-poltoy/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Υδρόμελο', price: '€16,00', sortPrice: 1600, inStock: true, image: '/images/shop/ydromelo.webp', imageAlt: 'Υδρόμελο', href: 'https://orosmaxaira.com/product/ydromelo/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή για Ευαίσθητες Επιδερμίδες', price: '€17,90', sortPrice: 1790, inStock: true, image: '/images/shop/kiraloifi-gia-eyaisthites-epidermides.webp', imageAlt: 'Φυσική Κηραλοιφή για Ευαίσθητες Επιδερμίδες', href: 'https://orosmaxaira.com/product/kiraloifi-gia-eyaisthites-epidermides/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή για Σκασμένα Χέρια', price: '€17,90', sortPrice: 1790, inStock: true, image: '/images/shop/kiraloifi-gia-skasmena-cheria.webp', imageAlt: 'Φυσική Κηραλοιφή για Σκασμένα Χέρια', href: 'https://orosmaxaira.com/product/kiraloifi-gia-skasmena-cheria/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή Προσώπου', price: '€24,90', sortPrice: 2490, inStock: true, image: '/images/shop/fysiki-kiraloifi-gia-prosopo.webp', imageAlt: 'Φυσική Κηραλοιφή Προσώπου', href: 'https://orosmaxaira.com/product/fysiki-kiraloifi-gia-prosopo/' },
  { category: 'Καλλυντικά', title: 'Φυσική Κηραλοιφή για Σπυράκια και Τσιμπήματα Εντόμων', price: '€17,90', sortPrice: 1790, inStock: true, image: '/images/shop/fysiki-kiraloifi-gia-spyrakia-kai-tsimpimata-entomon.webp', imageAlt: 'Φυσική Κηραλοιφή για Σπυράκια και Τσιμπήματα Εντόμων', href: 'https://orosmaxaira.com/product/fysiki-kiraloifi-gia-spyrakia-kai-tsimpimata-entomon/' },
  { category: 'Καλλυντικά', title: 'Φυσική Ενυδατική Κρέμα Προσώπου', price: '€24,90', sortPrice: 2490, inStock: true, image: '/images/shop/enydatiki-krema-prosopoy.webp', imageAlt: 'Φυσική Ενυδατική Κρέμα Προσώπου', href: 'https://orosmaxaira.com/product/enydatiki-krema-prosopoy/' },
  { category: 'Καλλυντικά', title: 'Φυσική Αντιγηραντική Κρέμα Ματιών', price: '€24,90', sortPrice: 2490, inStock: false, image: '/images/shop/fysiki-antigirantiki-krema-mation.webp', imageAlt: 'Φυσική Αντιγηραντική Κρέμα Ματιών', href: 'https://orosmaxaira.com/product/fysiki-antigirantiki-krema-mation/' },
  { category: 'Καλλυντικά', title: 'Κρέμα Χεριών (Milk & Honey)', price: '€9,90', sortPrice: 990, inStock: true, image: '/images/shop/krema-cherion-milk-amp-honey.webp', imageAlt: 'Κρέμα Χεριών (Milk & Honey)', href: 'https://orosmaxaira.com/product/krema-cherion-milk-amp-honey/' },
  { category: 'Καλλυντικά', title: 'Κρέμα Χεριών (Red Grape)', price: '€9,90', sortPrice: 990, inStock: true, image: '/images/shop/krema-cherion-red-grape.webp', imageAlt: 'Κρέμα Χεριών (Red Grape)', href: 'https://orosmaxaira.com/product/krema-cherion-red-grape/' },
  { category: 'Καλλυντικά', title: 'Βάλσαμο για τα Χείλη', price: '€5,90', sortPrice: 590, inStock: true, image: '/images/shop/valsamo-gia-ta-cheili.webp', imageAlt: 'Βάλσαμο για τα Χείλη', href: 'https://orosmaxaira.com/product/valsamo-gia-ta-cheili/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Γύρη Μελισσών «Όρος Μαχαιρά»', price: '€15,00 – €24,00', sortPrice: 1500, inStock: true, image: '/images/shop/gyri-oros-machaira.webp', imageAlt: 'Γύρη Μελισσών «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/gyri-oros-machaira/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Βασιλικός πολτός «Όρος Μαχαιρά»', price: '€22,00', sortPrice: 2200, inStock: true, image: '/images/shop/vasilikos-poltos-oros-machaira.webp', imageAlt: 'Βασιλικός πολτός «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/vasilikos-poltos-oros-machaira/' },
  { category: 'Μέλι', title: 'Κηρήθρα με μέλι «Όρος Μαχαιρά»', price: '€7,00', sortPrice: 700, inStock: false, image: '/images/shop/kirithra-oros-machaira.webp', imageAlt: 'Κηρήθρα με μέλι «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/kirithra-oros-machaira/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Βάμμα πρόπολης «Όρος Μαχαιρά»', price: '€11,00', sortPrice: 1100, inStock: true, image: '/images/shop/vamma-propolis-oros-machaira.webp', imageAlt: 'Βάμμα πρόπολης «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/vamma-propolis-oros-machaira/' },
  { category: 'Μέλι', title: 'Μέλι Ανθέων «Όρος Μαχαιρά»', price: '€3,00 – €27,50', sortPrice: 300, inStock: true, image: '/images/shop/meli-antheon-oros-machaira.webp', imageAlt: 'Μέλι Ανθέων «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/meli-antheon-oros-machaira/' },
  { category: 'Μέλι', title: 'Άβραστο (άθερμο) Μέλι Ανθέων «Όρος Μαχαιρά»', price: '€3,50 – €31,00', sortPrice: 350, inStock: true, image: '/images/shop/avrasto-meli-antheon-oros-machaira.webp', imageAlt: 'Άβραστο (άθερμο) Μέλι Ανθέων «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/avrasto-meli-antheon-oros-machaira/' },
  { category: 'Μέλι', title: 'Θυμαρίσιο Μέλι «Όρος Μαχαιρά»', price: '€4,00 – €33,00', sortPrice: 400, inStock: true, image: '/images/shop/thymarisio-meli-oros-machaira.webp', imageAlt: 'Θυμαρίσιο Μέλι «Όρος Μαχαιρά»', href: 'https://orosmaxaira.com/product/thymarisio-meli-oros-machaira/' },
  { category: 'Προϊόντα Μέλισσας', title: 'Κερί Μέλισσας (200-250γρ)', price: '€4,50', sortPrice: 450, inStock: true, image: '/images/shop/melissokeri.webp', imageAlt: 'Κερί Μέλισσας (200-250γρ)', href: 'https://orosmaxaira.com/product/melissokeri/' },
]

/** Price-filter bounds derived from the catalogue (in whole euros). */
export const SHOP_PRICE_MIN = Math.floor(Math.min(...SHOP_PRODUCTS.map((p) => p.sortPrice)) / 100)
export const SHOP_PRICE_MAX = Math.ceil(Math.max(...SHOP_PRODUCTS.map((p) => p.sortPrice)) / 100)
