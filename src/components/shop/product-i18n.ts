/**
 * Client-safe product-title + container translations for localizing the
 * cart/checkout line items at render time (the cart stores whatever title was
 * captured at add-time; this maps the Greek handle -> English title so /en
 * always shows the English product name, matching the live site).
 */
import { canonicalHandle } from './product-slugs'

/** Greek Medusa handle -> English product title. */
export const PRODUCT_TITLE_EN: Record<string, string> = {
  "avrasto-meli-antheon-oros-machaira": "Oros Machaira Raw (Unheated) Blossom Honey",
  "balance-care-gift-set": "Balance Care Gift Set",
  "enydatiki-krema-prosopoy": "Natural Moisturising Face Cream",
  "everyday-care-duo-gift-set": "Everyday Care Duo Gift Set",
  "fysiki-antigirantiki-krema-mation": "Natural Anti Ageing Eye Cream",
  "fysiki-kiraloifi-gia-prosopo": "Beeswax Face Balm",
  "fysiki-kiraloifi-gia-spyrakia-kai-tsimpimata-entomon": "Beeswax Face Balm — Blemishes & Bites",
  "gyri-oros-machaira": "Oros Machaira Bee Pollen",
  "kiraloifi-gia-entrives-sto-stithos-kai-myiko-masaz": "Beeswax Chest & Muscle Rub",
  "kiraloifi-gia-eyaisthites-epidermides": "Natural Wax Salve for Sensitive Skin",
  "kiraloifi-gia-kyttaritida": "Beeswax Balm for Cellulite",
  "kiraloifi-gia-skasmena-cheria": "Natural Wax Salve for Cracked Hands",
  "kirithra-oros-machaira": "Oros Machaira Honeycomb",
  "kit-cheiropoiitis-paschalinis-melissolampadas-quot-oros-machaira-quot-special-easter-release-2": "Oros Machaira Handmade Easter Bee-Candle Kit – Special Easter Release",
  "krema-cherion-milk-amp-honey": "Milk & Honey Hand Cream",
  "krema-cherion-red-grape": "Natural Hands Cream (Red Grape)",
  "krema-somatos": "Body Cream",
  "meigma-melioy-gyris-kai-vasilikoy-poltoy": "Honey, Royal Jelly & Pollen Blend",
  "meli-antheon-oros-machaira": "Oros Machaira Blossom Honey",
  "meli-me-charoypi-kai-foyntoykia": "Honey with Carob & Hazelnuts",
  "meli-me-fistikia": "Honey with Peanuts",
  "meli-me-foyntoykia": "Honey with Hazelnuts",
  "meli-me-gyri": "Honey with Bee Pollen",
  "melissokeri": "Beeswax (200–250 g)",
  "nourish-care-gift-set": "Nourish Care Gift Set",
  "thymarisio-meli-oros-machaira": "Oros Machaira Thyme Honey",
  "valsamo-gia-ta-cheili": "Lip Balm",
  "vamma-propolis-oros-machaira": "Oros Machaira Propolis Tincture",
  "vasilikos-poltos-oros-machaira": "Oros Machaira Royal Jelly",
  "ydromelo": "Mead",
  "ydromelo-valentine-gift-box": "Mead – Valentine’s Gift Box",
}

/** Container / packaging words used in size labels (e.g. "1Kg · Πλαστικό"). */
const CONTAINER_EN: Record<string, string> = {
  "Γυάλινο βαζάκι": "Glass jar",
  "Πλαστικό μπουκάλι": "Plastic bottle",
  "Γυάλινο": "Glass",
  "Πλαστικό": "Plastic",
  "Βαζάκι": "Jar",
  "Μπουκάλι": "Bottle",
  "Τεμάχιο": "Piece",
  "Συσκευασία": "Package",
}

/** English product title for a handle, when locale is en. Resolves both the
 *  Greek Medusa handle and the English URL slug (canonicalHandle) so cart items
 *  stored under either slug still show the English name. */
export function localizedProductTitle(handle: string, fallback: string, locale: string): string {
  if (locale !== 'en') return fallback
  return PRODUCT_TITLE_EN[handle] ?? PRODUCT_TITLE_EN[canonicalHandle(handle)] ?? fallback
}

/** Translate a container word (Πλαστικό -> Plastic) when locale is en. */
export function localizedContainer(container: string | undefined, locale: string): string | undefined {
  if (!container || locale !== 'en') return container
  let out = container
  for (const [el, en] of Object.entries(CONTAINER_EN).sort((a, b) => b[0].length - a[0].length)) {
    out = out.split(el).join(en)
  }
  return out
}
