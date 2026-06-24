import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
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

export default withPayload(nextConfig, { devBundleServerPackages: false })
