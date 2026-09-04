import { useRef } from "react"
import { IconButton, Text } from "@medusajs/ui"
import { ListBullet, Link as LinkIcon } from "@medusajs/icons"

/**
 * Textarea with a formatting toolbar — bold, italic, bullet list, numbered list
 * and link.
 *
 * The stored value stays plain text with light Markdown, which is what the
 * storefront's `RichText` / `RichBody` render (`**bold**`, `*italic*`, `- item`,
 * `1. item`, `[label](href)`). A WYSIWYG producing HTML would not render — the
 * site deliberately does not inject raw HTML from the admin — so the toolbar
 * writes that syntax instead, and the editor keeps seeing exactly what the page
 * will show.
 */

type Sel = { start: number; end: number }

/** Wrap the selection in `marker`, or unwrap it if already wrapped. */
function toggleWrap(value: string, sel: Sel, marker: string): { text: string; sel: Sel } {
  const { start, end } = sel
  const inner = value.slice(start, end)
  const before = value.slice(0, start)
  const after = value.slice(end)

  if (inner.startsWith(marker) && inner.endsWith(marker) && inner.length >= marker.length * 2) {
    const stripped = inner.slice(marker.length, -marker.length)
    return {
      text: before + stripped + after,
      sel: { start, end: start + stripped.length },
    }
  }
  if (before.endsWith(marker) && after.startsWith(marker)) {
    return {
      text: before.slice(0, -marker.length) + inner + after.slice(marker.length),
      sel: { start: start - marker.length, end: end - marker.length },
    }
  }
  const placeholder = inner || "κείμενο"
  return {
    text: `${before}${marker}${placeholder}${marker}${after}`,
    sel: { start: start + marker.length, end: start + marker.length + placeholder.length },
  }
}

/** Prefix each selected line (or the current one) with a list marker. */
function toggleList(value: string, sel: Sel, ordered: boolean): { text: string; sel: Sel } {
  const lineStart = value.lastIndexOf("\n", Math.max(0, sel.start - 1)) + 1
  const nlAfter = value.indexOf("\n", sel.end)
  const lineEnd = nlAfter === -1 ? value.length : nlAfter

  const block = value.slice(lineStart, lineEnd)
  const lines = block.split("\n")
  const MARK = /^(\s*)([-*]\s+|\d+[.)]\s+)/
  const already = lines.every((l) => MARK.test(l) || !l.trim())

  const next = lines
    .map((l, i) => {
      const bare = l.replace(MARK, "")
      if (already) return bare
      if (!bare.trim()) return bare
      return ordered ? `${i + 1}. ${bare}` : `- ${bare}`
    })
    .join("\n")

  return {
    text: value.slice(0, lineStart) + next + value.slice(lineEnd),
    sel: { start: lineStart, end: lineStart + next.length },
  }
}

function insertLink(value: string, sel: Sel): { text: string; sel: Sel } {
  const label = value.slice(sel.start, sel.end) || "κείμενο"
  const snippet = `[${label}](https://)`
  return {
    text: value.slice(0, sel.start) + snippet + value.slice(sel.end),
    // Select the href so it can be typed over straight away.
    sel: {
      start: sel.start + label.length + 3,
      end: sel.start + snippet.length - 1,
    },
  }
}

export function RichTextarea({
  value,
  onChange,
  disabled,
  rows = 5,
}: {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  rows?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const run = (fn: (v: string, s: Sel) => { text: string; sel: Sel }) => {
    const el = ref.current
    if (!el || disabled) return
    const sel: Sel = { start: el.selectionStart, end: el.selectionEnd }
    const { text, sel: nextSel } = fn(value ?? "", sel)
    onChange(text)
    // Restore the selection after React re-renders the controlled textarea.
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(nextSel.start, nextSel.end)
    })
  }

  const btn = (
    key: string,
    title: string,
    label: React.ReactNode,
    fn: (v: string, s: Sel) => { text: string; sel: Sel },
  ) => (
    <IconButton
      key={key}
      size="small"
      variant="transparent"
      type="button"
      title={title}
      disabled={disabled}
      onClick={() => run(fn)}
    >
      {label}
    </IconButton>
  )

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-b-0 border-ui-border-base bg-ui-bg-subtle px-1 py-1">
        {btn("b", "Έντονα (bold)", <span className="px-1 text-[13px] font-bold">B</span>, (v, s) =>
          toggleWrap(v, s, "**"),
        )}
        {btn("i", "Πλάγια (italic)", <span className="px-1 text-[13px] italic">I</span>, (v, s) =>
          toggleWrap(v, s, "*"),
        )}
        <span className="mx-1 h-4 w-px bg-ui-border-base" />
        {btn("ul", "Λίστα με κουκκίδες", <ListBullet />, (v, s) => toggleList(v, s, false))}
        {btn(
          "ol",
          "Αριθμημένη λίστα",
          <span className="px-1 text-[12px] font-medium">1.</span>,
          (v, s) => toggleList(v, s, true),
        )}
        <span className="mx-1 h-4 w-px bg-ui-border-base" />
        {btn("a", "Σύνδεσμος", <LinkIcon />, insertLink)}
      </div>

      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className="min-h-[120px] w-full rounded-b-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm outline-none focus:border-ui-border-interactive disabled:opacity-60"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />

      <Text size="xsmall" className="text-ui-fg-muted">
        Κενή γραμμή = νέα παράγραφος. **έντονα** · *πλάγια* · «- » λίστα · «1. » αριθμημένη
      </Text>
    </div>
  )
}
