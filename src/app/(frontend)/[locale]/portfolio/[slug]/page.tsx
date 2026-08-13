import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getAllCaseStudySlugs,
  getCaseStudyBySlug,
} from '@/lib/cms'
import { siteUrl } from '@/lib/seo'
import { CaseStudyDetailRender } from '@/blocks/case-study-detail'
import { mediaSrc } from '@/lib/utils'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getAllCaseStudySlugs()
  return slugs.filter(Boolean).map((slug) => ({ slug }))
}

type RouteProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const caseStudy = await getCaseStudyBySlug(slug)
  if (!caseStudy) return { title: 'Not found' }
  const seo = (caseStudy.seo ?? {}) as {
    title?: string
    description?: string
    image?: { url?: string | null } | string | null
    noindex?: boolean
  }
  const title = seo.title || `${caseStudy.title} — Portfolio`
  const description =
    seo.description ||
    caseStudy.summary ||
    `${caseStudy.title}.`
  const image =
    (typeof seo.image === 'object' && seo.image?.url) ||
    mediaSrc(caseStudy.cover) ||
    undefined
  const canonical = `/portfolio/${caseStudy.slug ?? ''}`
  const base = siteUrl()
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${base}${canonical}`,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: seo.noindex ? { index: false, follow: false } : undefined,
  }
}

export default async function CaseStudyDetail({ params }: RouteProps) {
  const { slug } = await params
  const caseStudy = await getCaseStudyBySlug(slug)
  if (!caseStudy) notFound()
  return <CaseStudyDetailRender caseStudy={caseStudy} />
}
