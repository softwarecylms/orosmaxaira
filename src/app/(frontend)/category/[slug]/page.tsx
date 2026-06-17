import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getAllCategories,
  getCategoryBySlug,
  getPostsByCategory,
} from '@/lib/cms'
import { BlogIndexRender } from '@/blocks/blog-index'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories
    .map((c) => c.slug)
    .filter((s): s is string => Boolean(s))
    .map((slug) => ({ slug }))
}

type RouteProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Not found' }
  const seo = (category.seo ?? {}) as { title?: string; description?: string }
  return {
    title: seo.title || `${category.name} — Blog`,
    description:
      seo.description ||
      category.description ||
      `Posts in the ${category.name} category.`,
    alternates: { canonical: `/category/${slug}` },
  }
}

export default async function CategoryPage({ params }: RouteProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const [posts, allCategories] = await Promise.all([
    getPostsByCategory(category.id),
    getAllCategories(),
  ])

  return (
    <BlogIndexRender
      heading={category.name ?? undefined}
      subheading={category.description ?? undefined}
      posts={posts}
      activeCategory={category}
      categories={allCategories}
    />
  )
}
