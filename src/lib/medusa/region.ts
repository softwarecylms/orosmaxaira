import { sdk } from './client'
import type { HttpTypes } from '@medusajs/types'

let cached: HttpTypes.StoreRegion | null = null

/**
 * Resolve the storefront's region. This is a single-region shop, so we use the
 * first region configured in Medusa (seeded as "Europe" / EUR). Cached per
 * server instance; the fetch itself is also cached + tagged for revalidation.
 */
export async function getDefaultRegion(): Promise<HttpTypes.StoreRegion | null> {
  if (cached) return cached
  try {
    const { regions } = await sdk.client.fetch<{
      regions: HttpTypes.StoreRegion[]
    }>('/store/regions', {
      method: 'GET',
      cache: 'force-cache',
      next: { tags: ['regions'] },
    })
    cached = regions?.[0] ?? null
    return cached
  } catch {
    return null
  }
}
