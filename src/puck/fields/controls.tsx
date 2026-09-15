'use client'

import * as React from 'react'
import { FieldLabel } from '@measured/puck'

/**
 * Custom inputs for the visual editor's generated fields (see derive.ts):
 * an image picker, a one-item-per-line list, and rich text written as
 * **bold** and [text](link). Each receives Puck's custom-field props.
 */

type ControlProps<V> = {
  name: string
  value: V
  onChange: (value: V) => void
  readOnly?: boolean
  field: { label?: string }
}

const inputCls =
  'w-full rounded-md border border-[#d9d9d9] bg-white px-2.5 py-2 text-[13px] leading-snug text-[#1d1d1f] outline-none focus:border-[#F1AC10]'

function Label({ field, children }: { field: { label?: string }; children: React.ReactNode }) {
  return <FieldLabel label={field.label ?? ''}>{children}</FieldLabel>
}

// --- Rich text ---------------------------------------------------------------

export type Span = { text: string; bold?: boolean; href?: string; accent?: boolean }

const isSpanArray = (v: unknown): v is Span[] =>
  Array.isArray(v) && v.every((s) => s && typeof s === 'object' && typeof (s as Span).text === 'string')

export function spansToMarkup(v: unknown): string {
  if (typeof v === 'string') return v
  if (!isSpanArray(v)) return ''
  return v
    .map((s) => {
      let t = s.href ? `[${s.text}](${s.href})` : s.text
      if (s.bold) t = `**${t}**`
      return t
    })
    .join('')
}

/** Parse **bold** and [text](url). `accentLinks` marks links the way the
 *  contact copy does (`accent: true`). */
export function markupToSpans(markup: string, accentLinks = false): Span[] {
  const out: Span[] = []
  const re = /\*\*(\[([^\]]+)\]\(([^)]+)\)|[^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  const push = (s: Span) => {
    if (s.text) out.push(accentLinks && s.href ? { ...s, accent: true } : s)
  }
  while ((m = re.exec(markup))) {
    push({ text: markup.slice(last, m.index) })
    if (m[1] !== undefined) {
      push(m[2] !== undefined ? { text: m[2], href: m[3], bold: true } : { text: m[1], bold: true })
    } else {
      push({ text: m[4], href: m[5] })
    }
    last = m.index + m[0].length
  }
  push({ text: markup.slice(last) })
  return out
}

const HINT = 'Έντονα: **κείμενο** · Σύνδεσμος: [κείμενο](/διεύθυνση)'

export function RichLineControl({ field, value, onChange, readOnly }: ControlProps<Span[] | string>) {
  const accent = isSpanArray(value) && value.some((s) => s.accent)
  const markup = spansToMarkup(value)
  return (
    <Label field={field}>
      <textarea
        className={inputCls}
        rows={Math.min(8, Math.max(2, Math.ceil(markup.length / 45)))}
        value={markup}
        readOnly={readOnly}
        onChange={(e) => onChange(markupToSpans(e.target.value, accent))}
      />
      <p className="mt-1 text-[11px] text-[#767676]">{HINT}</p>
    </Label>
  )
}

/** Several rich paragraphs; a blank line starts a new one. */
export function RichParagraphsControl({ field, value, onChange, readOnly }: ControlProps<Span[][]>) {
  const paras = Array.isArray(value) ? value : []
  const markup = paras.map((p) => spansToMarkup(p)).join('\n\n')
  return (
    <Label field={field}>
      <textarea
        className={inputCls}
        rows={Math.min(14, Math.max(4, Math.ceil(markup.length / 45)))}
        value={markup}
        readOnly={readOnly}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(/\n\s*\n/)
              .map((p) => markupToSpans(p.trim()))
              .filter((p) => p.length),
          )
        }
      />
      <p className="mt-1 text-[11px] text-[#767676]">Κενή γραμμή = νέα παράγραφος. {HINT}</p>
    </Label>
  )
}

// --- Lists ---------------------------------------------------------------------

