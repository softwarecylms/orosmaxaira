import type { Metadata } from 'next'
import type { Page, Post } from '@/payload-types'

/**
 * The public origin every canonical, hreflang, sitemap and structured-data URL
 * is built on — https://orosmaxaira.com in production.
 *
 * `NEXT_PUBLIC_SITE_URL` is separate from `NEXT_PUBLIC_SERVER_URL` on purpose:
 * Payload uses the latter as its own server URL (admin links, CSRF), so it must
 * keep matching wherever the admin is actually opened, while search engines
 * must only ever be pointed at the public domain.
 */
export function siteUrl(): string {
  return (
    (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL)?.replace(/\/$/, '') ||
    'http://localhost:3000'
  )
}

/** The host search engines may index, e.g. "orosmaxaira.com". Every other host
 *  serving this app — orosmaxaira.vercel.app, preview deployments — answers
 *  with `X-Robots-Tag: noindex` (src/middleware.ts), so the site is never
 *  indexed twice. */
export function canonicalHost(): string {
  return new URL(siteUrl()).host
}

/** Robots for pages that must stay out of search results but whose links may
 *  still be followed: cart, checkout, order confirmation, account. */
export const NOINDEX: NonNullable<Metadata['robots']> = { index: false, follow: true }

export function absoluteUrl(path = '/'): string {
  const base = siteUrl()
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * hreflang alternates for a page at a locale-agnostic `path` (e.g.
 * '/poioi-eimaste'). Matches orosmaxaira.com's scheme with trailing slashes:
 *   el → /path/ , en → /en/path/ , x-default → /path/ (Greek).
 * Returns relative URLs; `metadataBase` (set in the layout) resolves them to
 * absolute for the emitted <link rel="alternate"> tags.
 */
export function hreflangAlternates(
  locale: string,
  path = '/',
): NonNullable<Metadata['alternates']> {
  const el = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}/`
  const en = el === '/' ? '/en/' : `/en${el}`
  return {
    canonical: locale === 'en' ? en : el,
    languages: { el, en, 'x-default': el },
  }
}

const BRAND = { el: 'Όρος Μαχαιρά', en: 'Oros Machaira' } as const

/** Shared when a page has no image of its own — 1200×630, the size every
 *  network crops to without losing the subject. */
export const DEFAULT_SHARE_IMAGE = { url: '/images/og/oros-machaira.jpg', width: 1200, height: 630 }

/** Google shows about 60 characters of a title. */
const TITLE_MAX = 60
/** …and about 155–160 of a description. */
const DESCRIPTION_MAX = 155

/**
 * The page title with the brand after it — once. A title that already names the
 * brand ("Δραστηριότητες — Όρος Μαχαιρά Academy") is left alone, a trailing
 * "— Όρος Μαχαιρά" is not doubled up, and the suffix is dropped when it would
 * push the title past what search results show.
 */
export function seoTitle(title: string, locale: string): string {
  const brand = locale === 'en' ? BRAND.en : BRAND.el
  const clean = title.replace(/\s*[—–|-]\s*(Όρος Μαχαιρά|Oros Machaira)\s*$/u, '').trim()
  if (/Όρος Μαχαιρά|Oros Machaira/u.test(clean)) return clean
  const full = `${clean} | ${brand}`
  return full.length <= TITLE_MAX ? full : clean
}

/**
 * Plain text for a meta description: markup and Markdown removed, whitespace
 * collapsed, and cut at the last full sentence that fits — or at a word, with
 * an ellipsis — so it never ends mid-word in search results.
 */
export function metaDescription(text: string | null | undefined, max = DESCRIPTION_MAX): string | undefined {
  const plain = (text ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[*_#>`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plain) return undefined
  if (plain.length <= max) return plain
  const cut = plain.slice(0, max + 1)
  const sentence = Math.max(...['. ', '! ', '; ', '? '].map((end) => cut.lastIndexOf(end)))
  if (sentence >= 80) return plain.slice(0, sentence + 1)
  const word = cut.lastIndexOf(' ', max - 1)
  return `${plain.slice(0, word > 0 ? word : max - 1).replace(/[,;:.\s–—-]+$/u, '')}…`
}

