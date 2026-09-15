import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Data } from '@measured/puck'
import { resolveLive } from '@/puck/live.server'

export const dynamic = 'force-dynamic'

/** POST { data, locale } → the live data those blocks show (prices, newest
 *  articles…), for the visual editor's preview. CMS users only. */
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = (await req.json().catch(() => ({}))) as { data?: Data; locale?: string }
  const live = await resolveLive(body.data, body.locale === 'en' ? 'en' : 'el')
  return NextResponse.json({ live })
}
