import type { HomeContent, HoneyProduct } from '@/components/home/home-content'
import type { TeaserPost } from '@/components/home/blog-teaser-view'
import type { VariantPick } from '@/lib/medusa/shop'

/**
 * Live data some sections show next to their stored copy — current shop
 * prices, the newest articles, the flatlay's variants, the site's social links.
 * It is resolved per request (live.server.ts) and handed to blocks through
 * Puck's `metadata`; it is never saved into a page.
 */
export type LiveData = {
  /** handle → current price label and category name */
  catalogue?: Record<string, { price: string; category: string }>
  /** the three newest articles */
  posts?: TeaserPost[]
  /** handle → the variant a flatlay hotspot adds to the cart */
  flatlay?: Record<string, VariantPick>
  social?: HomeContent['FOOTER']['social']
}

export type BlockMetadata = { locale: string; live: LiveData }

/** The curated deal cards with price and category from the live catalogue. */
export function withCatalogue(products: HoneyProduct[], catalogue: LiveData['catalogue']): HoneyProduct[] {
  if (!catalogue) return products
  return products.map((p) => {
    const handle = p.href.match(/\/product\/([^/]+)/)?.[1]
    const live = handle ? catalogue[handle] : undefined
    return live ? { ...p, price: live.price, category: live.category } : p
  })
}
