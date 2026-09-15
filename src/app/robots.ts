import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

/** Pages that only mean something to one visitor: the basket, checkout, an
 *  order confirmation and the account area. They also carry a noindex. */
const PRIVATE = ['/cart/', '/checkout/', '/order/', '/account/']

/**
 * Crawling is open. On any host other than the public domain the middleware
 * answers `X-Robots-Tag: noindex` instead — deliberately not a Disallow here,
 * which would stop Google from ever seeing that header.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...PRIVATE, ...PRIVATE.map((p) => `/en${p}`), '/admin/', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
