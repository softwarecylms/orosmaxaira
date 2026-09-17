import type { HttpTypes } from '@medusajs/types'
import { sdk } from '@/lib/medusa/client'
import { getDefaultRegion } from '@/lib/medusa/region'
import { isHiddenProduct } from '@/lib/medusa/shop'
import { siteUrl } from '@/lib/seo'

/**
 * /klaviyo-catalog.json — the product catalogue Klaviyo reads (Content → Products
 * → Custom catalog sources) for product blocks and recommendations. Klaviyo
 * re-fetches it every six hours.
 *
 * `id` is the Greek product handle, the same id the browser events and the
 * Medusa order events use, so Klaviyo can match them. Hidden products (like the
 * €1 test product) are left out. Prices are the lowest variant price in euros.
 */
export const revalidate = 3600

const FIELDS = [
  'id',
  'title',
  'handle',
  'description',
  'thumbnail',
  'metadata',
  '*images',
  '*categories',
  '*variants.calculated_price',
  '+variants.inventory_quantity',
  '+variants.manage_inventory',
  '+variants.allow_backorder',
].join(',')

const plain = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/[*_#>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export async function GET() {
  const site = siteUrl().startsWith('https://') ? siteUrl() : 'https://orosmaxaira.com'
  const absolute = (url?: string | null) => (!url ? '' : /^https?:\/\//.test(url) ? url : `${site}${url}`)

  const region = await getDefaultRegion().catch(() => null)
  const { products } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>('/store/products', {
    method: 'GET',
    query: { limit: 200, fields: FIELDS, ...(region ? { region_id: region.id } : {}) },
    next: { revalidate: 3600, tags: ['products'] },
  })

  const items = (products ?? [])
    .filter((p) => p.handle && !isHiddenProduct(p.metadata))
    .map((p) => {
      const variants = (p.variants ?? []) as Array<{
        calculated_price?: { calculated_amount?: number | null } | null
        inventory_quantity?: number | null
        manage_inventory?: boolean | null
        allow_backorder?: boolean | null
      }>
      const prices = variants
        .map((v) => v.calculated_price?.calculated_amount)
        .filter((n): n is number => typeof n === 'number')
      const untracked = variants.some((v) => v.manage_inventory === false || v.allow_backorder)
      const stock = variants.reduce((sum, v) => sum + Math.max(0, v.inventory_quantity ?? 0), 0)
      const title = p.title ?? p.handle!
      return {
        id: p.handle!,
        title,
        link: `${site}/product/${p.handle}/`,
        description: plain(p.description ?? '').slice(0, 500) || title,
        price: prices.length ? Math.min(...prices) : 0,
        image_link: absolute(p.thumbnail ?? p.images?.[0]?.url),
        categories: (p.categories ?? []).map((c) => c.name).filter(Boolean),
        inventory_quantity: untracked ? 999 : stock,
        // 1 = keep out-of-stock products out of Klaviyo's recommendations.
        inventory_policy: 1,
      }
    })
    .filter((item) => item.price > 0 && item.image_link)

  return Response.json(items, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600' } })
}
