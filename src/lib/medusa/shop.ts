import type { HttpTypes } from '@medusajs/types'
import { getLocale } from 'next-intl/server'
import { sdk } from './client'
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
  }
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
      next: { tags: ['products'] },
    },
  )

  const mapped = products
    .map((p) => mapProduct(p, locale))
    .filter((p): p is ShopProduct => p != null)
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
  options?: { value: string; option?: { title: string } }[]
  calculated_price?: HttpTypes.StoreCalculatedPrice
}

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
      next: { tags: ['products', `product-${greek}`] },
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
  if (multi) {
    const staticSizes = staticDetail.variations?.sizes ?? []
    sizes = variants
      .map((v) => {
        // Multi-variant honeys have a single "Μέγεθος" option → its value is the
        // size label (e.g. "330g"). Fall back to the first option value, then title.
        const label =
          v.options?.find((o) => o.option?.title === 'Μέγεθος')?.value ??
          v.options?.[0]?.value ??
          v.title
        const st = staticSizes.find((s) => s.label === label)
        const amount = v.calculated_price?.calculated_amount ?? 0
        return {
          label,
          container: st?.container,
          price: euro(amount),
          sortPrice: Math.round(amount * 100),
          image: st?.image,
          variantId: v.id,
        }
      })
      .sort((a, b) => a.sortPrice - b.sortPrice)
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
    description: enDesc || staticDetail.description || m.description || '',
    variations: sizes ? { sizes } : undefined,
  }
  return { product, detail }
}

/** Default variant id + formatted price per handle — for the cross-sell "add" buttons. */
export async function getAddonVariants(
  handles: string[],
): Promise<Record<string, { variantId: string; sortPrice: number }>> {
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
        fields: 'handle,*variants.calculated_price',
        limit: handles.length,
      },
      cache: 'force-cache',
      next: { tags: ['products'] },
    },
  )

  const out: Record<string, { variantId: string; sortPrice: number }> = {}
  for (const p of products ?? []) {
    const variants = (p.variants ?? []) as unknown as MedusaVariant[]
    const cheapest = [...variants].sort(
      (a, b) =>
        (a.calculated_price?.calculated_amount ?? 0) -
        (b.calculated_price?.calculated_amount ?? 0),
    )[0]
    if (p.handle && cheapest) {
      out[p.handle] = {
        variantId: cheapest.id,
        sortPrice: Math.round((cheapest.calculated_price?.calculated_amount ?? 0) * 100),
      }
    }
  }
  return out
}
