import { getLocale } from 'next-intl/server'
import { loadHomeContent } from '@/lib/content/load'
import { AdoptHiveBannerView } from './adopt-hive-banner-view'

/** Loads the banner's copy, then renders AdoptHiveBannerView. `body` replaces
 *  the text where the banner is reused with tailored copy (the nature page). */
export async function AdoptHiveBanner({ body }: { body?: string } = {}) {
  const { ADOPT } = await loadHomeContent(await getLocale())
  return <AdoptHiveBannerView content={body ? { ...ADOPT, body } : ADOPT} />
}
