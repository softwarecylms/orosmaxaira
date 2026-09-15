import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { AwardsHero } from '@/components/awards/awards-hero'
import { AwardsList } from '@/components/sections/awards'
import { seoMetadata } from '@/lib/seo'
import { loadAwardsContent } from '@/lib/content/load'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { meta } = await loadAwardsContent(locale)
  return seoMetadata({
    locale,
    path: '/vraveia',
    title: meta.title,
    description: meta.description,
  })
}

/** Awards / Διακρίσεις showcase — title banner + one full-width section per award. */
export default async function AwardsPage() {
  const { hero, awards } = await loadAwardsContent(await getLocale())
  return (
    <>
      <div data-edit="hero">
        <AwardsHero
          image={hero.image}
          imageAlt={hero.imageAlt}
          title={hero.title}
          description={hero.description}
        />
      </div>
      <AwardsList content={awards} />
    </>
  )
}
