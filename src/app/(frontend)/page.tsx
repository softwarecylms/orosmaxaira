import type { Metadata } from 'next'
import { getPageBySlug } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'
import { HeroPair } from '@/components/home/hero-pair'
import { TrustBadges } from '@/components/home/trust-badges'
import { DealOfMonth } from '@/components/home/deal-of-month'
import { Ticker } from '@/components/home/ticker'
import { ProductCategories } from '@/components/home/product-categories'
import { AdoptHiveBanner } from '@/components/home/adopt-hive-banner'
import { Heritage } from '@/components/home/heritage'
import { FlatlayBand } from '@/components/home/flatlay-band'
import { BlogTeaser } from '@/components/home/blog-teaser'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('home')
  if (page) return pageMetadata(page)
  return {}
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
