import type { Metadata } from 'next'
import { Gabarito, Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { MotionReady } from '@/components/motion/motion-ready'
import { CartProvider } from '@/components/commerce/cart-store'
import { routing } from '@/i18n/routing'

import '@measured/puck/puck.css'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Visual Editor — CMS',
  robots: { index: false, follow: false },
}

// Same fonts as the site, so blocks look exactly as they do on the live page.
const sans = Inter({ subsets: ['latin', 'greek'], variable: '--font-sans', display: 'swap', weight: ['400', '500', '600', '700'] })
const display = Gabarito({ subsets: ['latin', 'latin-ext'], variable: '--font-display', display: 'swap', weight: ['600', '700'] })

/**
 * The visual editor's own page (opened inside the Payload admin): the site's
 * styles, fonts, translations and cart context, without the site's header and
 * footer.
 */
export default async function EditorLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} className={`${sans.variable} ${display.variable}`}>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MotionReady>
            <CartProvider>{children}</CartProvider>
          </MotionReady>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
