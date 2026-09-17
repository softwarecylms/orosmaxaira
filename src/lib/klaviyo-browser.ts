/**
 * Klaviyo in the browser: Viewed Product, Added to Cart, Started Checkout, and
 * identifying the visitor at checkout. These power the browse, cart and checkout
 * abandonment flows.
 *
 * Nothing is sent unless the visitor accepted marketing cookies — `window.klaviyo`
 * only exists once <KlaviyoOnsite> has loaded it for them — so every function
 * here is safe to call unconditionally.
 *
 * The product id is the Greek handle, the same id as the catalog feed
 * (/klaviyo-catalog.json) and the Medusa order events. Prices are in euros.
 */

import { readConsent } from '@/components/analytics/consent'

type KlaviyoObject = {
  track: (event: string, properties: Record<string, unknown>) => unknown
  identify: (profile: Record<string, unknown>) => unknown
  trackViewedItem?: (item: Record<string, unknown>) => unknown
}

const BRAND = 'Όρος Μαχαιρά'

function klaviyo(): KlaviyoObject | null {
  if (typeof window === 'undefined') return null
  // Consent can be withdrawn after the script loaded; the cookie is the source of truth.
  if (!readConsent()?.marketing) return null
  const k = (window as Window & { klaviyo?: KlaviyoObject }).klaviyo
  return k && typeof k.track === 'function' ? k : null
}

const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'el')
const absolute = (url?: string | null) =>
  !url ? undefined : /^https?:\/\//.test(url) ? url : `${location.origin}${url.startsWith('/') ? '' : '/'}${url}`
const productUrl = (handle: string) => `${location.origin}${lang() === 'en' ? '/en' : ''}/product/${handle}/`
const round = (n: number) => Math.round(n * 100) / 100

/** A cart line, as the cart store keeps it. `unitPrice` is in cents. */
export type KlaviyoCartLine = {
  handle: string
  title: string
  image?: string
  size?: string
  unitPrice: number
  quantity: number
}

const itemOf = (line: KlaviyoCartLine) => ({
  ProductID: line.handle,
  ProductName: line.title,
  VariantName: line.size || undefined,
  Quantity: line.quantity,
  ItemPrice: round(line.unitPrice / 100),
  RowTotal: round((line.unitPrice * line.quantity) / 100),
  ProductURL: productUrl(line.handle),
  ImageURL: absolute(line.image),
})

const cartValue = (lines: KlaviyoCartLine[]) =>
  round(lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0) / 100)

export function klaviyoViewedProduct(product: {
  handle: string
  title: string
  category?: string
  /** euros */
  price: number
  image?: string
}): void {
  const k = klaviyo()
  if (!k) return
  const properties = {
    ProductName: product.title,
    ProductID: product.handle,
    Categories: product.category ? [product.category] : [],
    ImageURL: absolute(product.image),
    URL: productUrl(product.handle),
    Brand: BRAND,
    Price: round(product.price),
  }
  k.track('Viewed Product', properties)
  // Feeds "recently viewed items" blocks in emails.
  k.trackViewedItem?.({
    Title: properties.ProductName,
    ItemId: properties.ProductID,
    Categories: properties.Categories,
    ImageUrl: properties.ImageURL,
    Url: properties.URL,
    Metadata: { Brand: BRAND, Price: properties.Price },
  })
}

/** `cart` is the cart as it is after the add. */
export function klaviyoAddedToCart(added: KlaviyoCartLine, cart: KlaviyoCartLine[]): void {
  const k = klaviyo()
  if (!k) return
  k.track('Added to Cart', {
    $value: cartValue(cart),
    AddedItemProductName: added.title,
    AddedItemProductID: added.handle,
    AddedItemVariantName: added.size || undefined,
    AddedItemImageURL: absolute(added.image),
    AddedItemURL: productUrl(added.handle),
    AddedItemPrice: round(added.unitPrice / 100),
    AddedItemQuantity: added.quantity,
    ItemNames: cart.map((l) => l.title),
    CheckoutURL: `${location.origin}${lang() === 'en' ? '/en' : ''}/checkout/`,
    Items: cart.map(itemOf),
  })
}

const sentCheckouts = new Set<string>()

/**
 * The visitor typed their email at checkout: identify them, then record Started
 * Checkout once per email + cart contents (so editing other fields doesn't repeat it).
 */
export function klaviyoStartedCheckout(
  profile: { email: string; firstName?: string; lastName?: string },
  cart: KlaviyoCartLine[],
): void {
  const k = klaviyo()
  const email = profile.email.trim().toLowerCase()
  if (!k || !cart.length || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return

  const fingerprint = `${email}|${cart.map((l) => `${l.handle}:${l.size ?? ''}:${l.quantity}`).join(',')}`
  if (sentCheckouts.has(fingerprint)) return
  sentCheckouts.add(fingerprint)

  k.identify({
    email,
    ...(profile.firstName ? { first_name: profile.firstName } : {}),
    ...(profile.lastName ? { last_name: profile.lastName } : {}),
    language: lang(),
  })
  k.track('Started Checkout', {
    $event_id: `${fingerprint.length}-${Math.floor(Date.now() / 1000)}`,
    $value: cartValue(cart),
    ItemNames: cart.map((l) => l.title),
    CheckoutURL: `${location.origin}${lang() === 'en' ? '/en' : ''}/checkout/`,
    Items: cart.map(itemOf),
  })
}
