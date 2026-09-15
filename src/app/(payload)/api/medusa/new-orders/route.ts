import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { countNewOrders } from '@/lib/medusa/new-orders'

export const dynamic = 'force-dynamic'

/** GET → { count } of shop orders waiting to be handled, for the sidebar badge. CMS users only. */
export async function GET(req: NextRequest) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json({ count: await countNewOrders() })
}
