import { Fragment, type ReactNode } from 'react'

// Matches **bold**, *italic* or [label](href) — admin-editable inline markup.
// Bold is listed first so `**x**` is never mistaken for an empty italic.
const TOKEN = /\*\*(.+?)\*\*|\*(?!\s)([^*\n]+?)(?<!\s)\*|\[([^\]]+)\]\(([^)]+)\)/g

/**
 * Minimal inline formatter for admin-entered text: `**bold**`, `*italic*` and
 * `[label](href)` (tel:/mailto:/http/relative). Everything else is rendered
 * verbatim; newlines are preserved when the parent uses `whitespace-pre-line`.
 * Server-safe (no hooks).
 *
 * Block-level markup (paragraphs, bullet and numbered lists) is handled by
 * `RichBody` in `src/components/content/rich-body.tsx`, which calls this for the
 * inline pass. The admin's formatting toolbar writes exactly this syntax.
 */
export function RichText({ text }: { text: string }) {
  const out: ReactNode[] = []
  let last = 0
  let key = 0

  for (const m of text.matchAll(TOKEN)) {
    const idx = m.index ?? 0
    if (idx > last) out.push(<Fragment key={key++}>{text.slice(last, idx)}</Fragment>)

    if (m[1] !== undefined) {
      out.push(
        <strong key={key++} className="font-semibold text-foreground">
          {m[1]}
        </strong>,
      )
    } else if (m[2] !== undefined) {
      out.push(<em key={key++}>{m[2]}</em>)
    } else {
      const href = m[4]
      const external = /^https?:/i.test(href)
      out.push(
        <a
          key={key++}
          href={href}
          className="font-medium text-accent underline-offset-2 hover:underline"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {m[3]}
        </a>,
      )
    }
    last = idx + m[0].length
  }

  if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
  return <>{out}</>
}
