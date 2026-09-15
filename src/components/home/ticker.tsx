import { getLocale } from 'next-intl/server'
import { loadHomeContent } from '@/lib/content/load'
import { TickerView } from './ticker-view'

/** Loads the section's copy, then renders TickerView (which the visual editor renders too). */
export async function Ticker() {
  const { TICKER } = await loadHomeContent(await getLocale())
  return <TickerView content={TICKER} />
}
