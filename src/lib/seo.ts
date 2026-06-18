import type { Metadata } from 'next'
import type { Page, Post } from '@/payload-types'

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  )
}

export function absoluteUrl(path = '/'): string {
  const base = siteUrl()
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
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
    // Pre-launch: force noindex on every page (revert to `noindex ? … : undefined` at launch).
    robots: { index: false, follow: false },
  }
}

export function postMetadata(
  post:
    | (Pick<
        Post,
        'title' | 'slug' | 'excerpt' | 'cover' | 'seo' | 'publishedAt' | 'updatedAt' | 'author'
      > & { author?: Post['author'] })
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
  const authorName =
    post.author && typeof post.author === 'object' && 'name' in post.author
      ? (post.author as { name?: string }).name
      : undefined

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
      authors: authorName ? [authorName] : undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    // Pre-launch: force noindex on every page (revert to `noindex ? … : undefined` at launch).
    robots: { index: false, follow: false },
  }
}
