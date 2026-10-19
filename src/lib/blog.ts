import 'server-only'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Category, Media, Post } from '@/payload-types'
import { getBlogPosts as getStaticPosts, type BlogPost } from '@/components/blog/blog-data'
import {
  getBlogCategories as getStaticCategories,
  POST_CATEGORIES,
  type BlogCategory,
} from '@/components/blog/blog-categories'
import { htmlToText, postBodyHtml } from '@/lib/blog-html'

/**
 * The blog, read from Payload → Posts (published articles only).
 *
 * Lists come without bodies (the 73 imported articles are ~0.5 MB of HTML,
 * past what one cache entry may hold); a single article is read on its own.
 * Both are cached under the `posts` tag, which publishing, unpublishing or
 * deleting an article clears (src/payload/hooks/revalidate-post.ts).
 *
 * Until the CMS has articles — or when it can't be reached — the site falls
 * back to the old site's snapshot (src/components/blog/blog-data.ts), so the
 * blog never goes empty.
 */

// Edits in the CMS clear `posts` at once; the timer only covers changes made
// outside the site (the import script), which can't reach its cache.
const CACHE = { tags: ['posts'], revalidate: 600 }

type Source = 'cms' | 'static'

async function cms() {
  return getPayload({ config: configPromise })
}

const dateOf = (doc: Pick<Post, 'publishedAt' | 'createdAt'>) => (doc.publishedAt ?? doc.createdAt).slice(0, 10)

const imageOf = (doc: Pick<Post, 'cover'>) => {
  const cover = doc.cover as Media | number | null | undefined
  return (typeof cover === 'object' && cover?.url) || ''
}

const categoriesOf = (doc: Pick<Post, 'categories'>) =>
  (doc.categories ?? []).flatMap((c) => (typeof c === 'object' && c?.slug ? [c.slug] : []))

function seoOf(doc: Pick<Post, 'seo'>): BlogPost['seo'] {
  const seo = doc.seo
  if (!seo) return undefined
  const image = typeof seo.image === 'object' ? (seo.image as Media | null)?.url : undefined
  return {
    title: seo.title || undefined,
    description: seo.description || undefined,
    image: image || undefined,
    noindex: seo.noindex || undefined,
  }
}

function toBlogPost(doc: Post, content: string): BlogPost {
  const words = content ? htmlToText(content).split(' ').filter(Boolean).length : 0
  return {
    slug: doc.slug,
    title: doc.title,
    date: dateOf(doc),
    dateText: '',
    excerpt: doc.excerpt ?? '',
    image: imageOf(doc),
    readMins: Math.max(1, Math.ceil(words / 220)),
    content,
    categories: categoriesOf(doc),
    seo: seoOf(doc),
  }
}

const SUMMARY_SELECT = {
  title: true,
  slug: true,
  excerpt: true,
  publishedAt: true,
  createdAt: true,
  cover: true,
  categories: true,
  seo: true,
} as const

/** Published articles, newest first, without bodies — and where they came from. */
const loadSummaries = unstable_cache(
  async (locale: string): Promise<{ source: Source; posts: BlogPost[] }> => {
    try {
      const payload = await cms()
      const res = await payload.find({
        collection: 'posts',
        locale: locale as 'el' | 'en',
        where: { _status: { equals: 'published' } },
        sort: '-publishedAt',
        pagination: false,
        depth: 1,
        select: SUMMARY_SELECT,
      })
      if (res.docs.length) {
        return { source: 'cms', posts: res.docs.map((d) => toBlogPost(d as Post, '')) }
      }
    } catch (err) {
      console.warn('[blog] CMS read failed, showing the snapshot:', (err as Error).message)
    }
    const posts = getStaticPosts(locale).map(({ content: _content, ...p }) => ({
      ...p,
      content: '',
      categories: POST_CATEGORIES[p.slug] ?? [],
    }))
    return { source: 'static', posts }
  },
  ['blog-summaries'],
  CACHE,
)

/** Published articles, newest first, without their bodies (lists, sitemap, feeds). */
export async function getBlogPosts(locale: string): Promise<BlogPost[]> {
  return (await loadSummaries(locale)).posts
}

/** One published article with its body, or null. */
export const getBlogArticle = unstable_cache(
  async (slug: string, locale: string): Promise<BlogPost | null> => {
    const { source } = await loadSummaries(locale)
    if (source === 'static') {
      const post = getStaticPosts(locale).find((p) => p.slug === slug)
      return post ? { ...post, categories: POST_CATEGORIES[post.slug] ?? [] } : null
    }
    try {
      const payload = await cms()
      const res = await payload.find({
        collection: 'posts',
        locale: locale as 'el' | 'en',
        where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
        depth: 2, // pictures and linked pages inside the text
        limit: 1,
      })
      const doc = res.docs[0] as Post | undefined
      return doc ? toBlogPost(doc, postBodyHtml(doc, locale)) : null
    } catch (err) {
      console.warn('[blog] CMS read failed for', slug, (err as Error).message)
      return null
    }
  },
  ['blog-article'],
  CACHE,
)

/** The categories that have articles (named per language, largest first), and each article's categories. */
export const getBlogTaxonomy = unstable_cache(
  async (
    locale: string,
  ): Promise<{ categories: BlogCategory[]; postCategories: Record<string, string[]> }> => {
    const { source, posts } = await loadSummaries(locale)
    const postCategories = Object.fromEntries(posts.map((p) => [p.slug, p.categories ?? []]))
    if (source === 'static') return { categories: getStaticCategories(locale), postCategories }

    const counts = new Map<string, number>()
    for (const p of posts) for (const c of p.categories ?? []) counts.set(c, (counts.get(c) ?? 0) + 1)
    let names: Category[] = []
    try {
      const payload = await cms()
      names = (
        await payload.find({ collection: 'categories', locale: locale as 'el' | 'en', pagination: false, depth: 0 })
      ).docs as Category[]
    } catch (err) {
      console.warn('[blog] categories read failed:', (err as Error).message)
    }
    const categories = [...counts]
      .map(([slug, count]) => ({ slug, count, name: names.find((c) => c.slug === slug)?.name ?? slug }))
      .sort((a, b) => b.count - a.count)
    return { categories, postCategories }
  },
  ['blog-taxonomy'],
  CACHE,
)
