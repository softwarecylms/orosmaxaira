import { Fragment, type ReactNode } from 'react'

// Matches **bold** or [label](href) — admin-editable inline markup.
const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g

/**
 * Minimal inline formatter for admin-entered activity text: `**bold**` and
 * `[label](href)` (tel:/mailto:/http/relative). Everything else is rendered
 * verbatim; newlines are preserved when the parent uses `whitespace-pre-line`.
 * Server-safe (no hooks).
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
    } else {
      const href = m[3]
      const external = /^https?:/i.test(href)
      out.push(
        <a
          key={key++}
          href={href}
          className="font-medium text-accent underline-offset-2 hover:underline"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {m[2]}
        </a>,
      )
    }
    last = idx + m[0].length
  }

  if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
  return <>{out}</>
}
