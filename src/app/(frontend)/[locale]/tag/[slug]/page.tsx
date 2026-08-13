import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getAllCategories,
  getAllTags,
  getPostsByTag,
  getTagBySlug,
} from '@/lib/cms'
import { BlogIndexRender } from '@/blocks/blog-index'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags
    .map((t) => t.slug)
    .filter((s): s is string => Boolean(s))
    .map((slug) => ({ slug }))
}

type RouteProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(slug)
  if (!tag) return { title: 'Not found' }
  const seo = (tag.seo ?? {}) as { title?: string; description?: string }
  return {
    title: seo.title || `${tag.name} — Blog`,
    description:
      seo.description ||
      tag.description ||
      `Posts tagged with ${tag.name}.`,
    alternates: { canonical: `/tag/${slug}` },
  }
}

export default async function TagPage({ params }: RouteProps) {
  const { slug } = await params
  const tag = await getTagBySlug(slug)
  if (!tag) notFound()

  const [posts, categories] = await Promise.all([
    getPostsByTag(tag.id),
    getAllCategories(),
  ])

  return (
    <BlogIndexRender
      heading={`Posts tagged "${tag.name}"`}
      subheading={tag.description ?? undefined}
      posts={posts}
      activeTag={tag}
      categories={categories}
    />
  )
}
