import { getLocale } from 'next-intl/server'
import { type HoneyProduct } from './home-content'
import { listShopProducts } from '@/lib/medusa/shop'
import { categoryLabel } from '@/components/shop/shop-content'
import { loadHomeContent } from '@/lib/content/load'
import { DealOfMonthView } from './deal-of-month-view'

/**
 * Loads the section's copy and renders DealOfMonthView with live prices.
 *
 * Prices come from Medusa (the shop is the source of truth) so a card can never
 * advertise a different price from the product page. The curated list keeps its
 * own order, images and titles; only the price is taken live. If Medusa is
 * unreachable the static price stays as the fallback.
 */
export async function DealOfMonth({ products }: { products?: HoneyProduct[] }) {
  const locale = await getLocale()
  const { DEAL } = await loadHomeContent(locale)
  const curated = (products?.length ? products : DEAL.products).slice(0, 5)
  return <DealOfMonthView content={DEAL} products={await withLivePrices(curated, locale)} />
}

/** The curated cards with price and category taken from the live catalogue. */
export async function withLivePrices(curated: HoneyProduct[], locale: string): Promise<HoneyProduct[]> {
  const catalogue = await listShopProducts().catch(() => null)
  if (!catalogue) return curated
  return curated.map((p) => {
    const handle = p.href.match(/\/product\/([^/]+)/)?.[1]
    const live = handle ? catalogue.products.find((x) => x.handle === handle) : undefined
    // Category too: Royal Jelly and Mead are Bee Products, not Honey.
    return live ? { ...p, price: live.price, category: categoryLabel(live.category, locale) } : p
  })
}
