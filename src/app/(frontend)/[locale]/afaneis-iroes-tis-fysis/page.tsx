import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { PageHero } from '@/components/shared/page-hero'
import { AdoptHiveBanner } from '@/components/home/adopt-hive-banner'
import { NatureMatters, NatureStats, NatureStory } from '@/components/sections/nature'
import { seoMetadata } from '@/lib/seo'
import { loadNatureContent } from '@/lib/content/load'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { meta } = await loadNatureContent(locale)
  return seoMetadata({
    locale,
    path: '/afaneis-iroes-tis-fysis',
    title: meta.title,
    description: meta.description,
  })
}

export default async function NatureHeroesPage() {
  const n = await loadNatureContent(await getLocale())

  return (
    <>
      <div data-edit="hero">
        <PageHero
          image={n.hero.image}
          imageAlt={n.hero.imageAlt}
          eyebrow={n.hero.eyebrow}
          title={n.hero.title}
          description={n.hero.description}
        />
      </div>

      <div data-edit="sections">
        <NatureStory content={n.sections[0]} />
      </div>

      <NatureStats content={n.stats} />

      {n.sections.slice(1).map((s) => (
        <div data-edit="sections" key={s.heading}>
          <NatureStory content={s} />
        </div>
      ))}

      <div data-edit="adoptBody">
        <AdoptHiveBanner body={n.adoptBody} />
      </div>

      <NatureMatters content={n.matters} />
    </>
  )
}
