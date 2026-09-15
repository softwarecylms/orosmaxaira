import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
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
import { ManagedPage, managedMetadata } from '@/lib/cms/pages'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const { meta } = await loadAdoptContent(locale)
  return managedMetadata('yiotheto-mia-kypseli', {
    locale,
    path: '/yiotheto-mia-kypseli',
    title: meta.title,
    description: meta.description,
  })
}

async function AdoptAHivePageStatic() {
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

/** The page as edited in Payload's visual editor; its built-in composition until then. */
export default async function AdoptAHivePage() {
  return <ManagedPage slug="yiotheto-mia-kypseli" locale={await getLocale()} fallback={<AdoptAHivePageStatic />} />
}
