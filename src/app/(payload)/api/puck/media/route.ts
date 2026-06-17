import { NextResponse, type NextRequest } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const q = url.searchParams.get('q') ?? ''
  const idsParam = url.searchParams.get('ids')

  if (idsParam) {
    const ids = idsParam
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n))
    if (!ids.length) return NextResponse.json({ docs: [] })
    const res = await payload.find({
      collection: 'media',
      where: { id: { in: ids } },
      limit: ids.length + 5,
      depth: 0,
    })
    return NextResponse.json({ docs: res.docs })
  }

  const where: Where | undefined = q
    ? {
        or: [{ filename: { like: q } }, { alt: { like: q } }],
      }
    : undefined

  const res = await payload.find({
    collection: 'media',
    where,
    limit: 50,
    depth: 0,
  })

  const docs = res.docs.map((d) => ({
    id: (d as { id: number }).id,
    filename: (d as { filename?: string }).filename ?? '',
    alt: (d as { alt?: string }).alt ?? '',
    url: (d as { url?: string }).url ?? '',
    mimeType: (d as { mimeType?: string }).mimeType ?? '',
  }))

  return NextResponse.json({ docs })
}
