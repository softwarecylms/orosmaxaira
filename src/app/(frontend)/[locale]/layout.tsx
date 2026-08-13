import type { Metadata, Viewport } from 'next'
import { Gabarito, Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { OrganizationSchema } from '@/components/seo/organization-schema'
import { MotionReady } from '@/components/motion/motion-ready'
import { CartProvider } from '@/components/commerce/cart-store'
import { CartDrawer } from '@/components/commerce/cart-drawer'
import { getSiteSettings, getHeader, getFooter } from '@/lib/cms'
import { siteUrl } from '@/lib/seo'
import { routing, type Locale } from '@/i18n/routing'

import '@/styles/globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

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
  // Light-only design — stops mobile browsers (Samsung Internet / Chrome
  // "force dark") from auto-inverting the brand gold into a burgundy tint.
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'layout' })
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: t('defaultTitle'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    openGraph: {
      type: 'website',
      siteName: t('siteName'),
      locale: locale === 'en' ? 'en_US' : 'el_GR',
      alternateLocale: locale === 'en' ? 'el_GR' : 'en_US',
    },
    twitter: { card: 'summary_large_image' },
    // Pre-launch: keep the site out of search results. Flip to true at launch.
    robots: { index: false, follow: false },
  }
}

export default async function FrontendLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const [settings, header, footer] = await Promise.all([
    getSiteSettings(),
    getHeader(),
    getFooter(),
  ])

  return (
    <html lang={locale} className={`${sans.variable} ${display.variable}`}>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <NextIntlClientProvider>
          <MotionReady>
            <CartProvider>
              <SiteHeader
                header={header}
                settings={settings}
                variant="default"
                locale={locale as Locale}
              />
              <main id="main">{children}</main>
              <SiteFooter
                footer={footer}
                settings={settings}
                variant="default"
                locale={locale as Locale}
              />
              <CartDrawer />
              <OrganizationSchema settings={settings} />
            </CartProvider>
          </MotionReady>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
