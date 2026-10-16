'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { FieldLabel } from '@measured/puck'

/**
 * Custom inputs for the visual editor's generated fields (see derive.ts):
 * an image picker, a one-item-per-line list, and rich text written as
 * **bold** and [text](link). Each receives Puck's custom-field props.
 * The media library (loading, upload, modal) is shared with gallery-control.tsx.
 */

export type ControlProps<V> = {
  name: string
  value: V
  onChange: (value: V) => void
  readOnly?: boolean
  field: { label?: string }
}

export const inputCls =
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

export type LibraryItem = { src: string; name: string; folder: string; width?: number; height?: number; bytes?: number }

/** Folder name the library gives images uploaded through the admin. */
export const UPLOADS_FOLDER = 'Μεταφορτώσεις'

/** «1920×1080 · 245 KB» — whatever of the two is known. */
export function imageInfo(i: Pick<LibraryItem, 'width' | 'height' | 'bytes'>) {
  const size = i.width && i.height ? `${i.width}×${i.height}` : ''
  const kb = i.bytes ? (i.bytes >= 1024 * 1024 ? `${(i.bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(i.bytes / 1024))} KB`) : ''
  return [size, kb].filter(Boolean).join(' · ')
}

/** A path or URL without its query (the awards' `?v=` cache-busters), for telling images apart. */
export const baseSrc = (src: string | undefined | null) => (src ?? '').split(/[?#]/)[0]

/**
 * A thumbnail that fills its square, except for images far from square — a
 * logo or a banner is shown whole (`object-contain`) rather than cropped down
 * to an unrecognisable middle. `className` must not set the object fit.
 */
export function FitImage({ src, className = '' }: { src: string; className?: string }) {
  const [fit, setFit] = React.useState('object-cover')
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      draggable={false}
      onLoad={(e) => {
        const el = e.currentTarget
        const ratio = el.naturalHeight ? el.naturalWidth / el.naturalHeight : 1
        setFit(ratio > 1.6 || ratio < 0.625 ? 'object-contain' : 'object-cover')
      }}
      className={`${className} ${fit}`}
    />
  )
}

/** The site's images (public/media-manifest.json) and the admin's uploads (Payload media). */
export async function loadLibrary(): Promise<LibraryItem[]> {
  const [manifest, uploads] = await Promise.all([
    fetch('/media-manifest.json')
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .catch(() => ({ items: [] })),
    fetch('/api/media?limit=200&depth=0&sort=-createdAt', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { docs: [] }))
      .catch(() => ({ docs: [] })),
  ])
  const site: LibraryItem[] = (Array.isArray(manifest?.items) ? manifest.items : []).map(
    (i: { path: string; name: string; folder: string; width?: number; height?: number; bytes?: number }) => ({
      src: i.path,
      name: i.name,
      folder: i.folder || 'images',
      width: i.width,
      height: i.height,
      bytes: i.bytes,
    }),
  )
  const uploaded: LibraryItem[] = (Array.isArray(uploads?.docs) ? uploads.docs : [])
    .filter((d: { url?: string }) => d.url)
    .map((d: { url: string; filename?: string; alt?: string; width?: number; height?: number; filesize?: number }) => ({
      src: d.url,
      name: d.alt || d.filename || d.url,
      folder: UPLOADS_FOLDER,
      width: d.width ?? undefined,
      height: d.height ?? undefined,
      bytes: d.filesize ?? undefined,
    }))
  return [...uploaded, ...site]
}

// One library for every picker in the editor; fetched again after an upload or a minute.
let library: { at: number; promise: Promise<LibraryItem[]> } | null = null

export function getLibrary(): Promise<LibraryItem[]> {
  if (!library || Date.now() - library.at > 60_000) {
    // A failure is never cached, or every picker on the page would hang on it
    // for a whole minute; the next one that opens tries again.
    let entry: { at: number; promise: Promise<LibraryItem[]> }
    const promise = loadLibrary().catch((e) => {
      if (library === entry) library = null
      throw e
    })
    entry = { at: Date.now(), promise }
    library = entry
  }
  return library.promise
}

export function invalidateLibrary() {
  library = null
}

