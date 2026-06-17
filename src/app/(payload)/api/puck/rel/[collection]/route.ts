import { NextResponse, type NextRequest } from 'next/server'
import { getPayload, type CollectionSlug, type Where } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

const ALLOWED = new Set([
  'client-logos',
  'testimonials',
  'case-studies',
  'posts',
  'jobs',
  'faqs',
  'team-members',
])

const searchFieldsByCollection: Record<string, string[]> = {
  'client-logos': ['name'],
  testimonials: ['author', 'quote'],
  'case-studies': ['title', 'client'],
  posts: ['title'],
  jobs: ['title'],
  faqs: ['question'],
  'team-members': ['name', 'role'],
}

const summaryFieldsByCollection: Record<
  string,
  Array<{ key: string; label?: string }>
> = {
  'client-logos': [{ key: 'name' }],
  testimonials: [{ key: 'author' }, { key: 'quote' }],
  'case-studies': [{ key: 'title' }, { key: 'client' }],
  posts: [{ key: 'title' }, { key: 'category' }],
  jobs: [{ key: 'title' }, { key: 'type' }],
  faqs: [{ key: 'question' }],
  'team-members': [{ key: 'name' }, { key: 'role' }],
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ collection: string }> },
) {
  const { collection } = await ctx.params
  if (!ALLOWED.has(collection)) {
    return NextResponse.json({ error: 'collection not allowed' }, { status: 404 })
  }

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
      collection: collection as CollectionSlug,
      where: { id: { in: ids } },
      limit: ids.length + 5,
      depth: 1,
    })
    return NextResponse.json({ docs: res.docs })
  }

  const searchFields = searchFieldsByCollection[collection] ?? []
  const where: Where | undefined =
    q && searchFields.length
      ? { or: searchFields.map((f) => ({ [f]: { like: q } })) }
      : undefined

  const res = await payload.find({
    collection: collection as CollectionSlug,
    where,
    limit: 50,
    depth: 0,
  })

  const summaryFields = summaryFieldsByCollection[collection] ?? []
  const docs = res.docs.map((d) => {
    const doc = d as unknown as Record<string, unknown>
    const out: Record<string, unknown> = { id: doc.id as number }
    for (const f of summaryFields) {
      const v = doc[f.key]
      if (typeof v === 'string') out[f.key] = v.length > 80 ? v.slice(0, 80) + '…' : v
      else if (typeof v === 'number') out[f.key] = v
    }
    return out
  })

  return NextResponse.json({ docs })
}
