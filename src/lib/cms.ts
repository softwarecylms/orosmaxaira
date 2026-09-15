import 'server-only'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Page, Post, SiteSetting } from '@/payload-types'

async function cms() {
  return getPayload({ config: configPromise })
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.warn('[cms] query failed, using fallback:', (err as Error).message)
    return fallback
  }
}

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSetting | null> =>
    safe(async () => {
      const payload = await cms()
      return (await payload.findGlobal({
        slug: 'site-settings',
        depth: 2,
      })) as SiteSetting
    }, null),
  ['site-settings'],
  { tags: ['site-settings'], revalidate: 300 },
)

export async function getPageBySlug(slug: string): Promise<Page | null> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      depth: 3,
      limit: 1,
    })
    return (res.docs[0] as Page) ?? null
  }, null)
}

export async function getAllPageSlugs(): Promise<string[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'pages',
      limit: 500,
      pagination: false,
      depth: 0,
      select: { slug: true },
    })
    return res.docs.map((d) => d.slug as string).filter(Boolean)
  }, [])
}

export async function getAllPagesMeta(): Promise<
  Array<{ slug: string; title: string; description?: string }>
> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'pages',
      limit: 500,
      pagination: false,
      depth: 0,
      select: { slug: true, title: true, seo: true },
    })
    return res.docs
      .map((d) => {
        const doc = d as { slug?: string; title?: string; seo?: { description?: string } }
        return {
          slug: doc.slug ?? '',
          title: doc.title ?? '',
          description: doc.seo?.description ?? undefined,
        }
      })
      .filter((p) => p.slug)
  }, [])
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
      },
      depth: 2,
      limit: 1,
    })
    return (res.docs[0] as Post) ?? null
  }, null)
}

export async function getAllPostSlugs(): Promise<string[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      limit: 500,
      pagination: false,
      depth: 0,
      select: { slug: true },
    })
    return res.docs.map((d) => d.slug as string).filter(Boolean)
  }, [])
}

export async function getAllPosts(limit = 200): Promise<Post[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      limit,
      depth: 1,
      sort: '-publishedAt',
    })
    return res.docs as Post[]
  }, [])
}

export async function getRelatedPosts(
  categoryId: number,
  excludeSlug: string,
  limit = 3,
): Promise<Post[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { slug: { not_equals: excludeSlug } },
          { categories: { in: [categoryId] } },
        ],
      },
      limit,
      depth: 1,
      sort: '-publishedAt',
    })
    return res.docs as Post[]
  }, [])
}
