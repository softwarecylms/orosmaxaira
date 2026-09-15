import { getHomeContent, type HomeContent } from '@/components/home/home-content'
import { getAboutContent } from '@/components/about/about-content'
import { getContactContent } from '@/components/contact/contact-content'
import { getAdoptContent } from '@/components/adopt/adopt-content'
import { getCertificatesContent } from '@/components/certificates/certificates-content'
import { getAwardsContent } from '@/components/awards/awards-content'
import { getNatureContent } from '@/components/nature/nature-content'
import { getActivitiesContent } from '@/components/activities/activities-content'
import { getLegalContent } from '@/components/legal/legal-content'

/**
 * Every editable content entry and the code's built-in copy for it. The
 * built-in copy is what the site shows when Medusa has no entry (or cannot be
 * reached), and what scripts/export-content.ts seeds Medusa with.
 *
 * `site` and `home` are both cut from `HomeContent`: `site` is what every page
 * shows (header, nav, footer, contact details), `home` the home page sections.
 */
export const CONTENT_KEYS = [
  'site',
  'home',
  'about',
  'contact',
  'adopt',
  'certificates',
  'awards',
  'nature',
  'activities',
  'legal.terms',
  'legal.privacy',
  'legal.orders',
  'legal.shipping',
] as const
export type ContentKey = (typeof CONTENT_KEYS)[number]

/** The parts of `HomeContent` that belong to the site chrome (key `site`). */
export const SITE_FIELDS = [
  'NAV',
  'ADOPT_LINK',
  'MEGA_MENU',
  'CONTACT',
  'FOOTER',
  'ANNOUNCEMENT',
  'READ_MORE',
  'SEARCH_PLACEHOLDER',
  'SEARCH_PLACEHOLDERS',
] as const satisfies readonly (keyof HomeContent)[]

const pickHome = (locale: string, site: boolean) =>
  Object.fromEntries(
    Object.entries(getHomeContent(locale)).filter(
      ([k]) => (SITE_FIELDS as readonly string[]).includes(k) === site,
    ),
  )

export function builtInContent(key: ContentKey, locale: string): unknown {
  switch (key) {
    case 'site':
      return pickHome(locale, true)
    case 'home':
      return pickHome(locale, false)
    case 'about':
      return getAboutContent(locale)
    case 'contact':
      return getContactContent(locale)
    case 'adopt':
      return getAdoptContent(locale)
    case 'certificates':
      return getCertificatesContent(locale)
    case 'awards':
      return getAwardsContent(locale)
    case 'nature':
      return getNatureContent(locale)
    case 'activities':
      return getActivitiesContent(locale)
    case 'legal.terms':
      return getLegalContent('terms', locale)
    case 'legal.privacy':
      return getLegalContent('privacy', locale)
    case 'legal.orders':
      return getLegalContent('orders', locale)
    case 'legal.shipping':
      return getLegalContent('shipping', locale)
  }
}