/** Upload one image to the media collection; resolves to its library entry. */
export async function uploadImage(file: File): Promise<LibraryItem> {
  const form = new FormData()
  form.append('file', file)
  // `alt` is required on Media — start from the file name.
  form.append('_payload', JSON.stringify({ alt: file.name.replace(/\.[^.]+$/, '') }))
  const res = await fetch('/api/media', { method: 'POST', body: form, credentials: 'include' })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.doc?.url) {
    if (res.status === 413) throw new Error('Το αρχείο είναι πολύ μεγάλο (όριο περίπου 4 MB)')
    throw new Error(json?.errors?.[0]?.message || 'Η μεταφόρτωση απέτυχε')
  }
  invalidateLibrary()
  const d = json.doc as { url: string; filename?: string; alt?: string; width?: number; height?: number; filesize?: number }
  return {
    src: d.url,
    name: d.alt || d.filename || d.url,
    folder: UPLOADS_FOLDER,
    width: d.width ?? undefined,
    height: d.height ?? undefined,
    bytes: d.filesize ?? undefined,
  }
}

const LIBRARY_LIMIT = 300

export type LibraryModalProps = {
  open: boolean
  onClose: () => void
  /** Tick several images and confirm, instead of picking one. */
  multiple?: boolean
  /** Single pick: the image in use, outlined. */
  current?: string
  /** Multiple: images already in the list, marked «Στη γκαλερί». */
  present?: string[]
  /** Offer «Μεταφόρτωση» inside the library (several files at once when `multiple`). */
  upload?: boolean
  title?: string
  onPick?: (item: LibraryItem) => void
  onConfirm?: (items: LibraryItem[]) => void
}

