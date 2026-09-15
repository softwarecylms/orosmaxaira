import { getLocale } from 'next-intl/server'
import { loadHomeContent } from '@/lib/content/load'
import { HeritageView } from './heritage-view'

/** Loads the section's copy, then renders HeritageView (which the visual editor renders too). */
export async function Heritage() {
  const { HERITAGE } = await loadHomeContent(await getLocale())
  return <HeritageView content={HERITAGE} />
}
