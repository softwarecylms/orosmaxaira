'use server'

import type { HttpTypes } from '@medusajs/types'
import { sdk } from './client'
import { getDefaultRegion } from './region'

/**
 * Does any of these cart lines currently sell at a sale price («Τιμή έκπτωσης»,
 * a Medusa price list of type `sale`)? Asked when a code that excludes sale
 * items (WELCOME10) is entered, so the customer hears it at once rather than at
 * payment. Not cached: it is one read per code entry, and a stale "not on sale"
 * would only move the refusal to payment — `prepareMedusaOrder` checks the real
 * cart lines again there, and that check is the one that counts.
 *
 * Fails open (false) on any error for the same reason.
 */
export async function cartHasSaleItems(
  lines: { handle: string; variantId?: string }[],
): Promise<boolean> {
  const handles = [...new Set(lines.map((l) => l.handle).filter(Boolean))]
  const variantIds = new Set(lines.map((l) => l.variantId).filter(Boolean))
  if (!handles.length) return false
  try {
    const region = await getDefaultRegion()
    if (!region) return false
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
    return products.some((p) =>
      (p.variants ?? []).some((v) => {
        if (variantIds.size && !variantIds.has(v.id)) return false
        const cp = v.calculated_price
        return (
          cp?.calculated_price?.price_list_type === 'sale' &&
          Number(cp.original_amount ?? 0) > Number(cp.calculated_amount ?? 0)
        )
      }),
    )
  } catch {
    return false
  }
}
