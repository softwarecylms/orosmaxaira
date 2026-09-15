import { getLocale } from 'next-intl/server'
import { loadHomeContent } from '@/lib/content/load'
import { HeroPairView } from './hero-pair-view'

/** Loads the section's copy, then renders HeroPairView (which the visual editor renders too). */
export async function HeroPair() {
  const { HERO } = await loadHomeContent(await getLocale())
  return <HeroPairView content={HERO} />
}
