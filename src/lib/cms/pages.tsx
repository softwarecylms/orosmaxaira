import 'server-only'
import { cache, type ReactNode } from 'react'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Data } from '@measured/puck'
import { Render } from '@measured/puck/rsc'
import type { Page } from '@/payload-types'
import { buildPuckConfig } from '@/puck/blocks'
import { resolveLive } from '@/puck/live.server'
import { seoMetadata, type SeoInput } from '@/lib/seo'

/**
 * Pages edited in Payload with the visual editor.
 *
 * A route asks for its page by slug. When Payload has that page with content,
 * the page's Puck blocks are rendered; otherwise the route shows its built-in
 * composition. `PAGES_SOURCE=static` switches every bespoke route back to the
 * built-in composition at once (a kill switch); pages that exist only in
 * Payload (created by editors) always come from Payload.
 */

export const pagesFromPayload = () => process.env.PAGES_SOURCE === 'payload'

type FoundPage = Pick<Page, 'id' | 'title' | 'slug' | 'seo'> & { content: Data | null }

async function findPage(slug: string, locale: string, draft: boolean): Promise<FoundPage | null> {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale: locale as 'el' | 'en',
    fallbackLocale: 'el',
    draft,
    depth: 1,
    limit: 1,
  })
  const doc = res.docs[0] as Page | undefined
  if (!doc) return null
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    seo: doc.seo,
    content: (doc.content ?? null) as Data | null,
  }
}

/** A page by slug in one language: the draft in preview mode, else the cached
 *  published page (tag `page:<slug>`, cleared when it is published). */
export const getPayloadPage = cache(async (slug: string, locale: string): Promise<FoundPage | null> => {
  try {
    const draft = (await draftMode()).isEnabled
    if (draft) return await findPage(slug, locale, true)
    return await unstable_cache(() => findPage(slug, locale, false), ['payload-page', slug, locale], {
      tags: ['pages', `page:${slug}`],
      revalidate: 600,
    })()
  } catch (err) {
    console.error(`[pages] could not load "${slug}" (${locale}):`, err)
    return null
  }
})

const hasBlocks = (page: FoundPage | null): page is FoundPage & { content: Data } =>
  Boolean(page?.content && Array.isArray(page.content.content) && page.content.content.length)

/** Render a page's blocks, or `fallback` when the page is not (yet) in Payload. */
export async function ManagedPage({
  slug,
  locale,
  fallback,
  always = false,
}: {
  slug: string
  locale: string
  fallback: ReactNode
  /** Use Payload even when PAGES_SOURCE is not "payload" (editor-created pages). */
  always?: boolean
}) {
  if (!always && !pagesFromPayload()) return <>{fallback}</>
  const page = await getPayloadPage(slug, locale)
  if (!hasBlocks(page)) return <>{fallback}</>
  const live = await resolveLive(page.content, locale)
  return <Render config={buildPuckConfig(locale)} data={page.content} metadata={{ locale, live }} />
}

/** The route's metadata, with the page's SEO fields from Payload taking over
 *  where they are filled in. */
export async function managedMetadata(
  slug: string,
  input: SeoInput,
  { always = false }: { always?: boolean } = {},
): Promise<Metadata> {
  const page = always || pagesFromPayload() ? await getPayloadPage(slug, input.locale) : null
  const seo = page?.seo ?? {}
  const image =
    seo.image && typeof seo.image === 'object' && 'url' in seo.image ? seo.image.url : undefined
  return seoMetadata({
    ...input,
    title: seo.title || input.title,
    description: seo.description || input.description,
    image: image || input.image,
    robots: seo.noindex ? { index: false, follow: false } : input.robots,
  })
}
