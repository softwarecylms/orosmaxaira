import type { MetadataRoute } from 'next'
import {
  getAllAuthors,
  getAllCaseStudySlugs,
  getAllCategories,
  getAllPageSlugs,
  getAllPortfolioCategories,
  getAllPosts,
  getAllTags,
} from '@/lib/cms'
import { siteUrl } from '@/lib/seo'

export const revalidate = 3600

const RESERVED_AT_ROOT = new Set(['portfolio', 'portfolio-category', 'category', 'tag', 'author'])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const now = new Date()

  const [
    pageSlugs,
    posts,
    caseStudySlugs,
    categories,
    tags,
    portfolioCategories,
    authors,
  ] = await Promise.all([
    getAllPageSlugs().catch(() => []),
    getAllPosts(500).catch(() => []),
    getAllCaseStudySlugs().catch(() => []),
    getAllCategories().catch(() => []),
    getAllTags().catch(() => []),
    getAllPortfolioCategories().catch(() => []),
    getAllAuthors().catch(() => []),
  ])

  const entries: MetadataRoute.Sitemap = []

  entries.push({
    url: base,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 1,
  })

  for (const slug of pageSlugs) {
    if (!slug || slug === 'home') continue
    if (RESERVED_AT_ROOT.has(slug)) continue
    entries.push({
      url: `${base}/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  for (const p of posts) {
    if (!p.slug) continue
    entries.push({
      url: `${base}/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  for (const slug of caseStudySlugs) {
    if (!slug) continue
    entries.push({
      url: `${base}/portfolio/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  entries.push({
    url: `${base}/portfolio`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  })
  entries.push({
    url: `${base}/blog`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  })

  for (const c of categories) {
    if (!c.slug) continue
    entries.push({
      url: `${base}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    })
  }
  for (const t of tags) {
    if (!t.slug) continue
    entries.push({
      url: `${base}/tag/${t.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.3,
    })
  }
  for (const c of portfolioCategories) {
    if (!c.slug) continue
    entries.push({
      url: `${base}/portfolio-category/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    })
  }
  for (const a of authors) {
    if (!a.slug) continue
    entries.push({
      url: `${base}/author/${a.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    })
  }

  return entries
}
