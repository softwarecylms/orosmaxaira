import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/** The public paths a page slug is served at, in both languages. */
export const pagePaths = (slug?: string | null): string[] => {
  const path = !slug || slug === 'home' ? '/' : `/${slug}/`
  return [path, path === '/' ? '/en' : `/en${path}`]
}

/** Drop the cached copy of a page (tag `page:<slug>`) and its rendered paths. */
function revalidateSlug(slug: string | undefined, log: (msg: string) => void) {
  if (!slug) return
  // Outside a Next.js request (seed scripts under tsx) there is no cache to clear.
  try {
    revalidateTag(`page:${slug}`)
    revalidateTag('pages')
    for (const p of pagePaths(slug)) revalidatePath(p)
    log(`Revalidated page ${slug}`)
  } catch {
    // not running inside Next.js
  }
}

export const revalidatePage: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  // Draft autosaves do not change the live site; publishing (or unpublishing) does.
  if (doc?._status !== 'published' && previousDoc?._status !== 'published') return doc
  revalidateSlug(doc?.slug, (m) => req.payload.logger.info(m))
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    revalidateSlug(previousDoc.slug, (m) => req.payload.logger.info(m))
  }
  return doc
}

export const revalidateDeletedPage: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidateSlug(doc?.slug, (m) => req.payload.logger.info(m))
  return doc
}
