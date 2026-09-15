import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * On-demand cache invalidation. The Medusa backend calls this after an admin
 * publishes content, with `{ tags: ['content:home'] }` as JSON and the shared
 * secret in the `x-revalidate-secret` header. The older query form
 * (`?secret=…&tag=…&path=…`) still works.
 */
export async function POST(req: Request) {
  const url = new URL(req.url)
  const secret = req.headers.get('x-revalidate-secret') ?? url.searchParams.get('secret')
  if (!process.env.REVALIDATION_SECRET || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { tags?: unknown; paths?: unknown } = {}
  if (req.headers.get('content-type')?.includes('application/json')) {
    body = await req.json().catch(() => ({}))
  }
  const strings = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.length > 0) : []
  const tags = [...strings(body.tags), ...url.searchParams.getAll('tag')]
  const paths = [...strings(body.paths), ...url.searchParams.getAll('path')]

  try {
    for (const tag of tags) revalidateTag(tag)
    for (const path of paths) revalidatePath(path)
    return NextResponse.json({ revalidated: true, tags, paths })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  return POST(req)
}