/** The media library: search, folders, dimensions and size; single or multiple pick. */
export function LibraryModal({ open, onClose, multiple, current, present, upload, title, onPick, onConfirm }: LibraryModalProps) {
  const [items, setItems] = React.useState<LibraryItem[] | null>(null)
  const [query, setQuery] = React.useState('')
  const [folder, setFolder] = React.useState('')
  const [selected, setSelected] = React.useState<LibraryItem[]>([])
  const [busy, setBusy] = React.useState('')
  const [errors, setErrors] = React.useState<string[]>([])
  const fileRef = React.useRef<HTMLInputElement>(null)
  const closeRef = React.useRef(onClose)
  closeRef.current = onClose

  React.useEffect(() => {
    if (!open) return
    let alive = true
    setSelected([])
    setErrors([])
    getLibrary().then(
      (list) => {
        if (alive) setItems(list)
      },
      () => {
        // Show the empty state and say why, rather than «Φόρτωση…» forever.
        if (!alive) return
        setItems([])
        setErrors(['Η βιβλιοθήκη εικόνων δεν φορτώθηκε — κλείστε και ανοίξτε την ξανά.'])
      },
    )
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      alive = false
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const folders = React.useMemo(() => [...new Set((items ?? []).map((i) => i.folder))], [items])
  const presentSet = React.useMemo(() => new Set((present ?? []).map(baseSrc)), [present])

  if (!open || typeof document === 'undefined') return null

  const q = query.trim().toLowerCase()
  const shown = (items ?? []).filter(
    (i) =>
      (!folder || i.folder === folder || i.folder.startsWith(`${folder}/`)) &&
      (!q || `${i.name} ${i.folder} ${i.src}`.toLowerCase().includes(q)),
  )

  const toggle = (i: LibraryItem) =>
    setSelected((s) => (s.some((x) => x.src === i.src) ? s.filter((x) => x.src !== i.src) : [...s, i]))

  const uploadFiles = async (files: File[]) => {
    const done: LibraryItem[] = []
    const errs: string[] = []
    setErrors([])
    for (const [n, f] of files.entries()) {
      setBusy(files.length > 1 ? `Μεταφόρτωση ${n + 1}/${files.length}…` : 'Μεταφόρτωση…')
      try {
        done.push(await uploadImage(f))
      } catch (e) {
        errs.push(`${f.name}: ${(e as Error).message}`)
      }
    }
    setBusy('')
    setErrors(errs)
    if (!done.length) return
    setItems((prev) => [...done, ...(prev ?? []).filter((i) => !done.some((d) => d.src === i.src))])
    setFolder('')
    setQuery('')
    if (multiple) {
      setSelected((s) => [...s, ...done])
    } else {
      onPick?.(done[0])
      onClose()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Βιβλιοθήκη εικόνων'}
        className="flex max-h-full w-full max-w-[900px] flex-col gap-3 rounded-lg bg-white p-4 text-[#1d1d1f]"
        onClick={(e) => e.stopPropagation()}
      >
        {title ? <p className="text-[14px] font-semibold">{title}</p> : null}
        <div className="flex flex-wrap items-center gap-2">
          <input
            autoFocus
            className={`${inputCls} min-w-[160px] flex-1`}
            placeholder="Αναζήτηση εικόνας…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {folders.length > 1 ? (
            <select className={`${inputCls} w-auto max-w-[220px]`} value={folder} onChange={(e) => setFolder(e.target.value)}>
              <option value="">Όλοι οι φάκελοι</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          ) : null}
          {upload ? (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={!!busy}
                className="rounded-md border border-[#d9d9d9] px-3 py-2 text-[13px] disabled:opacity-60"
              >
                {busy || 'Μεταφόρτωση'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                hidden
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  e.target.value = ''
                  if (files.length) uploadFiles(files)
                }}
              />
            </>
          ) : null}
          <button type="button" onClick={onClose} className="rounded-md border border-[#d9d9d9] px-3 py-2 text-[13px]">
            Κλείσιμο
          </button>
        </div>
        {errors.length ? (
          <ul className="flex flex-col gap-0.5 text-[11px] text-red-600">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : null}
        <div className="grid grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5">
          {items === null ? (
            <p className="col-span-full p-6 text-center text-[13px] text-[#767676]">Φόρτωση…</p>
          ) : shown.length === 0 ? (
            <p className="col-span-full p-6 text-center text-[13px] text-[#767676]">Δεν βρέθηκαν εικόνες.</p>
          ) : (
            shown.slice(0, LIBRARY_LIMIT).map((i) => {
              const order = multiple ? selected.findIndex((s) => s.src === i.src) : -1
              const isCurrent = !multiple && !!current && baseSrc(i.src) === baseSrc(current)
              const inList = !!multiple && presentSet.has(baseSrc(i.src))
              return (
                <button
                  key={i.src}
                  type="button"
                  aria-pressed={multiple ? order >= 0 : undefined}
                  onClick={() => {
                    if (multiple) return toggle(i)
                    onPick?.(i)
                    onClose()
                  }}
                  className={`relative flex flex-col gap-1 rounded-md border p-1 text-left ${
                    order >= 0 ? 'border-[#F1AC10] ring-2 ring-[#F1AC10]' : isCurrent ? 'border-[#F1AC10]' : 'border-[#eee]'
                  }`}
                >
                  <FitImage key={i.src} src={i.src} className="aspect-square w-full rounded bg-[#f5f5f5]" />
                  {multiple ? (
                    <span
                      className={`absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border-2 text-[12px] font-semibold ${
                        order >= 0 ? 'border-[#F1AC10] bg-[#F1AC10] text-white' : 'border-white bg-black/25 text-transparent'
                      }`}
                    >
                      {order >= 0 ? order + 1 : ''}
                    </span>
                  ) : null}
                  {inList ? (
                    <span className="absolute left-2 top-2 rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white">Στη γκαλερί</span>
                  ) : null}
                  <span className="truncate text-[11px] text-[#555]">{i.name}</span>
                  {imageInfo(i) ? <span className="truncate text-[10px] text-[#8a8a8a]">{imageInfo(i)}</span> : null}
                </button>
              )
            })
          )}
        </div>
        {shown.length > LIBRARY_LIMIT ? (
          <p className="text-[11px] text-[#767676]">
            Εμφανίζονται {LIBRARY_LIMIT} από {shown.length} — περιορίστε με αναζήτηση ή φάκελο.
          </p>
        ) : null}
        {multiple ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eee] pt-3">
            <span className="text-[12px] text-[#555]">
              {selected.length ? `Επιλεγμένες: ${selected.length}` : 'Κάντε κλικ στις εικόνες για να τις επιλέξετε.'}
            </span>
            <div className="flex gap-2">
              {selected.length ? (
                <button type="button" onClick={() => setSelected([])} className="rounded-md border border-[#d9d9d9] px-3 py-2 text-[13px]">
                  Αποεπιλογή
                </button>
              ) : null}
              <button
                type="button"
                disabled={!selected.length || !!busy}
                onClick={() => {
                  onConfirm?.(selected)
                  onClose()
                }}
                className="rounded-md bg-[#F1AC10] px-3 py-2 text-[13px] font-semibold text-white disabled:opacity-40"
              >
                Προσθήκη ({selected.length})
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export function ImageControl({ field, value, onChange, readOnly }: ControlProps<string>) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const fileRef = React.useRef<HTMLInputElement>(null)

  const openLibrary = () => setOpen(true)

  const upload = async (file: File) => {
    setBusy(true)
    setError('')
    try {
      onChange((await uploadImage(file)).src)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

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
            <FitImage key={value} src={value} className="size-full" />
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
      <LibraryModal open={open} current={value} onPick={(i) => onChange(i.src)} onClose={() => setOpen(false)} />
    </Label>
  )
}
