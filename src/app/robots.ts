import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()
  const isProd = process.env.NODE_ENV === 'production' && !base.includes('staging')

  return {
    rules: isProd
      ? [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
