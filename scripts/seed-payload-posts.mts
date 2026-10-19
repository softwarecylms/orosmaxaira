// Load the blog's 73 articles into Payload → Posts — Greek and English title,
// excerpt, date, categories, cover, SEO title and text — from the old site's
// snapshot (src/components/blog/blog-data.ts). Run with:
//
//   npx tsx scripts/seed-payload-posts.mts
//
// The WordPress HTML becomes rich text the editor can change, and is also kept
// verbatim in «Original text (HTML)». Pictures inside the text become «Image by
// address» blocks (the files stay where they are, under /wp-content/uploads/).
// Every converted article is checked against the original — same words, links,
// headings, list items and pictures — and nothing is written unless all pass.
//
// Articles that already exist are left alone (an editor may have changed them);
// FORCE=1 rewrites them (earlier versions stay in the article's history).
// ONLY=<slug>[,<slug>] limits the run. DRY=1 converts and checks only.
// Point DATABASE_URI at the database to load (local by default, from .env).
// A run outside Next.js can't clear the site's cache: afterwards, revalidate
// the `posts` tag (POST /api/revalidate/ with {"tags":["posts"]}).
import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import config from '../src/payload.config.ts'
import { BLOG_POSTS, getBlogPosts } from '../src/components/blog/blog-data.ts'
import { BLOG_CATEGORIES, getBlogCategories, POST_CATEGORIES } from '../src/components/blog/blog-categories.ts'
import { ARTICLE_SEO_TITLES } from '../src/components/blog/article-seo.ts'
import { htmlToText, richTextToHtml } from '../src/lib/blog-html.ts'

type Node = { type: string; text?: string; children?: Node[]; [k: string]: unknown }
type Lexical = { root: Node & { children: Node[] } }

const FORCE = process.env.FORCE === '1'
const DRY = process.env.DRY === '1'
const ONLY = new Set((process.env.ONLY ?? '').split(',').map((s) => s.trim()).filter(Boolean))

/** The old site's own files are served by this site: keep the path, drop the host. */
const sitePath = (url: string) => url.replace(/^https?:\/\/(www\.)?orosmaxaira\.com(?=\/wp-content\/)/i, '')

const MARK = (n: number) => `@@IMG${n}@@`
const MARK_RE = /@@IMG(\d+)@@/

/** WordPress HTML → rich text, pictures as «Image by address» blocks. */
function toRichText(html: string, editorConfig: Awaited<ReturnType<typeof editorConfigFactory.default>>): Lexical {
  const images: { src: string; alt: string }[] = []
  const marked = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = tag.match(/\ssrc="([^"]*)"/i)?.[1] ?? ''
    const alt = tag.match(/\salt="([^"]*)"/i)?.[1] ?? ''
    images.push({ src: sitePath(src), alt })
    return MARK(images.length - 1)
  })
  const state = convertHTMLToLexical({ editorConfig, html: marked, JSDOM }) as unknown as Lexical

  const block = (n: number): Node => ({
    type: 'block',
    version: 2,
    format: '',
    fields: { id: randomBytes(12).toString('hex'), blockName: '', blockType: 'legacyImage', ...images[n] },
  })

  // A paragraph holding a marker splits around it: text before, the picture, text after.
  const out: Node[] = []
  for (const node of state.root.children) {
    const hasMark = (n: Node): boolean => (n.text ? MARK_RE.test(n.text) : (n.children ?? []).some(hasMark))
    if (node.type !== 'paragraph' || !hasMark(node)) {
      out.push(node)
      continue
    }
    let current: Node[] = []
    const flush = () => {
      const visible = current.some((c) => c.type !== 'text' || (c.text ?? '').trim())
      if (visible) out.push({ ...node, children: current })
      current = []
    }
    for (const child of node.children ?? []) {
      if (child.type !== 'text' || !MARK_RE.test(child.text ?? '')) {
        if (hasMark(child)) throw new Error('a picture inside a link or formatting — not supported')
        current.push(child)
        continue
      }
      const parts = (child.text ?? '').split(/(@@IMG\d+@@)/)
      for (const part of parts) {
        const m = part.match(/^@@IMG(\d+)@@$/)
        if (m) {
          flush()
          out.push(block(Number(m[1])))
        } else if (part) {
          current.push({ ...child, text: part })
        }
      }
    }
    flush()
  }
  return { ...state, root: { ...state.root, children: out } }
}

/** What must survive the conversion: the words, and how many links, headings, list items and pictures. */
function fingerprint(html: string) {
  const count = (re: RegExp) => (html.match(re) ?? []).length
  // Like a browser: block tags separate words, inline ones (<strong>Τι</strong><strong>p</strong>) don't.
  const inline = /<\/?(strong|b|em|i|u|sup|sub|span|a|s|code)(\s[^>]*)?>/gi
  return {
    text: htmlToText(html.replace(inline, '')),
    links: count(/<a\s[^>]*href=/gi),
    headings: count(/<h[1-6][\s>]/gi),
    items: count(/<li[\s>]/gi),
    images: count(/<img\s/gi),
    // Bold and italic text, whitespace aside (adjacent runs merge on conversion).
    bold: (html.match(/<(strong|b)\b[^>]*>[\s\S]*?<\/\1>/gi) ?? []).map((m) => htmlToText(m.replace(/<[^>]+>/g, ''))).join('').replace(/\s+/g, ''),
    italic: (html.match(/<(em|i)\b[^>]*>[\s\S]*?<\/\1>/gi) ?? []).map((m) => htmlToText(m.replace(/<[^>]+>/g, ''))).join('').replace(/\s+/g, ''),
  }
}

