import { absoluteUrl } from '@/lib/seo'

/**
 * Article permalinks — the single source of truth.
 *
 * The previous WordPress site served articles straight off the site root, with
 * no `/blog/` segment:
 *   el → https://orosmaxaira.com/<slug>/
 *   en → https://orosmaxaira.com/en/<slug>/
 * We keep exactly those URLs so existing links, shares and search rankings
 * survive the move. `/blog/<slug>/` 301s here (see `next.config.ts`); `/blog`
 * itself stays as the article index.
 */

/**
 * Href for next-intl's `<Link>`, which adds the `/en` prefix itself — so this
 * must stay locale-agnostic. Also the `path` to hand `hreflangAlternates`.
 */
export function articlePath(slug: string): string {
  return `/${slug}`
}

/** Absolute, locale-prefixed permalink (canonical tags, share links, sitemap). */
export function articleUrl(slug: string, locale: string): string {
  const path = `/${slug}/`
  return absoluteUrl(locale === 'en' ? `/en${path}` : path)
}
