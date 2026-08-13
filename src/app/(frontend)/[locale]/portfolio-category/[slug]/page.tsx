import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getAllPortfolioCategories,
  getCaseStudiesByCategory,
  getPortfolioCategoryBySlug,
} from '@/lib/cms'
import { PortfolioArchive } from '@/blocks/portfolio-archive'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const categories = await getAllPortfolioCategories()
  return categories
    .map((c) => c.slug)
    .filter((s): s is string => Boolean(s))
    .map((slug) => ({ slug }))
}

type RouteProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getPortfolioCategoryBySlug(slug)
  if (!category) return { title: 'Not found' }
  const seo = (category.seo ?? {}) as { title?: string; description?: string }
  return {
    title: seo.title || `${category.name} — Portfolio`,
    description:
      seo.description ||
      category.description ||
      `Projects in the ${category.name} category.`,
    alternates: { canonical: `/portfolio-category/${slug}` },
  }
}

export default async function PortfolioCategoryPage({ params }: RouteProps) {
  const { slug } = await params
  const category = await getPortfolioCategoryBySlug(slug)
  if (!category) notFound()

  const [items, allCategories] = await Promise.all([
    getCaseStudiesByCategory(category.id),
    getAllPortfolioCategories(),
  ])

  return (
    <PortfolioArchive
      heading={category.name ?? undefined}
      subheading={category.description ?? undefined}
      items={items}
      activeCategory={category}
      categories={allCategories}
    />
  )
}