export function StringListControl({ field, value, onChange, readOnly }: ControlProps<string[]>) {
  const items = Array.isArray(value) ? value : []
  const [draft, setDraft] = React.useState(items.join('\n'))
  // Keep the textarea in step when the value changes from outside (undo, locale switch).
  React.useEffect(() => {
    if (draft.split('\n').filter(Boolean).join('\n') !== items.join('\n')) setDraft(items.join('\n'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.join('\n')])
  return (
    <Label field={field}>
      <textarea
        className={inputCls}
        rows={Math.min(10, Math.max(3, items.length + 1))}
        value={draft}
        readOnly={readOnly}
        onChange={(e) => {
          setDraft(e.target.value)
          onChange(e.target.value.split('\n').map((l) => l.trim()).filter(Boolean))
        }}
      />
      <p className="mt-1 text-[11px] text-[#767676]">Ένα στοιχείο ανά γραμμή.</p>
    </Label>
  )
}

/** A legal document's paragraphs: blank line = new paragraph; a paragraph whose
 *  lines all start with "- " is a bullet list. */
export function ParagraphsControl({ field, value, onChange, readOnly }: ControlProps<Array<string | string[]>>) {
  const blocks = Array.isArray(value) ? value : []
  const toText = (b: string | string[]) => (Array.isArray(b) ? b.map((li) => `- ${li}`).join('\n') : b)
  const [draft, setDraft] = React.useState(blocks.map(toText).join('\n\n'))
  const parse = (text: string) =>
    text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const lines = p.split('\n').map((l) => l.trim())
        return lines.every((l) => l.startsWith('- ')) ? lines.map((l) => l.slice(2)) : p
      })
  return (
    <Label field={field}>
      <textarea
        className={inputCls}
        rows={Math.min(16, Math.max(5, Math.ceil(draft.length / 45)))}
        value={draft}
        readOnly={readOnly}
        onChange={(e) => {
          setDraft(e.target.value)
          onChange(parse(e.target.value))
        }}
      />
      <p className="mt-1 text-[11px] text-[#767676]">Κενή γραμμή = νέα παράγραφος. Γραμμές που ξεκινούν με «- » γίνονται λίστα.</p>
    </Label>
  )
}

// --- Images --------------------------------------------------------------------

type LibraryItem = { src: string; name: string; folder: string }

async function loadLibrary(): Promise<LibraryItem[]> {
  const [manifest, uploads] = await Promise.all([
    fetch('/media-manifest.json')
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .catch(() => ({ items: [] })),
    fetch('/api/media?limit=200&depth=0&sort=-createdAt', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { docs: [] }))
      .catch(() => ({ docs: [] })),
  ])
  const site: LibraryItem[] = (manifest.items ?? []).map((i: { path: string; name: string; folder: string }) => ({
    src: i.path,
    name: i.name,
    folder: i.folder || 'images',
  }))
  const uploaded: LibraryItem[] = (uploads.docs ?? [])
    .filter((d: { url?: string }) => d.url)
    .map((d: { url: string; filename?: string; alt?: string }) => ({
      src: d.url,
      name: d.alt || d.filename || d.url,
      folder: 'Μεταφορτώσεις',
    }))
  return [...uploaded, ...site]
}

export function ImageControl({ field, value, onChange, readOnly }: ControlProps<string>) {
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<LibraryItem[] | null>(null)
  const [query, setQuery] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const fileRef = React.useRef<HTMLInputElement>(null)

  const openLibrary = () => {
    setOpen(true)
    if (!items) loadLibrary().then(setItems)
  }

  const upload = async (file: File) => {
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('_payload', JSON.stringify({ alt: file.name.replace(/\.[^.]+$/, '') }))
      const res = await fetch('/api/media', { method: 'POST', body: form, credentials: 'include' })
      const json = await res.json()
      if (!res.ok || !json?.doc?.url) throw new Error(json?.errors?.[0]?.message || 'Η μεταφόρτωση απέτυχε')
      onChange(json.doc.url)
      setItems(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const shown = (items ?? []).filter(
    (i) => !query || `${i.name} ${i.folder} ${i.src}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <Label field={field}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={openLibrary}
          disabled={readOnly}
          className="size-16 shrink-0 overflow-hidden rounded-md border border-[#d9d9d9] bg-[#f5f5f5]"
          title="Επιλογή εικόνας"
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-[11px] text-[#767676]">Επιλογή</span>
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <input className={inputCls} value={value ?? ''} readOnly={readOnly} onChange={(e) => onChange(e.target.value)} />
          <div className="flex gap-1.5">
            <button type="button" onClick={openLibrary} disabled={readOnly} className="rounded-md border border-[#d9d9d9] bg-white px-2 py-1 text-[12px]">
              Βιβλιοθήκη
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={readOnly || busy}
              className="rounded-md border border-[#d9d9d9] bg-white px-2 py-1 text-[12px]"
            >
              {busy ? 'Μεταφόρτωση…' : 'Μεταφόρτωση'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) upload(f)
                e.target.value = ''
              }}
            />
          </div>
          {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-6" onClick={() => setOpen(false)}>
          <div className="flex max-h-full w-full max-w-[900px] flex-col gap-3 rounded-lg bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <input
                autoFocus
                className={inputCls}
                placeholder="Αναζήτηση εικόνας…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-[#d9d9d9] px-3 py-2 text-[13px]">
                Κλείσιμο
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5">
              {items === null ? (
                <p className="col-span-full p-6 text-center text-[13px] text-[#767676]">Φόρτωση…</p>
              ) : (
                shown.slice(0, 300).map((i) => (
                  <button
                    key={i.src}
                    type="button"
                    onClick={() => {
                      onChange(i.src)
                      setOpen(false)
                    }}
                    className={`flex flex-col gap-1 rounded-md border p-1 text-left ${i.src === value ? 'border-[#F1AC10]' : 'border-[#eee]'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.src} alt="" loading="lazy" className="aspect-square w-full rounded object-cover" />
                    <span className="truncate text-[11px] text-[#555]">{i.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Label>
  )
}
