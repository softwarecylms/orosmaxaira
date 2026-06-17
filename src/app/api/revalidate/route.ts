import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  if (!process.env.REVALIDATION_SECRET || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = url.searchParams.get('path')
  const tag = url.searchParams.get('tag')

  try {
    if (path) revalidatePath(path)
    if (tag) revalidateTag(tag)
    return NextResponse.json({ revalidated: true, path, tag })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  return POST(req)
}
