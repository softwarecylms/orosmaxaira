import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { CaseStudy } from '@/payload-types'
import { PortfolioArchive } from '@/blocks/portfolio-archive'
import { getAllPortfolioCategories } from '@/lib/cms'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Our Portfolio',
  description: 'A selection of our recent work.',
  alternates: { canonical: '/portfolio' },
}

async function getAllCaseStudies(): Promise<CaseStudy[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'case-studies',
      limit: 500,
      depth: 1,
      sort: '-publishedAt',
    })
    return res.docs as CaseStudy[]
  } catch {
    return []
  }
}

export default async function PortfolioIndex() {
  const [items, categories] = await Promise.all([
    getAllCaseStudies(),
    getAllPortfolioCategories(),
  ])
  return (
    <PortfolioArchive
      heading="Our Portfolio"
      subheading="A selection of websites and brand projects we've shipped over the past 10 years."
      items={items}
      categories={categories}
    />
  )
}
