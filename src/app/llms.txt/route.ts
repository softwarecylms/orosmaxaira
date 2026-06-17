import { getSiteSettings, getAllPagesMeta, getAllPosts } from '@/lib/cms'
import { siteUrl } from '@/lib/seo'

/**
 * /llms.txt — the "sitemap.xml for AI". A Markdown manifest that answer engines
 * (ChatGPT, Claude, Perplexity) and crawlers can read to understand the site's
 * structure and cite it accurately. Spec: https://llmstxt.org
 *
 * Fed live from Payload, revalidated hourly. Almost no agency ships this — it's
 * our cheapest AEO differentiator.
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

export async function GET() {
  const base = siteUrl()
  const [settings, pages, posts] = await Promise.all([
    getSiteSettings(),
    getAllPagesMeta(),
    getAllPosts(200),
  ])

  const s = (settings ?? {}) as Record<string, unknown>
  const name =
    (s.siteName as string) || (s.title as string) || 'Your Brand'
  const summary =
    (s.description as string) ||
    'One-sentence description of this site. Set it in the Site Settings global.'

  const lines: string[] = [`# ${name}`, '', `> ${summary}`, '']

  const pageLinks = pages.filter((p) => !RESERVED.has(p.slug))
  if (pageLinks.length) {
    lines.push('## Pages', '')
    for (const p of pageLinks) {
      const desc = p.description ? `: ${p.description}` : ''
      lines.push(`- [${p.title || p.slug}](${base}/${p.slug})${desc}`)
    }
    lines.push('')
  }

  if (posts.length) {
    lines.push('## Blog', '')
    for (const post of posts) {
      if (!post.slug) continue
      const excerpt = (post.excerpt ?? '').toString().trim()
      const desc = excerpt ? `: ${excerpt}` : ''
      lines.push(`- [${post.title}](${base}/${post.slug})${desc}`)
    }
    lines.push('')
  }

  lines.push(
    '## Full content',
    '',
    `- [Full text for LLMs](${base}/llms-full.txt): every page and post, concatenated as plain text.`,
    '',
  )

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
