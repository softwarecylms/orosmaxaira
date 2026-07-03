import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EXPERIENCES } from '@/components/activities/experiences'
import { ActivityExperience } from '@/components/activities/activity-experience'

export function generateStaticParams() {
  return Object.keys(EXPERIENCES).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
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
  const data = EXPERIENCES[slug]
  if (!data) notFound()
  return <ActivityExperience data={data} />
}
