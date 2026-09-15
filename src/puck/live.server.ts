import 'server-only'
import type { Data } from '@measured/puck'
import { getBlogPosts } from '@/components/blog/blog-data'
import { categoryLabel } from '@/components/shop/shop-content'
import { getAddonVariants, listShopProducts } from '@/lib/medusa/shop'
import { loadSiteContent } from '@/lib/content/load'
import type { LiveData } from './live'

/**
 * Resolve the live data the blocks on a page need (see live.ts). Only what the
 * page's blocks use is fetched, and a failing source leaves that part empty —
 * the blocks then show their stored copy.
 */
export async function resolveLive(data: Data | null | undefined, locale: string): Promise<LiveData> {
  const blocks = data?.content ?? []
  const types = new Set(blocks.map((b) => b.type))
  const live: LiveData = {}
  const tasks: Promise<void>[] = []

  if (types.has('BlogTeaser')) {
    live.posts = [...getBlogPosts(locale)]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
      .map(({ slug, title, image, excerpt }) => ({ slug, title, image, excerpt }))
  }

  if (types.has('DealOfMonth')) {
    tasks.push(
      listShopProducts()
        .then((catalogue) => {
          if (!catalogue) return
          live.catalogue = Object.fromEntries(
            catalogue.products
              .filter((p) => p.handle)
              .map((p) => [p.handle!, { price: p.price, category: categoryLabel(p.category, locale) }]),
          )
        })
        .catch(() => {}),
    )
  }

  if (types.has('FlatlayBand')) {
    const prices = blocks
      .filter((b) => b.type === 'FlatlayBand')
      .flatMap((b) => ((b.props as { prices?: { handle?: string; size?: string }[] }).prices ?? []))
      .filter((p): p is { handle: string; size?: string } => Boolean(p.handle))
    tasks.push(
      getAddonVariants(
        prices.map((p) => p.handle),
        Object.fromEntries(prices.filter((p) => p.size).map((p) => [p.handle, p.size!])),
      )
        .then((variants) => {
          live.flatlay = variants
        })
        .catch(() => {}),
    )
  }

  if (types.has('ContactConnect')) {
    tasks.push(
      loadSiteContent(locale)
        .then((site) => {
          live.social = site.FOOTER.social
        })
        .catch(() => {}),
    )
  }

  await Promise.all(tasks)
  return live
}
