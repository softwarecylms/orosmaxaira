import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getExperiences } from '@/components/activities/experiences'
import { ActivityExperience } from '@/components/activities/activity-experience'
import { ActivityDetail } from '@/components/activities/detail/activity-detail'
import { getActivity } from '@/lib/medusa/activities'
import { hreflangAlternates } from '@/lib/seo'

// Medusa-backed activities (content, prices, availability) must render live so
// admin edits + seat counts are never stale. Activities not yet in Medusa fall
// back to the static `experiences.ts` page.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const alternates = hreflangAlternates(locale, `/drastiriotites/${slug}`)

  const activity = await getActivity(slug, locale)
  if (activity) {
    return {
      title: activity.meta_title ?? activity.title,
      description: activity.meta_description ?? activity.subtitle ?? undefined,
      alternates,
    }
  }

  const data = getExperiences(locale)[slug]
  if (!data) return { title: locale === 'en' ? 'Activity' : 'Δραστηριότητα', alternates }
  return { title: data.metaTitle, description: data.metaDescription, alternates }
}

export default async function ActivityExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getLocale()

  // Prefer the Medusa-managed activity (new design + real booking).
  const activity = await getActivity(slug, locale)
  if (activity) return <ActivityDetail activity={activity} locale={locale} />

  // Fallback: the still-static activity pages.
  const data = getExperiences(locale)[slug]
  if (!data) notFound()
  return <ActivityExperience data={data} locale={locale} />
}