function check(slug: string, lang: string, original: string, converted: string): string[] {
  const a = fingerprint(original)
  const b = fingerprint(converted)
  const problems: string[] = []
  if (a.text !== b.text) {
    let i = 0
    while (i < a.text.length && a.text[i] === b.text[i]) i++
    problems.push(`${slug} [${lang}] text differs at ${i}: «${a.text.slice(i, i + 60)}» vs «${b.text.slice(i, i + 60)}»`)
  }
  for (const k of ['links', 'headings', 'items', 'images', 'bold', 'italic'] as const) {
    if (a[k] !== b[k]) problems.push(`${slug} [${lang}] ${k}: ${a[k]} → ${b[k]}`)
  }
  return problems
}

const payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({ config: payload.config })

const en = new Map(getBlogPosts('en').map((p) => [p.slug, p]))
const selected = BLOG_POSTS.filter((p) => !ONLY.size || ONLY.has(p.slug))

// 1. Convert and check everything first; write nothing if any article fails.
const converted = selected.map((p) => {
  const e = en.get(p.slug) ?? p
  return { post: p, enPost: e, el: toRichText(p.content, editorConfig), en: toRichText(e.content, editorConfig) }
})
const problems = converted.flatMap((c) => [
  ...check(c.post.slug, 'el', c.post.content, richTextToHtml(c.el as never, 'el')),
  ...check(c.post.slug, 'en', c.enPost.content, richTextToHtml(c.en as never, 'en')),
])
console.log(`Converted ${converted.length} articles × 2 languages; ${problems.length} problem(s).`)
for (const p of problems) console.log('  ✗', p)
if (problems.length || DRY) process.exit(problems.length ? 1 : 0)

// 2. Categories, by slug: Greek and English names.
const enCategories = new Map(getBlogCategories('en').map((c) => [c.slug, c.name]))
const categoryIds = new Map<string, number | string>()
for (const c of BLOG_CATEGORIES) {
  const found = await payload.find({ collection: 'categories', where: { slug: { equals: c.slug } }, limit: 1, depth: 0 })
  let id = found.docs[0]?.id
  if (!id) {
    id = (await payload.create({ collection: 'categories', locale: 'el', data: { name: c.name, slug: c.slug } })).id
    console.log(`+ category ${c.slug}`)
  }
  await payload.update({ collection: 'categories', id, locale: 'en', data: { name: enCategories.get(c.slug) ?? c.name } })
  categoryIds.set(c.slug, id)
}

// 3. Articles. The snapshot is newest first; articles sharing a date get
//    descending times so the blog keeps that order.
const perDay = new Map<string, number>()
let created = 0
let updated = 0
let skipped = 0
for (const { post, enPost, el, en: enText } of converted) {
  const k = perDay.get(post.date) ?? 0
  perDay.set(post.date, k + 1)
  const publishedAt = new Date(Date.parse(`${post.date}T09:00:00.000Z`) - k * 60_000).toISOString()
  const seo = ARTICLE_SEO_TITLES[post.slug]

  const existing = await payload.find({
    collection: 'posts',
    where: { slug: { equals: post.slug } },
    limit: 1,
    depth: 0,
    draft: true,
  })
  const current = existing.docs[0]
  if (current && !FORCE) {
    skipped++
    continue
  }

  const elData = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    publishedAt,
    categories: (POST_CATEGORIES[post.slug] ?? []).flatMap((s) => (categoryIds.has(s) ? [categoryIds.get(s)!] : [])),
    legacyCover: post.image ? sitePath(post.image) : null,
    content: el,
    legacyContent: post.content,
    seo: { title: seo?.el ?? '' },
    _status: 'published' as const,
  }
  const doc = current
    ? await payload.update({ collection: 'posts', id: current.id, locale: 'el', data: elData as never })
    : await payload.create({ collection: 'posts', locale: 'el', data: elData as never })
  await payload.update({
    collection: 'posts',
    id: doc.id,
    locale: 'en',
    data: {
      title: enPost.title,
      excerpt: enPost.excerpt,
      content: enText,
      legacyContent: enPost.content,
      seo: { title: seo?.en ?? '' },
      _status: 'published',
    } as never,
  })
  if (current) updated++
  else created++
  console.log(`${current ? '~' : '+'} ${post.slug}`)
}

console.log(`Done: ${created} created, ${updated} rewritten, ${skipped} left alone.`)
process.exit(0)
