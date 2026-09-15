import { getLocale } from 'next-intl/server'
import { loadHomeContent } from '@/lib/content/load'
import { TrustBadgesView } from './trust-badges-view'

/** Loads the section's copy, then renders TrustBadgesView (which the visual editor renders too). */
export async function TrustBadges() {
  const { TRUST } = await loadHomeContent(await getLocale())
  return <TrustBadgesView content={TRUST} />
}
