import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getExperiences } from '@/components/activities/experiences'
import { ActivityExperience } from '@/components/activities/activity-experience'
import { ActivityDetail } from '@/components/activities/detail/activity-detail'
import { getActivity, getActivityPrograms } from '@/lib/medusa/activities'
import { hreflangAlternates, seoMetadata } from '@/lib/seo'
import { getActivitiesUi } from '@/components/activities/activities-content'
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/json-ld'
import { TrackViewItem } from '@/components/analytics/track-view-item'
import { BOOKING_CATEGORY } from '@/lib/analytics'
import { weekdayPrice } from '@/lib/pricing'

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
    const meta = seoMetadata({
      locale,
      path: `/drastiriotites/${slug}`,
      title: activity.meta_title ?? activity.title,
      description: activity.meta_description ?? activity.subtitle,
      image: activity.hero_image,
    })
    // Hidden activities (e.g. the €1 test activity) work by link but stay out of search.
    return activity.hidden ? { ...meta, robots: { index: false, follow: false } } : meta
  }

  const data = getExperiences(locale)[slug]
  if (!data) return { title: locale === 'en' ? 'Activity' : 'Δραστηριότητα', alternates }
  return seoMetadata({ locale, path: `/drastiriotites/${slug}`, title: data.metaTitle, description: data.metaDescription })
}

export default async function ActivityExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getLocale()

  // Prefer the Medusa-managed activity (new design + real booking).
  const ui = getActivitiesUi(locale)
  const crumbs = (title: string) => (
    <JsonLd
      data={breadcrumbJsonLd(locale, [
        [ui.breadcrumbHome, '/'],
        [ui.breadcrumbActivities, '/drastiriotites/'],
        [title],
      ])}
    />
  )

  const activity = await getActivity(slug, locale)
  if (activity) {
    // Workshop programmes this activity is also bookable as (e.g. «Πλήρες πρόγραμμα»).
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const today = new Date()
    const programs = activity.combo_program_key
      ? await getActivityPrograms(
          slug,
          iso(today),
          iso(new Date(today.getFullYear(), today.getMonth() + 6, today.getDate())),
          locale,
        )
      : []
    return (
      <>
        {crumbs(activity.title)}
        <TrackViewItem
          item={{
            item_id: activity.slug,
            item_name: activity.title,
            price: Math.min(
              ...(activity.price_tiers ?? []).map((t) => weekdayPrice(t)).filter((p) => p > 0),
              Infinity,
            ) || 0,
            item_category: BOOKING_CATEGORY.activity,
          }}
        />
        <ActivityDetail activity={activity} programs={programs} locale={locale} />
      </>
    )
  }

  // Fallback: the still-static activity pages.
  const data = getExperiences(locale)[slug]
  if (!data) notFound()
  return (
    <>
      {crumbs(data.hero.title)}
      <ActivityExperience data={data} locale={locale} />
    </>
  )
}
