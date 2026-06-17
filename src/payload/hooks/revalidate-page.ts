import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

const pathFor = (slug?: string | null) =>
  !slug || slug === 'home' ? '/' : `/${slug}`

export const revalidatePage: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (doc?._status !== 'published' && previousDoc?._status !== 'published') return doc
  try {
    const slug = doc?.slug as string | undefined
    revalidatePath(pathFor(slug))
    revalidateTag('pages')
    req.payload.logger.info(`Revalidated page ${pathFor(slug)}`)
  } catch (err) {
    req.payload.logger.error({ err }, 'Failed to revalidate page')
  }
  return doc
}

export const revalidateDeletedPage: CollectionAfterDeleteHook = ({ doc, req }) => {
  try {
    revalidatePath(pathFor(doc?.slug as string | undefined))
    revalidateTag('pages')
  } catch (err) {
    req.payload.logger.error({ err }, 'Failed to revalidate deleted page')
  }
  return doc
}
