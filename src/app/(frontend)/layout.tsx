import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { FooterCTA } from '@/components/layout/footer-cta'
import { OrganizationSchema } from '@/components/seo/organization-schema'
import { MotionReady } from '@/components/motion/motion-ready'
import { getSiteSettings, getHeader, getFooter } from '@/lib/cms'
import { siteUrl } from '@/lib/seo'

import '@/styles/globals.css'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const viewport: Viewport = {
  themeColor: '#1A1A1A',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Your Brand — Tagline goes here',
    template: '%s | Your Brand',
  },
  description:
    'One-sentence description of this site for search engines and social cards. Replace per project.',
  openGraph: {
    type: 'website',
    siteName: 'Your Brand',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, header, footer] = await Promise.all([
    getSiteSettings(),
    getHeader(),
    getFooter(),
  ])

  return (
    <html lang="en" className={sans.variable}>
      <body className="bg-background text-foreground antialiased">
        <MotionReady>
          <SiteHeader header={header} settings={settings} variant="default" />
          <main id="main">{children}</main>
          <FooterCTA settings={settings} />
          <SiteFooter footer={footer} settings={settings} variant="default" />
          <OrganizationSchema settings={settings} />
        </MotionReady>
      </body>
    </html>
  )
}
