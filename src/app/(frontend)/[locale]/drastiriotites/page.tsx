import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { FactBand } from '@/components/activities/fact-band'
import {
  ActivitiesExperiences,
  ActivitiesHero,
  ActivitiesPrograms,
} from '@/components/sections/activities'
import { seoMetadata } from '@/lib/seo'
import { loadActivitiesContent } from '@/lib/content/load'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { meta } = await loadActivitiesContent(locale)
  return seoMetadata({ ...meta, locale, path: '/drastiriotites' })
}

export default async function ActivitiesPage() {
  const a = await loadActivitiesContent(await getLocale())

  return (
    <>
      <div data-edit="hero">
        <ActivitiesHero content={a.hero} />
      </div>
      <ActivitiesExperiences content={a.experiences} />
      <div data-edit="fact">
        <FactBand fact={a.fact} />
      </div>
      <ActivitiesPrograms content={a.programs} />
    </>
  )
}