/** A canonical as Next accepts it — string, URL or `{ url }` — as a plain URL. */
function urlOf(canonical: NonNullable<Metadata['alternates']>['canonical']): string | URL | undefined {
  if (!canonical) return undefined
  return typeof canonical === 'string' || canonical instanceof URL ? canonical : canonical.url
}

export type SeoInput = {
  locale: string
  /** The page's Greek path, e.g. '/poioi-eimaste' — ignored when `alternates` is given. */
  path?: string
  /** For pages whose English URL is not simply /en + the Greek one (products). */
  alternates?: NonNullable<Metadata['alternates']>
  title: string
  description?: string | null
  /** Root-relative or absolute. Falls back to DEFAULT_SHARE_IMAGE. */
  image?: string | null
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  robots?: Metadata['robots']
}

/**
 * Complete metadata for one page: title, description, canonical + hreflang,
 * Open Graph and Twitter card.
 *
 * Every page goes through here because Next.js merges metadata one top-level
 * key at a time: a page that sets `openGraph` at all replaces the layout's whole
 * `openGraph` object, silently dropping its locale, site name and type. Relative
 * URLs are resolved against `metadataBase` (the layout).
 */
export function seoMetadata(input: SeoInput): Metadata {
  const en = input.locale === 'en'
  const alternates = input.alternates ?? hreflangAlternates(input.locale, input.path ?? '/')
  const title = seoTitle(input.title, input.locale)
  const ogTitle = title.replace(/\s*\|\s*(Όρος Μαχαιρά|Oros Machaira)$/u, '')
  const description = metaDescription(input.description)
  const image = input.image ? { url: input.image } : DEFAULT_SHARE_IMAGE
  return {
    title: { absolute: title },
    description,
    alternates,
    openGraph: {
      type: input.type ?? 'website',
      url: urlOf(alternates.canonical),
      siteName: en ? BRAND.en : BRAND.el,
      locale: en ? 'en_US' : 'el_GR',
      alternateLocale: en ? 'el_GR' : 'en_US',
      title: ogTitle,
      description,
      images: [image],
      ...(input.type === 'article'
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime ?? input.publishedTime }
        : {}),
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description, images: [image.url] },
    ...(input.robots ? { robots: input.robots } : {}),
  }
}

type MediaLike = { url?: string | null; alt?: string | null } | string | null | undefined

function mediaUrl(m: MediaLike): string | undefined {
  if (!m) return undefined
  if (typeof m === 'string') return undefined
  return m.url ?? undefined
}

export function pageMetadata(
  page: Pick<Page, 'title' | 'slug' | 'seo'> | null | undefined,
): Metadata {
  if (!page) return { title: 'Not found' }
  const seo = page.seo ?? {}
  const title = (seo as { title?: string }).title || page.title
  const description = (seo as { description?: string }).description || undefined
  const image = mediaUrl((seo as { image?: MediaLike }).image)
  const canonical =
    page.slug === 'home' ? '/' : `/${page.slug ?? ''}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: (seo as { noindex?: boolean }).noindex ? { index: false, follow: false } : undefined,
  }
}

export function postMetadata(
  post:
    | Pick<Post, 'title' | 'slug' | 'excerpt' | 'cover' | 'seo' | 'publishedAt' | 'updatedAt'>
    | null
    | undefined,
): Metadata {
  if (!post) return { title: 'Not found' }
  const seo = post.seo ?? {}
  const title = (seo as { title?: string }).title || post.title
  const description =
    (seo as { description?: string }).description || post.excerpt || undefined
  const image =
    mediaUrl((seo as { image?: MediaLike }).image) || mediaUrl(post.cover as MediaLike)
  const canonical = `/${post.slug ?? ''}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: absoluteUrl(canonical),
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt ?? post.publishedAt ?? undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: (seo as { noindex?: boolean }).noindex ? { index: false, follow: false } : undefined,
  }
}
