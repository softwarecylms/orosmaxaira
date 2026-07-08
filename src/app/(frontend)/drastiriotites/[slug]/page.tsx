import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EXPERIENCES } from '@/components/activities/experiences'
import { ActivityExperience } from '@/components/activities/activity-experience'
import { ActivityDetail } from '@/components/activities/detail/activity-detail'
import { getActivity } from '@/lib/medusa/activities'

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

  const activity = await getActivity(slug)
  if (activity) {
    return {
      title: activity.meta_title ?? activity.title,
      description: activity.meta_description ?? activity.subtitle ?? undefined,
    }
  }

  const data = EXPERIENCES[slug]
  if (!data) return { title: 'Δραστηριότητα' }
  return { title: data.metaTitle, description: data.metaDescription }
}

export default async function ActivityExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Prefer the Medusa-managed activity (new design + real booking).
  const activity = await getActivity(slug)
  if (activity) return <ActivityDetail activity={activity} />

  // Fallback: the still-static activity pages.
  const data = EXPERIENCES[slug]
  if (!data) notFound()
  return <ActivityExperience data={data} />
}
