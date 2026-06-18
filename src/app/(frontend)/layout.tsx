import type { Metadata, Viewport } from 'next'
import { Gabarito, Inter } from 'next/font/google'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { OrganizationSchema } from '@/components/seo/organization-schema'
import { MotionReady } from '@/components/motion/motion-ready'
import { getSiteSettings, getHeader, getFooter } from '@/lib/cms'
import { siteUrl } from '@/lib/seo'

import '@/styles/globals.css'

// The shared SiteHeader reads the request pathname via `headers()` (a dynamic
// API) to highlight the active nav link. That makes the whole (frontend) tree
// dynamic, which conflicts with the `revalidate`/`generateStaticParams` ISR
// config on the dynamic-segment routes (e.g. [slug]) and throws
// DYNAMIC_SERVER_USAGE -> 500 in production. Forcing the segment dynamic here
// resolves it for every route under this layout in one place.
export const dynamic = 'force-dynamic'

// Inter (body) carries the Greek subset; Gabarito (display) is latin-only, so
// Greek headings fall through to Inter via the --font-display chain in globals.
const sans = Inter({
  subsets: ['latin', 'greek'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const display = Gabarito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  weight: ['600', '700'],
})

export const viewport: Viewport = {
  themeColor: '#F1AC10',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Όρος Μαχαιρά — Αυθεντικό Κυπριακό Μέλι',
    template: '%s | Όρος Μαχαιρά',
  },
  description:
    '100% ανεπεξέργαστο μέλι από τα άνθη και τα βότανα του Μαχαιρά. Βραβευμένο μέλι, υδρόμελο, βασιλικός πολτός και φυσικά καλλυντικά.',
  openGraph: {
    type: 'website',
    siteName: 'Όρος Μαχαιρά',
    locale: 'el_GR',
  },
  twitter: { card: 'summary_large_image' },
  // Pre-launch: keep the site out of search results. Flip to true at launch.
  robots: { index: false, follow: false },
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
    <html lang="el" className={`${sans.variable} ${display.variable}`}>
      <body className="bg-background text-foreground antialiased">
        <MotionReady>
          <SiteHeader header={header} settings={settings} variant="default" />
          <main id="main">{children}</main>
          <SiteFooter footer={footer} settings={settings} variant="default" />
          <OrganizationSchema settings={settings} />
        </MotionReady>
      </body>
    </html>
  )
}
