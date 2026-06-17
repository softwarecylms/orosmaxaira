import { getSiteSettings, getAllPagesMeta, getAllPosts } from '@/lib/cms'
import { siteUrl } from '@/lib/seo'

/**
 * /llms-full.txt — the expanded companion to /llms.txt: every page and post
 * concatenated as plain text so an answer engine can ingest the whole site in
 * one fetch. Capped well under the ~150k-token convention.
 *
 * Note: page bodies are Puck JSON and posts are Lexical rich text, so this
 * currently emits title + URL + summary/excerpt per entry. If we add a
 * plaintext serializer for those formats later, drop the prose in here.
 */
export const revalidate = 3600

const RESERVED = new Set([
  'home',
  'portfolio',
  'portfolio-category',
  'category',
  'tag',
  'author',
  'admin',
  'api',
])

const MAX_CHARS = 400_000

export async function GET() {
  const base = siteUrl()
  const [settings, pages, posts] = await Promise.all([
    getSiteSettings(),
    getAllPagesMeta(),
    getAllPosts(500),
  ])

  const s = (settings ?? {}) as Record<string, unknown>
  const name = (s.siteName as string) || (s.title as string) || 'Your Brand'
  const summary =
    (s.description as string) ||
    'One-sentence description of this site. Set it in the Site Settings global.'

  const lines: string[] = [`# ${name} — full content for LLMs`, '', summary, '', '---', '']

  for (const p of pages.filter((pg) => !RESERVED.has(pg.slug))) {
    lines.push(`# ${p.title || p.slug}`, `URL: ${base}/${p.slug}`)
    if (p.description) lines.push('', p.description)
    lines.push('', '---', '')
  }

  for (const post of posts) {
    if (!post.slug) continue
    lines.push(`# ${post.title}`, `URL: ${base}/${post.slug}`)
    const excerpt = (post.excerpt ?? '').toString().trim()
    if (excerpt) lines.push('', excerpt)
    lines.push('', '---', '')
  }

  const body = lines.join('\n').slice(0, MAX_CHARS)

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
