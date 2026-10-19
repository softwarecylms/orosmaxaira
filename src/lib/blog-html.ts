import { convertLexicalToHTML, LinkHTMLConverter } from '@payloadcms/richtext-lexical/html'
import type { Post } from '@/payload-types'

/**
 * An article's body as HTML, for <ArticleView> (which styles plain HTML and
 * places the call-to-action inside it). Shared by the site (src/lib/blog.ts)
 * and the import script, which checks every converted article against the
 * original WordPress HTML — so no server-only imports here.
 */

type RichText = NonNullable<Post['content']>

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** A page or article's address on the site, per language. */
const sitePath = (slug: string | null | undefined, locale: string) =>
  `${locale === 'en' ? '/en' : ''}${slug && slug !== 'home' ? `/${slug}/` : '/'}`

export function richTextToHtml(content: RichText, locale: string): string {
  return convertLexicalToHTML({
    data: content as Parameters<typeof convertLexicalToHTML>[0]['data'],
    disableContainer: true,
    converters: ({ defaultConverters }) => ({
      ...defaultConverters,
      ...LinkHTMLConverter({
        // A link to another page or article picked in the editor.
        internalDocToHref: ({ linkNode }) => {
          const value = linkNode.fields.doc?.value
          return typeof value === 'object' && value && 'slug' in value
            ? sitePath(value.slug as string, locale)
            : '#'
        },
      }),
      blocks: {
        // Pictures by address — how the articles from the old site carry theirs.
        legacyImage: ({ node }: { node: { fields?: { src?: string; alt?: string } } }) => {
          const { src, alt } = node.fields ?? {}
          return src ? `<img src="${esc(src)}" alt="${esc(alt ?? '')}" loading="lazy" />` : ''
        },
      },
    }),
  })
}

/** True when the rich text has something in it (a new article starts as one empty paragraph). */
export function hasRichText(content: Post['content'] | undefined): content is RichText {
  const children = content?.root?.children ?? []
  if (!children.length) return false
  if (children.length > 1) return true
  const only = children[0] as { type?: string; children?: unknown[] }
  return only.type !== 'paragraph' || (only.children?.length ?? 0) > 0
}

/** The body the site shows: the rich text, or — while that is empty — the old site's HTML. */
export function postBodyHtml(doc: Pick<Post, 'content' | 'legacyContent'>, locale: string): string {
  return hasRichText(doc.content) ? richTextToHtml(doc.content, locale) : (doc.legacyContent ?? '')
}

/** Readable text of some HTML — for word counts and the import's checks. */
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/[\s ]+/g, ' ')
    .trim()
}
