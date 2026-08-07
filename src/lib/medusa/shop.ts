import type { HttpTypes } from '@medusajs/types'
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
  '*images',
  '*categories',
  '*variants.calculated_price',
  '+variants.inventory_quantity',
  '+variants.manage_inventory', // required for inventory_quantity to populate
  '+variants.allow_backorder',
].join(',')

/** 3.5 → "€3,50" (Greek comma decimal). */
const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`

function mapProduct(p: HttpTypes.StoreProduct): ShopProduct | null {
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

  return {
    handle: p.handle!,
    category,
    title: p.title,
    price: min === max ? euro(min) : `${euro(min)} – ${euro(max)}`,
    sortPrice: Math.round(min * 100),
    priceRange: [Math.round(min * 100), Math.round(max * 100)],
    inStock,
    image: p.thumbnail ?? p.images?.[0]?.url ?? '',
    imageAlt: p.title,
    href: `/product/${p.handle}`,
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

  const { products } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
    '/store/products',
    {
      method: 'GET',
      query: { limit: 200, region_id: region.id, fields: FIELDS },
      cache: 'force-cache',
      next: { tags: ['products'] },
    },
  )

  const mapped = products.map(mapProduct).filter((p): p is ShopProduct => p != null)
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
  'thumbnail',
  '*images',
  '*categories',
  '*variants',
  '*variants.options',
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

  const { products } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
    '/store/products',
    {
      method: 'GET',
      query: { handle, region_id: region.id, fields: DETAIL_FIELDS, limit: 1 },
      cache: 'force-cache',
      next: { tags: ['products', `product-${handle}`] },
    },
  )
  const m = products?.[0]
  if (!m) return null

  const base = mapProduct(m)
  if (!base) return null

  const staticDetail = getProductDetail(handle)
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
  const detail: ShopProductDetail = {
    ...staticDetail,
    description: staticDetail.description || m.description || '',
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
