import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'
import { PRODUCT_HANDLE_EN } from './src/components/shop/product-slugs'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Under /en, the live site serves products at English slugs. Redirect the Greek
// handle to the English slug so every EN product URL matches orosmaxaira.com.
// trailingSlash: true means the normalized path has a trailing slash, so match
// that form (the plain form 308s to add the slash first, then this fires).
const enProductRedirects = Object.entries(PRODUCT_HANDLE_EN).map(([el, en]) => ({
  source: `/en/product/${el}/`,
  destination: `/en/product/${en}/`,
  permanent: true,
}))

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Match the live site's URL scheme (Greek permalinks with trailing slashes).
  trailingSlash: true,
  async redirects() {
    // Old storefront paths → new Greek permalinks (safety net for bookmarks).
    return [
      { source: '/shop', destination: '/proionta', permanent: true },
      { source: '/shop/:handle', destination: '/product/:handle', permanent: true },
      { source: '/about', destination: '/poioi-eimaste', permanent: true },
      { source: '/contact', destination: '/epikoinonia', permanent: true },
      { source: '/adopt-a-hive', destination: '/yiotheto-mia-kypseli', permanent: true },
      { source: '/privacy', destination: '/privacy-amp-cookie-policy', permanent: true },
      // Articles keep the root permalinks of the previous site: /<slug>/ and
      // /en/<slug>/. The interim /blog/<slug>/ URLs 301 there; the /blog index stays.
      { source: '/blog/:slug/', destination: '/:slug/', permanent: true },
      { source: '/en/blog/:slug/', destination: '/en/:slug/', permanent: true },
      // Under /en, Greek product handles redirect to the live site's English slug.
      ...enProductRedirects,
    ]
  },
  // Lint runs in the editor/CI, not as a deploy gate.
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  experimental: {
    reactCompiler: false,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    const securityHeaders = {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    }

    // Long-lived immutable caching of static chunks is only safe in production,
    // where Next.js content-hashes chunk filenames (new build ⇒ new URL). In
    // dev the filenames are stable (e.g. page.js), so an immutable header makes
    // the browser keep serving the first — possibly broken — chunk it cached
    // after every edit, surfacing as "Cannot read properties of undefined
    // (reading 'call')" / hydration errors until a manual hard refresh.
    if (process.env.NODE_ENV !== 'production') {
      return [securityHeaders]
    }

    return [
      securityHeaders,
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
