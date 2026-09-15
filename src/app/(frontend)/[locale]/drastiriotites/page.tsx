import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { FactBand } from '@/components/activities/fact-band'
import {
  ActivitiesExperiences,
  ActivitiesHero,
  ActivitiesPrograms,
} from '@/components/sections/activities'
import { loadActivitiesContent } from '@/lib/content/load'
import { ManagedPage, managedMetadata } from '@/lib/cms/pages'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { meta } = await loadActivitiesContent(locale)
  return managedMetadata('drastiriotites', { ...meta, locale, path: '/drastiriotites' })
}

async function ActivitiesPageStatic() {
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

/** The page as edited in Payload's visual editor; its built-in composition until then. */
export default async function ActivitiesPage() {
  return <ManagedPage slug="drastiriotites" locale={await getLocale()} fallback={<ActivitiesPageStatic />} />
}
