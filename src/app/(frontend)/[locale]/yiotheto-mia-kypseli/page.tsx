import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { seoMetadata } from '@/lib/seo'
import { AdoptHero } from '@/components/adopt/adopt-hero'
import { GoalBand } from '@/components/adopt/goal-band'
import { AdoptProgress } from '@/components/adopt/adopt-progress'
import {
  AdoptCta,
  AdoptFaq,
  AdoptGallery,
  AdoptIntro,
  AdoptPackage,
  AdoptPartners,
  AdoptTestimonialsSection,
  AdoptVisits,
} from '@/components/sections/adopt'
import { loadAdoptContent } from '@/lib/content/load'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const { meta } = await loadAdoptContent(locale)
  return seoMetadata({
    locale,
    path: '/yiotheto-mia-kypseli',
    title: meta.title,
    description: meta.description,
  })
}

export default async function AdoptAHivePage() {
  const a = await loadAdoptContent(await getLocale())

  return (
    <>
      <div data-edit="hero">
        <AdoptHero hero={a.hero} />
      </div>
      <AdoptIntro content={a.intro} />
      <AdoptPartners content={a.partners} />
      <AdoptPackage content={a.package} />
      <div data-edit="goal">
        <GoalBand goal={a.goal} />
      </div>
      <div data-edit="visits">
        <AdoptVisits content={a.visits} />
      </div>
      <AdoptGallery content={a.gallery} />
      <div data-edit="progress">
        <AdoptProgress progress={a.progress} />
      </div>
      <AdoptTestimonialsSection content={a.testimonials} />
      <AdoptFaq content={a.faq} />
      <AdoptCta content={{ cta: a.cta, form: a.form }} />
    </>
  )
}
