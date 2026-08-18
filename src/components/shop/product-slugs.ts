/**
 * Per-locale product slugs. The live site (orosmaxaira.com) serves English
 * product pages under English slugs (e.g. /en/product/oros-machaira-blossom-honey/).
 * This maps our Greek Medusa handle <-> the site's English slug so EN URLs match.
 * Only products whose English slug DIFFERS from the Greek handle are listed;
 * everything else shares the slug across locales.
 */

export const PRODUCT_HANDLE_EN: Record<string, string> = {
  "avrasto-meli-antheon-oros-machaira": "oros-machaira-unheated-honey",
  "balance-care-gift-set": "balance-care-gift",
  "gyri-oros-machaira": "oros-machaira-pollen",
  "kiraloifi-gia-eyaisthites-epidermides": "wax-salve-for-sensitive-skin",
  "kiraloifi-gia-skasmena-cheria": "wax-salve-for-cracked-hands",
  "kirithra-oros-machaira": "oros-machaira-honeycomb",
  "krema-somatos": "natural-moisturizing-face-cream-copy",
  "meli-antheon-oros-machaira": "oros-machaira-blossom-honey",
  "melissokeri": "beeswax",
  "thymarisio-meli-oros-machaira": "oros-machaira-thyme-honey",
  "valsamo-gia-ta-cheili": "lip-balm",
  "vamma-propolis-oros-machaira": "oros-machaira-propolis-tincture",
  "vasilikos-poltos-oros-machaira": "oros-machaira-royal-jelly",
}

export const PRODUCT_HANDLE_BY_EN: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_HANDLE_EN).map(([el, en]) => [en, el]),
)

/** The English slug for a Greek handle (identity if no override). */
export function enHandle(handle: string): string {
  return PRODUCT_HANDLE_EN[handle] ?? handle
}

/** Resolve any incoming slug (EN or EL) back to the canonical Greek handle. */
export function canonicalHandle(slug: string): string {
  return PRODUCT_HANDLE_BY_EN[slug] ?? slug
}

/** Locale-aware product slug for building URLs. */
export function productSlug(handle: string, locale: string): string {
  return locale === 'en' ? enHandle(handle) : handle
}

/** hreflang alternates for a product, using the per-locale slug (el = Greek
 *  handle, en = English slug), with trailing slashes to match the live site. */
export function productHreflang(rawHandle: string, locale: string) {
  const greek = canonicalHandle(rawHandle)
  const el = `/product/${greek}/`
  const en = `/en/product/${enHandle(greek)}/`
  return {
    canonical: locale === 'en' ? en : el,
    languages: { el, en, 'x-default': el },
  }
}
