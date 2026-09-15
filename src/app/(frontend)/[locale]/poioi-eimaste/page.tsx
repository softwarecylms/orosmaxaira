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
import { seoMetadata } from '@/lib/seo'
import { loadAboutContent } from '@/lib/content/load'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { meta } = await loadAboutContent(locale)
  return seoMetadata({
    locale,
    path: '/poioi-eimaste',
    title: meta.title,
    description: meta.description,
  })
}

export default async function AboutPage() {
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
