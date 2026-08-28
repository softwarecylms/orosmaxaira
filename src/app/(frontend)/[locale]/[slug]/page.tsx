import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { Render } from '@measured/puck/rsc'
import {
  getAllPageSlugs,
  getAllPostSlugs,
  getPageBySlug,
  getPostBySlug,
  getRelatedPosts,
} from '@/lib/cms'
import { hreflangAlternates, pageMetadata, postMetadata } from '@/lib/seo'
import { puckConfig } from '@/puck/config'
import { populatePuckData } from '@/puck/hydrate'
import { BlogPostRender } from '@/blocks/blog-post'
import { getBlogPosts } from '@/components/blog/blog-data'
import { ArticleView } from '@/components/blog/article-view'
import { articlePath } from '@/components/blog/article-url'
import type { Data } from '@measured/puck'

export const revalidate = 60
export const dynamicParams = true

const RESERVED_TOP_LEVEL_SLUGS = new Set([
  'portfolio',
  'portfolio-category',
  'category',
  'tag',
  'author',
  'admin',
  'api',
  '_next',
])

/** Articles keep the previous site's root permalinks — `/<slug>/`, `/en/<slug>/`
 *  — so they resolve here rather than under `/blog/`. Slugs are locale-invariant,
 *  so the Greek list covers both locales. */
function findArticle(slug: string, locale: string) {
  return getBlogPosts(locale).find((p) => p.slug === slug)
}

export async function generateStaticParams() {
  const [pageSlugs, postSlugs] = await Promise.all([
    getAllPageSlugs(),
    getAllPostSlugs(),
  ])
  const all = new Set<string>()
  for (const s of pageSlugs) {
    if (s && s !== 'home' && !RESERVED_TOP_LEVEL_SLUGS.has(s)) all.add(s)
  }
  for (const s of postSlugs) {
    if (s && !RESERVED_TOP_LEVEL_SLUGS.has(s)) all.add(s)
  }
  for (const p of getBlogPosts('el')) {
    if (p.slug && !RESERVED_TOP_LEVEL_SLUGS.has(p.slug)) all.add(p.slug)
  }
  return Array.from(all).map((slug) => ({ slug }))
}

type RouteProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: RouteProps) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (page) return pageMetadata(page)
  const post = await getPostBySlug(slug)
  if (post) return postMetadata(post)

  const locale = await getLocale()
  const article = findArticle(slug, locale)
  const alternates = hreflangAlternates(locale, articlePath(slug))
  if (article) {
    return {
      title: article.title,
      description: article.excerpt,
      alternates,
      openGraph: {
        title: article.title,
        description: article.excerpt,
        images: article.image ? [article.image] : undefined,
      },
    }
  }
  return { title: 'Not found' }
}

export default async function CatchAllRoute({ params }: RouteProps) {
  const { slug } = await params
  if (slug === 'home') notFound()
  if (RESERVED_TOP_LEVEL_SLUGS.has(slug)) notFound()

  const page = await getPageBySlug(slug)
  if (page) {
    const data = await populatePuckData(page.content as unknown as Data | null)
    return <Render config={puckConfig} data={data as never} />
  }

  const post = await getPostBySlug(slug)
  if (post) {
    const categories = Array.isArray(post.categories) ? post.categories : []
    const primaryCategory = categories.find(
      (c) => typeof c === 'object' && c !== null && 'id' in c,
    ) as { id: number; slug?: string | null } | undefined
    const relatedPosts = primaryCategory?.id
      ? await getRelatedPosts(primaryCategory.id, slug, 3)
      : []
    return <BlogPostRender post={post} relatedPosts={relatedPosts} />
  }

  const locale = await getLocale()
  const article = findArticle(slug, locale)
  if (article) {
    const related = getBlogPosts(locale)
      .filter((p) => p.slug !== slug)
      .slice(0, 3)
    return <ArticleView post={article} related={related} locale={locale} />
  }

  notFound()
}
