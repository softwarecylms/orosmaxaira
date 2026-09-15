import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'
import { sdk } from '@/lib/medusa/client'
import { getBlogPosts } from '@/components/blog/blog-data'
import { ARTICLE_DUPLICATE_OF } from '@/components/blog/article-seo'
import { CATEGORY_SLUGS, SHOP_PRODUCTS, handleOf } from '@/components/shop/shop-content'
import { enHandle } from '@/components/shop/product-slugs'
import { getExperiences } from '@/components/activities/experiences'
import { getWorkshops as getStaticWorkshops } from '@/lib/data/workshops'

export const revalidate = 3600

/**
 * Every indexable page, in Greek and English, each entry carrying its hreflang
 * pair. URLs use the site's trailing-slash form so none of them redirects.
 *
 * Products, activities and workshops come from Medusa, so one created in the
 * admin is listed within the hour; the repo's static copies stand in if Medusa
 * is unreachable. Cart, checkout, orders and the account area are left out on
 * purpose (they are noindex), as are the starter template's empty portfolio,
 * tag and author sections.
 *
 * `lastModified` is set only where a real date exists — a made-up "now" teaches
 * crawlers to ignore the field.
 */

type Entry = { el: string; en: string; lastModified?: Date }

const STATIC_PAGES = [
  '/',
  '/proionta/',
  '/drastiriotites/',
  '/drastiriotites/ergastiria/',
  '/drastiriotites/melissotherapeia/',
  '/drastiriotites/scholeia/',
  '/yiotheto-mia-kypseli/',
  '/afaneis-iroes-tis-fysis/',
  '/poioi-eimaste/',
  '/pistopioiseis/',
  '/vraveia/',
  '/blog/',
  '/epikoinonia/',
  '/paraggelies-kai-epistrofes/',
  '/politiki-apostolis-proionton/',
  '/privacy-amp-cookie-policy/',
  '/terms/',
]

const en = (el: string) => (el === '/' ? '/en/' : `/en${el}`)
const date = (value?: string | null) => {
  const d = value ? new Date(value) : null
  return d && !Number.isNaN(d.getTime()) ? d : undefined
}

/** A Medusa store list, or null when the backend is unreachable. */
async function medusaList<T>(path: string, key: string, fields: string): Promise<T[] | null> {
  try {
    const res = await sdk.client.fetch<Record<string, T[]>>(path, {
      method: 'GET',
      query: { fields, limit: 200 },
      next: { revalidate: 3600 },
    })
    return Array.isArray(res[key]) ? res[key] : null
  } catch {
    return null
  }
}

type Dated = { handle?: string; slug?: string; updated_at?: string | null }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const [products, activities, workshops] = await Promise.all([
    medusaList<Dated>('/store/products', 'products', 'handle,updated_at'),
    medusaList<Dated>('/store/activities', 'activities', 'slug,updated_at'),
    medusaList<Dated>('/store/workshops', 'workshops', 'slug,updated_at'),
  ])

  const entries: Entry[] = STATIC_PAGES.map((el) => ({ el, en: en(el) }))

  for (const slug of Object.values(CATEGORY_SLUGS)) {
    entries.push({ el: `/proionta/${slug}/`, en: `/en/proionta/${slug}/` })
  }

  const productRows: Dated[] = products ?? SHOP_PRODUCTS.map((p) => ({ handle: handleOf(p) }))
  for (const p of productRows) {
    if (!p.handle) continue
    entries.push({
      el: `/product/${p.handle}/`,
      en: `/en/product/${enHandle(p.handle)}/`,
      lastModified: date(p.updated_at),
    })
  }

  const activityRows: Dated[] = activities ?? Object.keys(getExperiences('el')).map((slug) => ({ slug }))
  for (const a of activityRows) {
    if (a.slug) entries.push({ el: `/drastiriotites/${a.slug}/`, en: `/en/drastiriotites/${a.slug}/`, lastModified: date(a.updated_at) })
  }

  const workshopRows: Dated[] = workshops ?? getStaticWorkshops('el').map((w) => ({ slug: w.slug }))
  for (const w of workshopRows) {
    if (w.slug) {
      entries.push({
        el: `/drastiriotites/ergastiria/${w.slug}/`,
        en: `/en/drastiriotites/ergastiria/${w.slug}/`,
        lastModified: date(w.updated_at),
      })
    }
  }

  // Articles keep the previous site's root permalinks, in both languages.
  for (const post of getBlogPosts('el')) {
    if (post.slug && !ARTICLE_DUPLICATE_OF[post.slug]) entries.push({ el: `/${post.slug}/`, en: `/en/${post.slug}/`, lastModified: date(post.date) })
  }

  const seen = new Set<string>()
  return entries.flatMap(({ el, en, lastModified }) => {
    if (seen.has(el)) return []
    seen.add(el)
    const languages = { el: `${base}${el}`, en: `${base}${en}`, 'x-default': `${base}${el}` }
    return [el, en].map((path) => ({
      url: `${base}${path}`,
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages },
    }))
  })
}
