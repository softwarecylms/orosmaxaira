import type { Metadata } from 'next'
import { hreflangAlternates } from '@/lib/seo'
import { HeroPair } from '@/components/home/hero-pair'
import { TrustBadges } from '@/components/home/trust-badges'
import { DealOfMonth } from '@/components/home/deal-of-month'
import { Ticker } from '@/components/home/ticker'
import { ProductCategories } from '@/components/home/product-categories'
import { AdoptHiveBanner } from '@/components/home/adopt-hive-banner'
import { Heritage } from '@/components/home/heritage'
import { FlatlayBand } from '@/components/home/flatlay-band'
import { BlogTeaser } from '@/components/home/blog-teaser'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  // Title/description inherit from the locale-aware root layout; add hreflang.
  return { alternates: hreflangAlternates(locale, '/') }
}

/**
 * Bespoke OROS MACHAIRA home page — section-by-section pixel build from Figma.
 * Sections are composed directly here (not via Puck) and read static content
 * from `home-content.ts`, with live Medusa/Payload data passed in where wired.
 */
export default async function HomePage() {
  return (
    <>
      <HeroPair />
      <TrustBadges />
      <DealOfMonth />
      <Ticker />
      <ProductCategories />
      <AdoptHiveBanner />
      <Heritage />
      <FlatlayBand />
      <BlogTeaser />
    </>
  )
}
