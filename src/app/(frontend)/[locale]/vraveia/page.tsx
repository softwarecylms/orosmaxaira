import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { AwardsHero } from '@/components/awards/awards-hero'
import { AwardsList } from '@/components/sections/awards'
import { loadAwardsContent } from '@/lib/content/load'
import { ManagedPage, managedMetadata } from '@/lib/cms/pages'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { meta } = await loadAwardsContent(locale)
  return managedMetadata('vraveia', {
    locale,
    path: '/vraveia',
    title: meta.title,
    description: meta.description,
  })
}

/** Awards / Διακρίσεις showcase — title banner + one full-width section per award. */
async function AwardsPageStatic() {
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

/** The page as edited in Payload's visual editor; its built-in composition until then. */
export default async function AwardsPage() {
  return <ManagedPage slug="vraveia" locale={await getLocale()} fallback={<AwardsPageStatic />} />
}
