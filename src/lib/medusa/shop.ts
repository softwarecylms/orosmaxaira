import type { HttpTypes } from '@medusajs/types'
import { getLocale } from 'next-intl/server'
import { sdk, CACHE_TTL } from './client'
import { getDefaultRegion } from './region'
import {
  SHOP_CATEGORIES,
  getProductDetail,
  type ShopCategory,
  type ShopProduct,
  type ShopProductDetail,
  type ShopVariationSize,
} from '@/components/shop/shop-content'
import { productSlug, canonicalHandle } from '@/components/shop/product-slugs'

/** Pick the English value from Medusa `metadata` when the locale is `en`,
 *  falling back to the Greek default. */
function pick(locale: string, meta: unknown, key: string, fallback: string): string {
  if (locale === 'en') {
    const v = (meta as Record<string, unknown> | null | undefined)?.[key]
    if (typeof v === 'string' && v.trim()) return v
  }
  return fallback
}

/**
 * An SEO override from Medusa `metadata`, like the categories' (see
 * category-seo.ts): `meta_title` / `meta_description` for Greek, the `_en`
 * keys for English. No cross-language fallback — Greek copy must never become
 * an English page's title.
 */
function seoField(locale: string, meta: unknown, key: 'meta_title' | 'meta_description'): string | undefined {
  const v = (meta as Record<string, unknown> | null | undefined)?.[locale === 'en' ? `${key}_en` : key]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

/** Parse a JSON blob stored in Medusa `metadata` (the product-tab content is
 *  kept as a JSON string so the dashboard's flat metadata editor cannot mangle
 *  it). Returns undefined for anything unreadable — bad JSON in the admin must
 *  fall back to the editorial snapshot, never blank the tab. */
function parseMeta<T>(meta: unknown, key: string): T | undefined {
  const raw = (meta as Record<string, unknown> | null | undefined)?.[key]
  if (typeof raw !== 'string' || !raw.trim()) return undefined
  try {
    const parsed = JSON.parse(raw) as T
    return parsed && (!Array.isArray(parsed) || parsed.length) ? parsed : undefined
  } catch {
    return undefined
  }
}

/** Tab content for a locale: the admin's value for that language, then the
 *  editorial snapshot, then the Greek value the admin entered. */
function pickTab<T>(locale: string, meta: unknown, key: string, editorial: T | undefined): T | undefined {
  const greek = parseMeta<T>(meta, `${key}_json`)
  if (locale !== 'en') return greek ?? editorial
  return parseMeta<T>(meta, `${key}_en_json`) ?? editorial ?? greek
}

/**
 * Medusa → storefront adapter for the shop grid. Maps Store API products into
 * the `ShopProduct` shape the (client) <ShopBrowser> already renders, so the
 * grid, filters and infinite scroll are unchanged — only the data source moves
 * from the static snapshot to Medusa (the source of truth for catalogue + price
 * + stock). Editorial content (descriptions, nutrition) still comes from the
 * static PRODUCT_DETAILS on the detail page.
 */

const FIELDS = [
  'id',
  'title',
  'handle',
  'thumbnail',
  'metadata', // title_en / description_en (EN translations)
  '*images',
  '*categories',
  'categories.metadata', // name_en
  '*variants.calculated_price',
  '+variants.inventory_quantity',
  '+variants.manage_inventory', // required for inventory_quantity to populate
  '+variants.allow_backorder',
].join(',')

/** 3.5 → "€3,50" (Greek comma decimal). */
const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`

function mapProduct(p: HttpTypes.StoreProduct, locale: string): ShopProduct | null {
  const variants = p.variants ?? []
  const amounts = variants
    .map(
      (v) =>
        (v as { calculated_price?: HttpTypes.StoreCalculatedPrice }).calculated_price
          ?.calculated_amount,
    )
    .filter((n): n is number => n != null)
  if (!amounts.length) return null

  const min = Math.min(...amounts)
  const max = Math.max(...amounts)

  const catName = (p.categories ?? []).find((c) =>
    (SHOP_CATEGORIES as readonly string[]).includes(c.name),
  )?.name
  const category = (catName ?? p.categories?.[0]?.name ?? 'Μέλι') as ShopCategory

  const inStock = variants.some((v) => {
    const vv = v as {
      inventory_quantity?: number
      allow_backorder?: boolean
      manage_inventory?: boolean
    }
    if (vv.manage_inventory === false || vv.allow_backorder) return true
    return (vv.inventory_quantity ?? 0) > 0
  })

  // `category` stays the Greek canonical name (slug + filter matching); the
  // English display label is applied at render via `categoryLabel(category, locale)`.
  const title = pick(locale, p.metadata, 'title_en', p.title)

  return {
    handle: p.handle!,
    category,
    title,
    price: min === max ? euro(min) : `${euro(min)} – ${euro(max)}`,
    sortPrice: Math.round(min * 100),
    priceRange: [Math.round(min * 100), Math.round(max * 100)],
    inStock,
    image: p.thumbnail ?? p.images?.[0]?.url ?? '',
    imageAlt: title,
    // EN uses the live site's English product slug; EL uses the Greek handle.
    href: `/product/${productSlug(p.handle!, locale)}`,
    hidden: isHiddenProduct(p.metadata),
  }
}

/** A product flagged `metadata.hidden` in Medusa is reachable by its link but
 *  never listed (see ShopProduct.hidden). */
export function isHiddenProduct(metadata: Record<string, unknown> | null | undefined): boolean {
  const v = metadata?.hidden
  return v === true || v === 'true'
}

export type ShopCatalogue = {
  products: ShopProduct[]
  priceMin: number
  priceMax: number
}

/** Fetch the full published catalogue from Medusa, mapped for <ShopBrowser>. */
export async function listShopProducts(): Promise<ShopCatalogue | null> {
  const region = await getDefaultRegion()
  if (!region) return null
  const locale = await getLocale()

  const { products } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
    '/store/products',
    {
      method: 'GET',
      query: { limit: 200, region_id: region.id, fields: FIELDS },
      cache: 'force-cache',
      next: { tags: ['products'], revalidate: CACHE_TTL },
    },
  )

  const mapped = products
    .map((p) => mapProduct(p, locale))
    .filter((p): p is ShopProduct => p != null && !p.hidden)
  if (!mapped.length) return null

  const priceMin = Math.floor(Math.min(...mapped.map((p) => p.priceRange![0])) / 100)
  const priceMax = Math.ceil(Math.max(...mapped.map((p) => p.priceRange![1])) / 100)
  return { products: mapped, priceMin, priceMax }
}

const DETAIL_FIELDS = [
  'id',
  'title',
  'handle',
  'description',
  'metadata', // title_en / description_en
  'thumbnail',
  '*images',
  // Which variant each product image belongs to — the per-size photos are
  // linked to their variant in the Medusa admin's variant editor (see
  // variantImages). `*variants` already carries each variant's own thumbnail.
  'images.variants.id',
  '*categories',
  'categories.metadata',
  '*variants',
  '*variants.options',
  '*variants.metadata', // variant title_en (container translations)
  '*variants.calculated_price',
  '+variants.inventory_quantity',
  '+variants.manage_inventory',
  '+variants.allow_backorder',
].join(',')

type MedusaVariant = {
  id: string
  title: string
  thumbnail?: string | null
  options?: { value: string; option?: { title: string } }[]
  calculated_price?: HttpTypes.StoreCalculatedPrice
}

type MedusaImage = { id: string; url: string; rank?: number | null; variants?: { id: string }[] | null }

/**
 * The photos that belong to one variant, as set in the Medusa admin's variant
 * editor: its «Κύρια εικόνα» (`variant.thumbnail`) first, then every product
 * image ticked for that size, in the product's own image order. The first one
 * is the size's photo; the rest still reach the gallery, because the editor
 * lets a shop manager give one size more than one picture.
 *
 * The links are read from `images.variants.id` — `variant.images` cannot be
 * used, because Medusa fills it with every product image that belongs to no
 * variant as well, so it would hand every size the main catalogue photo. (The
 * admin's variant-thumbnails widget resolves it the same way.)
 *
 * Empty while a size has no photo of its own — then the editorial snapshot's
 * per-size image is used, exactly as before.
 */
function variantImages(v: MedusaVariant, images: MedusaImage[]): string[] {
  const linked = images.filter((i) => i.variants?.some((x) => x.id === v.id)).map((i) => i.url)
  const main = v.thumbnail || undefined
  return main ? [main, ...linked.filter((url) => url !== main)] : linked
}

/**
 * The detail gallery with every per-size shot replaced by the photo that size
 * now carries in Medusa (`swap`), plus any linked photo the snapshot never had
 * (`added`, in size order) — <ProductGallery> only shows an image that is in
 * its list, so a size photo outside the gallery would be unreachable.
 *
 * A photo it brings in is never listed twice, and never repeats `main`, which
 * <ProductView> already puts in front of this list — two sizes sharing one
 * picture, or a size pointed at the catalogue photo, would otherwise show the
 * same thumbnail twice.
 *
 * With nothing linked in the admin the snapshot is handed back untouched — a
 * duplicate the snapshot itself contains is its own business (the pollen page
 * has one) and is left exactly as it is.
 */
function mergeGallery(
  gallery: string[] | undefined,
  added: string[],
  swap: Map<string, string>,
  main: string,
): string[] | undefined {
  if (!swap.size && !added.length) return gallery
  const out: string[] = []
  for (const src of gallery ?? []) {
    const live = swap.get(src)
    // This size's shot now IS the catalogue photo in front of the gallery.
    if (live === main) continue
    const url = live ?? src
    if (!out.includes(url)) out.push(url)
  }
  for (const url of added) if (url !== main && !out.includes(url)) out.push(url)
  return out.length ? out : gallery
}

/** Multi-variant honeys have a single "Μέγεθος" option → its value is the size
 *  label (e.g. "330g"). Fall back to the first option value, then the title. */
const sizeLabel = (v: MedusaVariant) =>
  v.options?.find((o) => o.option?.title === 'Μέγεθος')?.value ?? v.options?.[0]?.value ?? v.title

/**
 * A single product for the detail page: catalogue/price/stock/variant-ids from
 * Medusa, merged with the static editorial content (descriptions, nutrition,
 * per-size containers + images, cross-sell) keyed by handle.
 */
export async function getShopProduct(
  handle: string,
): Promise<{ product: ShopProduct; detail: ShopProductDetail } | null> {
  const region = await getDefaultRegion()
  if (!region) return null

  // The URL slug may be the English one (/en/product/oros-machaira-blossom-honey)
  // or the Greek handle — resolve to the canonical Greek handle Medusa stores.
  const greek = canonicalHandle(handle)

  const { products } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
    '/store/products',
    {
      method: 'GET',
      query: { handle: greek, region_id: region.id, fields: DETAIL_FIELDS, limit: 1 },
      cache: 'force-cache',
      next: { tags: ['products', `product-${greek}`], revalidate: CACHE_TTL },
    },
  )
  const m = products?.[0]
  if (!m) return null

  const locale = await getLocale()
  const base = mapProduct(m, locale)
  if (!base) return null

  const staticDetail = getProductDetail(greek, locale)
  const variants = (m.variants ?? []) as unknown as MedusaVariant[]
  const multi = variants.length > 1

  let sizes: ShopVariationSize[] | undefined
  let gallery = staticDetail.gallery
  let generalImages: string[] | undefined
  if (multi) {
    const staticSizes = staticDetail.variations?.sizes ?? []
    const images = [...((m.images ?? []) as unknown as MedusaImage[])].sort(
      (a, b) => (a.rank ?? 0) - (b.rank ?? 0),
    )
    // Once any size has a photo of its own in Medusa, the gallery follows Medusa:
    // a size shows its own photos, and the product's photos that belong to no
    // size make up the general gallery. Until then, the editorial snapshot.
    const perVariant = images.some((i) => (i.variants ?? []).length > 0)
    // The Greek entries, whose labels are Medusa's own option values. The
    // gallery is the same list in both languages and its per-size shots are
    // these images, so they are what a live photo replaces — on /en too, where
    // the English labels ("100 g") match nothing (see `mismatch` below).
    const greekSizes =
      locale === 'en' ? (getProductDetail(greek).variations?.sizes ?? []) : staticSizes

    const rows = variants
      .map((v) => {
        const label = sizeLabel(v)
        const st = staticSizes.find((s) => s.label === label)
        const live = variantImages(v, images)
        const amount = v.calculated_price?.calculated_amount ?? 0
        // A size the Greek snapshot knows but this locale's does not is the
        // English label mismatch ("100 g" vs Medusa's "100g"), nothing else:
        // those chips have always rendered without a photo (and without a
        // container), and giving them one would start swapping the main image
        // and make a gallery click select a size. Left alone — fixing the
        // labels also brings the missing English containers back, and that is a
        // visible change of its own. The English gallery does follow the link
        // below, so a photo changed in the admin is never stale in English.
        const mismatch = !st && greekSizes.some((s) => s.label === label)
        return {
          live,
          size: {
            label,
            container: st?.container,
            price: euro(amount),
            sortPrice: Math.round(amount * 100),
            // Per-size photos come from Medusa by variant id, so the English
            // label mismatch no longer leaves a size without its photo.
            image: perVariant ? live[0] : mismatch ? undefined : (live[0] ?? st?.image),
            ...(perVariant ? { images: live } : {}),
            variantId: v.id,
          },
        }
      })
      .sort((a, b) => a.size.sortPrice - b.size.sortPrice)

    sizes = rows.map((r) => r.size)

    // Where a size now has its own photo in Medusa, that photo takes the place
    // of the snapshot's shot for the same size; a photo the snapshot never had
    // is appended (in size order) so the gallery can still reach it.
    const swap = new Map<string, string>()
    const added: string[] = []
    for (const { live, size } of rows) {
      if (!live.length) continue
      for (const list of [greekSizes, staticSizes]) {
        const editorial = list.find((s) => s.label === size.label)?.image
        if (editorial && editorial !== live[0]) swap.set(editorial, live[0])
      }
      added.push(...live)
    }
    gallery = mergeGallery(staticDetail.gallery, added, swap, base.image)

    if (perVariant) {
      const unique = (urls: string[]) => [...new Set(urls.filter(Boolean))]
      generalImages = unique([base.image, ...images.filter((i) => !(i.variants ?? []).length).map((i) => i.url)])
      // Every photo of the product, for consumers that list them all (JSON-LD).
      gallery = unique([...generalImages, ...rows.flatMap((r) => r.live)])
    }
  }

  const product: ShopProduct = {
    ...base,
    variantId: multi ? undefined : variants[0]?.id,
  }
  // EN description: prefer the Medusa `description_en`, then the (locale-selected)
  // editorial, then the Greek Medusa description.
  const enDesc = locale === 'en' ? pick(locale, m.metadata, 'description_en', '') : ''
  const detail: ShopProductDetail = {
    ...staticDetail,
    gallery,
    generalImages,
    description: enDesc || staticDetail.description || m.description || '',
    // «Περιγραφή» / «Διατροφική Αξία» tabs — editable in the Medusa admin.
    sections: pickTab(locale, m.metadata, 'sections', staticDetail.sections),
    nutrition: pickTab(locale, m.metadata, 'nutrition', staticDetail.nutrition),
    variations: sizes ? { sizes } : undefined,
    metaTitle: seoField(locale, m.metadata, 'meta_title'),
    metaDescription: seoField(locale, m.metadata, 'meta_description'),
  }
  return { product, detail }
}

export type VariantPick = { variantId: string; sortPrice: number }

/**
 * A variant id + price (cents) per handle, for one-click "add" buttons outside
 * the product page (cross-sell rows, the home flatlay hotspots). Picks the size
 * named in `sizes` (e.g. `{ 'thymarisio-meli-oros-machaira': '790g' }`), else
 * the cheapest variant. A handle whose named size no longer exists is left out,
 * so the caller never adds a different jar from the one it advertises.
 */
export async function getAddonVariants(
  handles: string[],
  sizes: Record<string, string> = {},
): Promise<Record<string, VariantPick>> {
  if (!handles.length) return {}
  const region = await getDefaultRegion()
  if (!region) return {}

  const { products } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
    '/store/products',
    {
      method: 'GET',
      query: {
        handle: handles,
        region_id: region.id,
        fields: 'handle,*variants.options,*variants.calculated_price',
        limit: handles.length,
      },
      cache: 'force-cache',
      next: { tags: ['products'], revalidate: CACHE_TTL },
    },
  )

  const out: Record<string, VariantPick> = {}
  for (const p of products ?? []) {
    const variants = (p.variants ?? []) as unknown as MedusaVariant[]
    const size = p.handle ? sizes[p.handle] : undefined
    const pick = size
      ? variants.find((v) => sizeLabel(v) === size)
      : [...variants].sort(
          (a, b) =>
            (a.calculated_price?.calculated_amount ?? 0) -
            (b.calculated_price?.calculated_amount ?? 0),
        )[0]
    if (p.handle && pick) {
      out[p.handle] = {
        variantId: pick.id,
        sortPrice: Math.round((pick.calculated_price?.calculated_amount ?? 0) * 100),
      }
    }
  }
  return out
}
