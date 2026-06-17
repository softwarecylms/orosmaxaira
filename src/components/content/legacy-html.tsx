import * as React from 'react'

type Props = {
  html?: string | null
  richText?: unknown
  fallback?: React.ReactNode
  contextTitle?: string
}

/** Light sanitization: strip <script> tags from stored HTML. */
function sanitizeHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
}

function richTextToText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { text?: string; children?: unknown[] }
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.children)) return n.children.map(richTextToText).join('')
  return ''
}

function richTextHasContent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const root = (value as { root?: { children?: unknown[] } }).root
  if (!root?.children) return false
  return root.children.some((child) => richTextToText(child).trim().length > 0)
}

export function LegacyHtml({ html, richText, fallback }: Props) {
  // A Post/CaseStudy may store raw HTML in `legacyContent`; otherwise use richText.
  if (typeof html === 'string' && html.trim().length > 0) {
    const safe = sanitizeHtml(html)
    return (
      <div
        className="legacy-html"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    )
  }

  if (richTextHasContent(richText)) {
    return (
      <div className="legacy-html">
        <RichTextRender value={richText} />
      </div>
    )
  }

  return <>{fallback ?? null}</>
}

function RichTextRender({ value }: { value: unknown }) {
  const text = richTextToText((value as { root?: unknown })?.root ?? value)
  if (!text.trim()) return null
  return <p>{text}</p>
}
