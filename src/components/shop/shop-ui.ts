/**
 * Bilingual UI chrome for the shop listing (shop-browser, product card,
 * products page breadcrumb) and the checkout stepper. Product data (names,
 * prices, category labels) is localized separately in the data layer — this
 * module only holds the surrounding chrome strings (filters, sort options,
 * buttons, empty states, aria-labels, …).
 *
 * The Greek side reuses the existing constants in `shop-content.ts` as the
 * source of truth so they stay byte-identical; `HREF`s are locale-invariant and
 * resolved by next-intl's `<Link>` at the call site. Read the active locale via
 * `getLocale()` (server) / `useLocale()` (client). Mirrors `getHomeContent`.
 */

import { SHOP_PAGE, SHOP_SORTS, type ShopSort } from './shop-content'

const SORT_LABELS_EN: Record<ShopSort, string> = {
  default: 'Default sorting',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  'name-asc': 'Alphabetical: A → Z',
}

const SHOP_UI_EL = {
  filters: {
    category: SHOP_PAGE.filters.category, // Κατηγορία
    price: SHOP_PAGE.filters.price, // Τιμή
    clear: SHOP_PAGE.filters.clear, // Καθαρισμός φίλτρων
    empty: SHOP_PAGE.filters.empty, // Δεν βρέθηκαν προϊόντα…
    minAria: 'Ελάχιστη τιμή',
    maxAria: 'Μέγιστη τιμή',
  },
  filtersToggle: { open: 'Φίλτρα', close: 'Κλείσιμο φίλτρων' },
  banner: SHOP_PAGE.banner,
  findUs: SHOP_PAGE.findUs, // Βρείτε μας:
  sortAria: 'Ταξινόμηση',
  sortLabel: (s: ShopSort): string => SHOP_SORTS.find((o) => o.value === s)?.label ?? '',
  /** e.g. "1 προϊόν" / "5 προϊόντα" */
  count: (n: number) => `${n} ${n === 1 ? 'προϊόν' : 'προϊόντα'}`,
  addToCart: SHOP_PAGE.addToCart, // Προσθήκη στο καλάθι
  addToCartShort: 'Προσθήκη',
  outOfStock: 'Εξαντλήθηκε',
  breadcrumb: { home: 'Αρχική', products: 'Προϊόντα' },
  /** Checkout stepper node labels (cart → checkout → order). */
  steps: ['ΚΑΛΑΘΙ', 'ΤΑΜΕΙΟ', 'ΠΑΡΑΓΓΕΛΙΑ'] as [string, string, string],
  meta: {
    listingTitle: 'Προϊόντα',
    listingDescription:
      'Όλα τα προϊόντα Όρος Μαχαιρά — αγνό μέλι, προϊόντα μέλισσας, φυσικά καλλυντικά και πακέτα δώρων.',
    /** fallback title for an unknown category slug */
    titleFallback: 'Προϊόντα',
    categoryDescription: (label: string) => `${label} — Όρος Μαχαιρά.`,
  },
}

export type ShopUi = typeof SHOP_UI_EL

const SHOP_UI_EN: ShopUi = {
  filters: {
    category: 'Category',
    price: 'Price',
    clear: 'Clear filters',
    empty: 'No products match these filters.',
    minAria: 'Minimum price',
    maxAria: 'Maximum price',
  },
  filtersToggle: { open: 'Filters', close: 'Close filters' },
  banner: {
    heading: 'Activities',
    body: 'Visit our apiary for a unique family experience! See the hives up close and discover the secrets of the bee and honey.',
    cta: { label: 'Learn more', href: SHOP_PAGE.banner.cta.href },
    image: SHOP_PAGE.banner.image,
    imageAlt: 'Bee on a honeycomb — Oros Machaira',
  },
  findUs: 'Find us:',
  sortAria: 'Sort by',
  sortLabel: (s: ShopSort) => SORT_LABELS_EN[s] ?? '',
  count: (n: number) => `${n} ${n === 1 ? 'product' : 'products'}`,
  addToCart: 'Add to cart',
  addToCartShort: 'Add',
  outOfStock: 'Out of stock',
  breadcrumb: { home: 'Home', products: 'Products' },
  steps: ['CART', 'CHECKOUT', 'ORDER'],
  meta: {
    listingTitle: 'Products',
    listingDescription:
      'All Oros Machaira products — pure honey, bee products, natural cosmetics and gift sets.',
    titleFallback: 'Products',
    categoryDescription: (label: string) => `${label} — Oros Machaira.`,
  },
}

/** Locale-aware shop chrome. el = the Greek source of truth, en = the English
 *  bundle above. */
export function getShopUi(locale: string): ShopUi {
  return locale === 'en' ? SHOP_UI_EN : SHOP_UI_EL
}
