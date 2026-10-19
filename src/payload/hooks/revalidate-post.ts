import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Where a post shows: its own page in both languages (`/<slug>/`, kept from the
 * old WordPress permalinks), the /blog index, the home page's latest-articles
 * row and the sitemap.
 */
const postPaths = (slug: string) => [`/${slug}/`, `/en/${slug}/`, '/blog/', '/en/blog/', '/', '/en', '/sitemap.xml']

/** Drop the cached post list (tag `posts`, see src/lib/blog.ts) and the paths that show it. */
function revalidatePosts(slugs: (string | null | undefined)[], log: (msg: string) => void) {
  // Outside a Next.js request (the import script under tsx) there is no cache to clear.
  try {
    revalidateTag('posts')
    const paths = new Set(slugs.filter((s): s is string => !!s).flatMap(postPaths))
    for (const p of paths) revalidatePath(p)
    log(`Revalidated posts (${slugs.filter(Boolean).join(', ')})`)
  } catch {
    // not running inside Next.js
  }
}

export const revalidatePost: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  // A draft save changes nothing on the site; publishing or unpublishing does.
  if (doc?._status !== 'published' && previousDoc?._status !== 'published') return doc
  revalidatePosts([doc?.slug, previousDoc?.slug !== doc?.slug ? previousDoc?.slug : null], (m) =>
    req.payload.logger.info(m),
  )
  return doc
}

export const revalidateDeletedPost: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidatePosts([doc?.slug], (m) => req.payload.logger.info(m))
  return doc
}
