'use server'

import type { HttpTypes } from '@medusajs/types'
import { sdk } from './client'
import { getDefaultRegion } from './region'

/**
 * Today's price, in cents, of each cart line's variant — what Medusa will charge.
 *
 * The cart lives in the browser and keeps the unit price from the moment a
 * product was added, so a price changed in the admin afterwards (or a sale
 * price starting/ending) left that cart permanently out of step with Medusa:
 * prepareMedusaOrder refused it with "Your order total changed", and refreshing
 * the page did not help. The checkout re-prices the cart with this on arrival
 * and after any total mismatch.
 *
 * Not cached: it must see the price Medusa will charge right now. Returns only
 * the variants it found; an error returns {} (the server-side total check still
 * protects the customer).
 */
export async function currentCartPrices(
  lines: { handle: string; variantId?: string }[],
): Promise<Record<string, number>> {
  const handles = [...new Set(lines.map((l) => l.handle).filter(Boolean))]
  if (!handles.length) return {}
  try {
    const region = await getDefaultRegion()
    if (!region) return {}
    const { products } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      '/store/products',
      {
        method: 'GET',
        query: {
          handle: handles,
          region_id: region.id,
          fields: 'handle,variants.id,*variants.calculated_price',
          limit: handles.length,
        },
        cache: 'no-store',
      },
    )
    const prices: Record<string, number> = {}
    for (const p of products) {
      for (const v of p.variants ?? []) {
        const amount = v.calculated_price?.calculated_amount
        if (v.id && amount != null) prices[v.id] = Math.round(Number(amount) * 100)
      }
    }
    return prices
  } catch {
    return {}
  }
}
