import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import {
  AboutBand,
  AboutFamily,
  AboutGoal,
  AboutHero,
  AboutIndoor,
  AboutOutdoor,
  AboutStats,
  AboutValues,
} from '@/components/sections/about'
import { loadAboutContent } from '@/lib/content/load'
import { ManagedPage, managedMetadata } from '@/lib/cms/pages'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { meta } = await loadAboutContent(locale)
  return managedMetadata('poioi-eimaste', {
    locale,
    path: '/poioi-eimaste',
    title: meta.title,
    description: meta.description,
  })
}

async function AboutPageStatic() {
  const a = await loadAboutContent(await getLocale())

  return (
    <>
      <AboutHero content={a.hero} />
      <AboutStats content={a.stats} />
      <AboutValues content={a.values} />
      <AboutIndoor content={a.indoor} />
      <AboutOutdoor content={a.outdoor} />
      <AboutBand content={a.band} />
      <AboutFamily content={a.family} />
      <AboutGoal content={a.goal} />
    </>
  )
}

/** The page as edited in Payload's visual editor; its built-in composition until then. */
export default async function AboutPage() {
  return <ManagedPage slug="poioi-eimaste" locale={await getLocale()} fallback={<AboutPageStatic />} />
}
