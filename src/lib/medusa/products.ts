import { sdk } from './client'
import type { HttpTypes } from '@medusajs/types'
import { getDefaultRegion } from './region'

// `region_id` is required for `calculated_price` to be populated on variants.
const LIST_FIELDS =
  'id,title,handle,thumbnail,*images,*variants.calculated_price'
const DETAIL_FIELDS =
  '*variants.calculated_price,*variants.options,*options,*options.values,*images,*categories,+metadata'

export type ProductListResult = {
  products: HttpTypes.StoreProduct[]
  count: number
}

/** Paginated product list, scoped to the default region's pricing. */
export async function listProducts(params?: {
  limit?: number
  offset?: number
  q?: string
}): Promise<ProductListResult> {
  const region = await getDefaultRegion()
  if (!region) return { products: [], count: 0 }

  const { products, count } = await sdk.client.fetch<ProductListResult>(
    '/store/products',
    {
      method: 'GET',
      query: {
        limit: params?.limit ?? 12,
        offset: params?.offset ?? 0,
        region_id: region.id,
        fields: LIST_FIELDS,
        ...(params?.q ? { q: params.q } : {}),
      },
      cache: 'force-cache',
      next: { tags: ['products'] },
    },
  )

  return { products, count }
}

/** Fetch a single product by its handle (used by the product detail page). */
export async function getProductByHandle(
  handle: string,
): Promise<HttpTypes.StoreProduct | null> {
  const region = await getDefaultRegion()
  if (!region) return null

  const { products } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[]
  }>('/store/products', {
    method: 'GET',
    query: {
      handle,
      region_id: region.id,
      fields: DETAIL_FIELDS,
      limit: 1,
    },
    cache: 'force-cache',
    next: { tags: ['products', `product-${handle}`] },
  })

  return products?.[0] ?? null
}
