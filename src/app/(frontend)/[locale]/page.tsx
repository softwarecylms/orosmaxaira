import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { HeroPair } from '@/components/home/hero-pair'
import { TrustBadges } from '@/components/home/trust-badges'
import { DealOfMonth } from '@/components/home/deal-of-month'
import { Ticker } from '@/components/home/ticker'
import { ProductCategories } from '@/components/home/product-categories'
import { AdoptHiveBanner } from '@/components/home/adopt-hive-banner'
import { Heritage } from '@/components/home/heritage'
import { FlatlayBand } from '@/components/home/flatlay-band'
import { BlogTeaser } from '@/components/home/blog-teaser'
import { FLATLAY } from '@/components/home/home-content'
import { getAddonVariants } from '@/lib/medusa/shop'
import { loadHomeContent } from '@/lib/content/load'
import { ManagedPage, managedMetadata } from '@/lib/cms/pages'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'layout' })
  return managedMetadata('home', { locale, path: '/', title: t('defaultTitle'), description: t('description') })
}

/**
 * Bespoke OROS MACHAIRA home page — section-by-section pixel build from Figma.
 * Sections are composed directly here (not via Puck) and read static content
 * from `home-content.ts`, with live Medusa/Payload data passed in where wired.
 */
async function HomePageStatic() {
  const home = await loadHomeContent(await getLocale())
  // The flatlay hotspots add the exact jar in the photo, at its live price.
  const flatlayVariants = await getAddonVariants(
    FLATLAY.prices.map((p) => p.handle),
    Object.fromEntries(FLATLAY.prices.flatMap((p) => (p.size ? [[p.handle, p.size]] : []))),
  ).catch(() => ({}))

  return (
    <>
      <HeroPair />
      <TrustBadges />
      <DealOfMonth />
      <Ticker />
      <ProductCategories />
      <AdoptHiveBanner />
      <Heritage />
      <FlatlayBand flatlay={home.FLATLAY} variants={flatlayVariants} />
      <BlogTeaser />
    </>
  )
}

/** The page as edited in Payload's visual editor; its built-in composition until then. */
export default async function HomePage() {
  return <ManagedPage slug="home" locale={await getLocale()} fallback={<HomePageStatic />} />
}
