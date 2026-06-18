import type { MetadataRoute } from 'next'

/**
 * Block all crawlers — the site is intentionally NOT indexed (pre-launch).
 * To allow indexing at launch, restore allow rules + the sitemap reference and
 * flip the metadata/header noindex (see layout.tsx `robots` and middleware.ts).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  }
}
