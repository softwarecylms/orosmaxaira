import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { sdk } from '@/lib/medusa/client'
import { routing } from '@/i18n/routing'
import { getHomeContent, type HomeContent } from '@/components/home/home-content'
import type { AboutContent } from '@/components/about/about-content'
import type { ContactContent } from '@/components/contact/contact-content'
import type { AdoptContent } from '@/components/adopt/adopt-content'
import type { CertificatesContent } from '@/components/certificates/certificates-content'
import type { AwardsContent } from '@/components/awards/awards-content'
import type { NatureContent } from '@/components/nature/nature-content'
import type { ActivitiesContent } from '@/components/activities/activities-content'
import type { LegalDoc, LegalKey } from '@/components/legal/legal-content'
import { builtInContent, SITE_FIELDS, type ContentKey } from './registry'
import { fillFrom, overlay, stripIds, type Json } from './merge'

/**
 * Page copy for server components, from the Medusa content admin.
 *
 * With `CONTENT_SOURCE=medusa`, each page's content comes from Medusa
 * (`GET /store/content`), cached in the Next data cache under the tag
 * `content:<key>` for up to 10 minutes. A publish in the admin clears that tag
 * through `/api/revalidate`, so edits show on the next view. Without the flag,
 * or when Medusa has no entry or cannot be reached, the built-in copy in the
 * `*-content.ts` files is used, so the site never renders without text.
 *
 * Stored content is completed from the built-in copy (a field added in code
 * after the content was saved still renders), then `_id`s are stripped.
 */

type Entry = { data: Json; translations: Record<string, Json> | null; updated_at: string }

const enabled = () => process.env.CONTENT_SOURCE === 'medusa'

/** Throws on any failure so a failed call is never cached. */
async function fetchEntries(keys: string[]): Promise<Record<string, Entry>> {
  const { entries } = await sdk.client.fetch<{ entries: Record<string, Entry> }>('/store/content', {
    method: 'GET',
    query: { keys: keys.join(',') },
    cache: 'no-store',
  })
  return entries ?? {}
}

/** One Medusa round trip per distinct key set per request; cached across requests. */
const getEntries = cache(async (keysCsv: string): Promise<Record<string, Entry>> => {
  const keys = keysCsv.split(',')
  try {
    return await unstable_cache(() => fetchEntries(keys), ['content-entries', keysCsv], {
      tags: ['content', ...keys.map((k) => `content:${k}`)],
      revalidate: 600,
    })()
  } catch (err) {
    console.error(`[content] Medusa unreachable for ${keysCsv}; using built-in copy:`, err)
    return {}
  }
})

function resolve(key: ContentKey, locale: string, entry: Entry | undefined): unknown {
  const builtIn = builtInContent(key, locale) as Json
  if (!entry?.data) return builtIn
  const localized =
    locale === routing.defaultLocale ? entry.data : overlay(entry.data, entry.translations?.[locale])
  return stripIds(fillFrom(builtIn, localized))
}

async function load<T>(key: ContentKey, locale: string): Promise<T> {
  if (!enabled()) return builtInContent(key, locale) as T
  const entries = await getEntries(key)
  return resolve(key, locale, entries[key]) as T
}

export type SiteContent = Pick<HomeContent, (typeof SITE_FIELDS)[number]>

/** Header, nav, footer and contact details — shown on every page. */
export const loadSiteContent = (locale: string) => load<SiteContent>('site', locale)

/** The whole `HomeContent` bundle: site chrome plus the home page sections. */
export async function loadHomeContent(locale: string): Promise<HomeContent> {
  if (!enabled()) return getHomeContent(locale)
  const entries = await getEntries('home,site')
  return {
    ...(resolve('site', locale, entries.site) as object),
    ...(resolve('home', locale, entries.home) as object),
  } as HomeContent
}

export const loadAboutContent = (locale: string) => load<AboutContent>('about', locale)
export const loadContactContent = (locale: string) => load<ContactContent>('contact', locale)
export const loadAdoptContent = (locale: string) => load<AdoptContent>('adopt', locale)
export const loadCertificatesContent = (locale: string) => load<CertificatesContent>('certificates', locale)
export const loadAwardsContent = (locale: string) => load<AwardsContent>('awards', locale)
export const loadNatureContent = (locale: string) => load<NatureContent>('nature', locale)
export const loadActivitiesContent = (locale: string) => load<ActivitiesContent>('activities', locale)
export const loadLegalContent = (key: LegalKey, locale: string) =>
  load<LegalDoc>(`legal.${key}`, locale)
