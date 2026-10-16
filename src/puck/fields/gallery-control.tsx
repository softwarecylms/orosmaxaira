'use client'

import * as React from 'react'
import { FieldLabel } from '@measured/puck'
import {
  FitImage,
  baseSrc,
  inputCls,
  LibraryModal,
  UPLOADS_FOLDER,
  uploadImage,
  type LibraryItem,
} from './controls'

/**
 * An image gallery field for the visual editor, in the manner of Elementor's
 * Image Gallery: every image as a thumbnail in one field, several added at once
 * from the media library (or uploaded), drag to reorder, × to remove, click a
 * thumbnail to replace it or edit its text. derive.ts routes lists to it whose
 * items are just an image plus alt/caption/size keys (see `galleryShape`).
 *
 * The stored shape never changes: new items copy the keys the list already has
 * (`{ src, w, h }` for awards, `{ src, alt }` for adopt), existing items keep any
 * extra keys, and every edit hands Puck a new array.
 */

type Obj = Record<string, unknown>
type Item = Obj | string

export type GalleryFieldConfig = {
  label?: string
  /** The key holding each item's image path (`src`, `image`…). */
  imageKey?: string
  /** The other keys an item carries (`alt`, `w`, `h`…), taken from the section's default copy. */
  metaKeys?: string[]
  /** A list of plain image paths rather than objects. */
  stringItems?: boolean
}

type GalleryProps = {
  name: string
  value: Item[] | null | undefined
  onChange: (value: Item[]) => void
  readOnly?: boolean
  field: GalleryFieldConfig
}

const WIDTH_KEYS = new Set(['w', 'width'])
const HEIGHT_KEYS = new Set(['h', 'height'])
const isSizeKey = (k: string) => WIDTH_KEYS.has(k) || HEIGHT_KEYS.has(k)
const TEXT_KEYS: Record<string, string> = {
  alt: 'Εναλλακτικό κείμενο (alt)',
  caption: 'Λεζάντα',
  title: 'Τίτλος',
}
const DRAG_TYPE = 'application/x-oros-gallery'
const SIZE_FAILED = 'Οι διαστάσεις δεν διαβάστηκαν — συμπληρώστε τες στα πεδία «Πλάτος» και «Ύψος».'

const btnCls =
  'rounded-md border border-[#d9d9d9] bg-white px-2 py-1 text-[12px] text-[#1d1d1f] hover:border-[#F1AC10] disabled:opacity-50'
const tileBtnCls =
  'flex size-5 items-center justify-center rounded bg-black/65 text-[12px] leading-none text-white hover:bg-black/85 disabled:opacity-30'
/** Hover for the mouse, focus-within for the keyboard *and* for a tap — a touch
 *  device has no hover, and `:focus-visible` never matches a tapped button. */
const revealCls = 'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100'

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

const countLabel = (n: number) => (n === 0 ? 'Καμία εικόνα' : n === 1 ? '1 εικόνα' : `${n} εικόνες`)

const fileName = (src: string) => decodeURIComponent(baseSrc(src).split('/').pop() || src)

const newId = () => Math.random().toString(36).slice(2, 10)

const srcOfItem = (it: Item | undefined, imageKey: string) =>
  typeof it === 'string' ? it : isObj(it) && typeof it[imageKey] === 'string' ? (it[imageKey] as string) : ''

let idSeq = 0

/**
 * A stable id per row, so a reorder moves the tile's DOM node (and the focus
 * inside it) with its image instead of leaving it behind at a fixed position.
 * Rows are matched to the previous render by identity, then by image path, then
 * — when the list is the same length — by position, so an item edited in place
 * keeps its id and the open editor stays open. Only a genuinely new row gets a
 * fresh id.
 */
function useStableIds(items: Item[], imageKey: string): string[] {
  const prev = React.useRef<{ items: Item[]; ids: string[] }>({ items: [], ids: [] })
  return React.useMemo(() => {
    const p = prev.current
    if (p.items === items) return p.ids
    const used = new Set<number>()
    const ids: string[] = new Array(items.length).fill('')
    const claim = (i: number, j: number) => {
      used.add(j)
      ids[i] = p.ids[j]
    }
    items.forEach((it, i) => {
      const j = p.items.findIndex((q, k) => q === it && !used.has(k))
      if (j >= 0) claim(i, j)
    })
    items.forEach((it, i) => {
      if (ids[i]) return
      const s = srcOfItem(it, imageKey)
      const j = p.items.findIndex((q, k) => !used.has(k) && srcOfItem(q, imageKey) === s)
      if (j >= 0) claim(i, j)
    })
    // Same length, slot still free: the row was edited in place, not replaced.
    if (items.length === p.items.length) {
      items.forEach((_, i) => {
        if (!ids[i] && !used.has(i)) claim(i, i)
      })
    }
    items.forEach((_, i) => {
      if (!ids[i]) ids[i] = `g${++idSeq}`
    })
    prev.current = { items, ids }
    return ids
  }, [items, imageKey])
}

/** Natural size of an image, by loading it; null if it fails or takes too long. */
function measure(src: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const timer = setTimeout(() => resolve(null), 8000)
    img.onload = () => {
      clearTimeout(timer)
      resolve(img.naturalWidth ? { width: img.naturalWidth, height: img.naturalHeight } : null)
    }
    img.onerror = () => {
      clearTimeout(timer)
      resolve(null)
    }
    img.src = src
  })
}

const sizeOf = (i: LibraryItem) =>
  i.width && i.height ? Promise.resolve({ width: i.width, height: i.height }) : measure(i.src)

/** A starting alt text: an upload's own alt, or a file name that has words in it (not «03.webp»). */
function altFor(i: LibraryItem) {
  if (i.folder === UPLOADS_FOLDER) return i.name
  const stem = fileName(i.src)
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim()
  return /\p{L}{2,}/u.test(stem) && !/^(img|dsc|image|photo|screenshot)\s*\d/i.test(stem) ? stem : ''
}

export function GalleryControl({ field, value, onChange, readOnly }: GalleryProps) {
  const items = React.useMemo<Item[]>(() => (Array.isArray(value) ? value : []), [value])
  const imageKey = field.imageKey ?? 'src'
  const stringItems = !!field.stringItems
  const ids = useStableIds(items, imageKey)
  // Uploads and size checks finish later — they build on the list as it is by then.
  const latest = React.useRef({ items, ids })
  latest.current = { items, ids }

  const srcOf = (it: Item | undefined) => srcOfItem(it, imageKey)

  const [picker, setPicker] = React.useState<{ mode: 'add' } | { mode: 'replace'; id: string } | null>(null)
  // The open editor and the picker follow the image by id, not by position.
  const [editing, setEditing] = React.useState<string | null>(null)
  const [dragFrom, setDragFrom] = React.useState<number | null>(null)
  const [over, setOver] = React.useState<{ index: number; after: boolean } | null>(null)
  const [fileOver, setFileOver] = React.useState(false)
  const [busy, setBusy] = React.useState('')
  const [error, setError] = React.useState('')
  const [natural, setNatural] = React.useState('')

  const rootRef = React.useRef<HTMLDivElement>(null)
  // After a keyboard move: put the focus back on the button that made it, which
  // now sits one tile further along with the image it moved.
  const refocus = React.useRef<{ id: string; dir: 'prev' | 'next' } | null>(null)
  React.useEffect(() => {
    const want = refocus.current
    if (!want) return
    refocus.current = null
    const tile = rootRef.current?.querySelector<HTMLElement>(`[data-tile-id="${want.id}"]`)
    const btn = tile?.querySelector<HTMLButtonElement>(`button[data-move="${want.dir}"]`)
    if (btn && !btn.disabled) btn.focus()
    else tile?.querySelector<HTMLButtonElement>('button[data-open]')?.focus()
  })

  const editIndex = editing ? ids.indexOf(editing) : -1
  const current = editIndex >= 0 ? items[editIndex] : undefined
  const currentSrc = srcOf(current)

  // The measured size of the open image; cleared when the image changes.
  React.useEffect(() => setNatural(''), [currentSrc])

  // --- edits (always a new array) ---

  /** A new item in the shape of the list: image, then the other keys blank or measured. */
  const makeItem = async (lib: LibraryItem, failed: string[]): Promise<Item> => {
    if (stringItems) return lib.src
    const keys = new Set(field.metaKeys ?? [])
    for (const it of latest.current.items) if (isObj(it)) for (const k of Object.keys(it)) if (k !== imageKey) keys.add(k)
    const sample = latest.current.items.find(isObj)
    const needsSize = [...keys].some(isSizeKey)
    const size = needsSize ? await sizeOf(lib) : null
    if (needsSize && !size) failed.push(fileName(lib.src))
    const next: Obj = { [imageKey]: lib.src }
    for (const k of keys) {
      if (k === '_id') next[k] = newId()
      else if (WIDTH_KEYS.has(k)) next[k] = size?.width ?? 0
      else if (HEIGHT_KEYS.has(k)) next[k] = size?.height ?? 0
      else if (k === 'alt') next[k] = altFor(lib)
      else {
        const s = sample?.[k]
        next[k] = typeof s === 'number' ? 0 : typeof s === 'boolean' ? false : Array.isArray(s) ? [] : ''
      }
    }
    return next
  }

  /** `notes`: messages from an upload that ran first, kept alongside ours. */
  const add = async (libs: LibraryItem[], notes: string[] = []) => {
    if (!libs.length) {
      setError(notes.join(' · '))
      return
    }
    setBusy('Προσθήκη…')
    const failed: string[] = []
    try {
      const made = await Promise.all(libs.map((l) => makeItem(l, failed)))
      onChange([...latest.current.items, ...made])
    } finally {
      setBusy('')
    }
    // Say so rather than store a silent 0×0 — the size is editable below.
    if (failed.length) notes.push(`${SIZE_FAILED} (${failed.join(', ')})`)
    setError(notes.join(' · '))
  }

  const replace = async (id: string, lib: LibraryItem) => {
    const before = latest.current
    const start = before.ids.indexOf(id)
    const cur = start >= 0 ? before.items[start] : undefined
    if (cur === undefined) return
    const needsSize = isObj(cur) && Object.keys(cur).some(isSizeKey)
    const size = needsSize ? await sizeOf(lib) : null
    const { items: now, ids: nowIds } = latest.current
    const i = nowIds.indexOf(id)
    if (i < 0) return
    const row = now[i]
    let updated: Item = lib.src
    if (isObj(row)) {
      const next: Obj = { ...row, [imageKey]: lib.src }
      // Never leave the previous image's dimensions on the new one.
      for (const k of Object.keys(row)) {
        if (WIDTH_KEYS.has(k)) next[k] = size?.width ?? 0
        if (HEIGHT_KEYS.has(k)) next[k] = size?.height ?? 0
      }
      updated = next
    }
    setError(needsSize && !size ? SIZE_FAILED : '')
    onChange(now.map((x, n) => (n === i ? updated : x)))
  }

  /** After a hand-typed path: the stored w/h must describe the image it names. */
  const remeasure = async (id: string, path: string) => {
    const start = latest.current.ids.indexOf(id)
    const item = start >= 0 ? latest.current.items[start] : undefined
    if (!isObj(item) || !path.trim()) return
    const keys = Object.keys(item).filter(isSizeKey)
    if (!keys.length) return
    const size = await measure(path)
    const { items: now, ids: nowIds } = latest.current
    const i = nowIds.indexOf(id)
    const row = i >= 0 ? now[i] : undefined
    if (!isObj(row) || row[imageKey] !== path) return
    if (!size) {
      setError(SIZE_FAILED)
      return
    }
    setError('')
    const next: Obj = { ...row }
    let changed = false
    for (const k of keys) {
      const v = WIDTH_KEYS.has(k) ? size.width : size.height
      if (next[k] !== v) {
        next[k] = v
        changed = true
      }
    }
    if (!changed) return
    onChange(now.map((x, n) => (n === i ? next : x)))
  }

  const remove = (index: number) => {
    const { items: now, ids: nowIds } = latest.current
    if (nowIds[index] === editing) setEditing(null)
    onChange(now.filter((_, n) => n !== index))
  }

  const move = (from: number, to: number, focusDir?: 'prev' | 'next') => {
    const { items: list, ids: nowIds } = latest.current
    if (from === to || to < 0 || to >= list.length || from < 0 || from >= list.length) return
    const next = [...list]
    const [it] = next.splice(from, 1)
    next.splice(to, 0, it)
    if (focusDir) refocus.current = { id: nowIds[from], dir: focusDir }
    onChange(next)
  }

  const patch = (index: number, key: string, v: unknown) =>
    onChange(
      latest.current.items.map((x, n) => {
        if (n !== index) return x
        if (typeof x === 'string') return key === imageKey && typeof v === 'string' ? v : x
        return { ...x, [key]: v }
      }),
    )

  const clear = () => {
    const n = latest.current.items.length
    const ok = window.confirm(n === 1 ? 'Να αφαιρεθεί η εικόνα από τη γκαλερί;' : `Να αφαιρεθούν και οι ${n} εικόνες από τη γκαλερί;`)
    if (!ok) return
    onChange([])
    setEditing(null)
  }

  const uploadAndAdd = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith('image/'))
    const skipped = files.length - images.length
    // Say so — a dropped PDF used to flash the highlight and do nothing at all.
    const notice = skipped
      ? skipped === 1
        ? 'Αγνοήθηκε 1 αρχείο που δεν είναι εικόνα.'
        : `Αγνοήθηκαν ${skipped} αρχεία που δεν είναι εικόνες.`
      : ''
    setError(notice)
    if (!images.length) {
      if (!notice) setError('Δεν βρέθηκε εικόνα στα αρχεία που αφήσατε.')
      return
    }
    const done: LibraryItem[] = []
    const errs: string[] = []
    for (const [n, f] of images.entries()) {
      setBusy(`Μεταφόρτωση ${n + 1}/${images.length}…`)
      try {
        done.push(await uploadImage(f))
      } catch (e) {
        errs.push(`${f.name}: ${(e as Error).message}`)
      }
    }
    setBusy('')
    await add(done, [notice, ...errs].filter(Boolean))
  }

  // --- drag and drop: tiles reorder; files dropped from the computer upload ---

  const sideOf = (e: React.DragEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return e.clientX > r.left + r.width / 2
  }
  const endDrag = () => {
    setDragFrom(null)
    setOver(null)
  }
  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes('Files')

  const tileDrag = (i: number) => ({
    draggable: !readOnly,
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => {
      if (readOnly) return
      e.stopPropagation()
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData(DRAG_TYPE, String(i))
      setDragFrom(i)
    },
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      if (dragFrom === null) return
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'move'
      const after = sideOf(e)
      if (over?.index !== i || over.after !== after) setOver({ index: i, after })
    },
    onDrop: (e: React.DragEvent<HTMLDivElement>) => {
      if (dragFrom === null) return
      e.preventDefault()
      e.stopPropagation()
      const at = sideOf(e) ? i + 1 : i
      move(dragFrom, at > dragFrom ? at - 1 : at)
      endDrag()
    },
    onDragEnd: endDrag,
  })

  // The marker is hidden where dropping would change nothing.
  const showMarker = (i: number) => {
    if (dragFrom === null || over?.index !== i) return false
    const at = over.after ? i + 1 : i
    return at !== dragFrom && at !== dragFrom + 1
  }

  const textKeys = isObj(current)
    ? Object.keys(TEXT_KEYS).filter((k) => k in current || (field.metaKeys ?? []).includes(k))
    : []
  const sizeKeys = isObj(current) ? Object.keys(current).filter(isSizeKey) : []
  const sizeMissing = isObj(current) && sizeKeys.some((k) => !(typeof current[k] === 'number' && (current[k] as number) > 0))

  return (
    <FieldLabel label={field.label ?? ''} el="div" readOnly={readOnly}>
      <div
        ref={rootRef}
        data-gallery-field=""
        className={`flex flex-col gap-2 rounded-md ${fileOver ? 'outline-2 outline-offset-2 outline-dashed outline-[#F1AC10]' : ''}`}
        onDragOver={(e) => {
          if (readOnly || dragFrom !== null || !hasFiles(e)) return
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
          if (!fileOver) setFileOver(true)
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFileOver(false)
        }}
        onDrop={(e) => {
          if (readOnly || dragFrom !== null || !hasFiles(e)) return
          e.preventDefault()
          setFileOver(false)
          uploadAndAdd(Array.from(e.dataTransfer.files))
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className="text-[12px] text-[#555]" aria-live="polite">
            {countLabel(items.length)}
          </span>
          {!readOnly ? (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPicker({ mode: 'add' })}
                className="rounded-md border border-[#F1AC10] bg-[#F1AC10] px-2 py-1 text-[12px] font-semibold text-white hover:bg-[#dc9c0c]"
              >
                + Προσθήκη εικόνων
              </button>
              {items.length ? (
                <button type="button" onClick={clear} className={btnCls}>
                  Καθαρισμός
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {items.length === 0 ? (
          <button
            type="button"
            disabled={readOnly}
            onClick={() => setPicker({ mode: 'add' })}
            className="flex min-h-24 w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[#d9d9d9] bg-[#fafafa] p-4 text-center text-[12px] text-[#767676] hover:border-[#F1AC10]"
          >
            <span>Δεν υπάρχουν εικόνες — Προσθήκη εικόνων</span>
            {!readOnly ? <span className="text-[11px]">ή σύρετε αρχεία εικόνων εδώ</span> : null}
          </button>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-1.5">
            {items.map((it, i) => {
              const src = srcOf(it)
              const alt = isObj(it) && typeof it.alt === 'string' ? it.alt : ''
              const id = ids[i]
              return (
                <div
                  // A stable id, not the position: a reorder must move the tile's
                  // DOM node — and the focus inside it — with its image.
                  key={id}
                  data-tile-id={id}
                  data-gallery-tile={i}
                  className={`group relative aspect-square ${dragFrom === i ? 'opacity-40' : ''}`}
                  {...tileDrag(i)}
                >
                  <button
                    type="button"
                    data-open=""
                    onClick={() => setEditing(editing === id ? null : id)}
                    title="Επεξεργασία εικόνας"
                    aria-label={`Εικόνα ${i + 1}${alt ? `: ${alt}` : ''} — επεξεργασία`}
                    aria-expanded={editing === id}
                    className={`flex size-full items-center justify-center overflow-hidden rounded-md border bg-[#f5f5f5] ${
                      editing === id ? 'border-[#F1AC10] ring-2 ring-[#F1AC10]' : 'border-[#d9d9d9] hover:border-[#F1AC10]'
                    }`}
                  >
                    {src ? (
                      <FitImage key={src} src={src} className="pointer-events-none size-full" />
                    ) : (
                      <span className="text-[10px] text-[#767676]">Χωρίς εικόνα</span>
                    )}
                  </button>
                  {!readOnly ? (
                    <>
                      <span
                        aria-hidden="true"
                        title="Σύρετε για αλλαγή σειράς"
                        className={`absolute left-1 top-1 flex size-5 cursor-grab items-center justify-center rounded bg-black/65 text-[11px] leading-none text-white ${revealCls}`}
                      >
                        ⠿
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        title="Αφαίρεση"
                        aria-label={`Αφαίρεση εικόνας ${i + 1}`}
                        className={`${tileBtnCls} absolute right-1 top-1 rounded-full text-[14px] hover:bg-red-600 ${revealCls}`}
                      >
                        ×
                      </button>
                      {/* Reorder without dragging — the only way on a touch
                          screen, where HTML5 drag events never fire. */}
                      <div
                        className={`pointer-events-none absolute inset-x-1 bottom-1 flex justify-between ${revealCls} group-hover:pointer-events-auto group-focus-within:pointer-events-auto`}
                      >
                        <button
                          type="button"
                          data-move="prev"
                          disabled={i === 0}
                          onClick={() => move(i, i - 1, 'prev')}
                          aria-label={`Μετακίνηση εικόνας ${i + 1} αριστερά`}
                          className={tileBtnCls}
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          data-move="next"
                          disabled={i === items.length - 1}
                          onClick={() => move(i, i + 1, 'next')}
                          aria-label={`Μετακίνηση εικόνας ${i + 1} δεξιά`}
                          className={tileBtnCls}
                        >
                          →
                        </button>
                      </div>
                    </>
                  ) : null}
                  {showMarker(i) ? (
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-y-0 w-[3px] rounded bg-[#F1AC10] ${over?.after ? '-right-[4.5px]' : '-left-[4.5px]'}`}
                    />
                  ) : null}
                </div>
              )
            })}
          </div>
        )}

        {items.length > 1 && !readOnly ? (
          <p className="text-[11px] text-[#767676]">
            Σύρετε ή χρησιμοποιήστε τα ← → για αλλαγή σειράς · κλικ σε εικόνα για επεξεργασία.
          </p>
        ) : null}
        {busy ? <p className="text-[11px] text-[#555]">{busy}</p> : null}
        {error ? <p className="text-[11px] text-red-600">{error}</p> : null}

        {editIndex >= 0 && current !== undefined ? (
          <div className="flex flex-col gap-2 rounded-md border border-[#F1AC10] bg-[#fffaf0] p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-[#1d1d1f]">
                Εικόνα {editIndex + 1} από {items.length}
              </span>
              <button type="button" onClick={() => setEditing(null)} aria-label="Κλείσιμο" className="px-1 text-[16px] leading-none text-[#555]">
                ×
              </button>
            </div>
            <div className="flex gap-2">
              {currentSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentSrc}
                  alt=""
                  className="size-20 shrink-0 rounded border border-[#d9d9d9] bg-white object-contain"
                  onLoad={(e) => setNatural(`${e.currentTarget.naturalWidth}×${e.currentTarget.naturalHeight}`)}
                />
              ) : (
                <div className="size-20 shrink-0 rounded border border-[#d9d9d9] bg-white" />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-[11px] text-[#555]" title={currentSrc}>
                  {currentSrc ? fileName(currentSrc) : '—'}
                </span>
                {natural ? <span className="text-[11px] text-[#8a8a8a]">{natural}</span> : null}
                {!readOnly ? (
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => setPicker({ mode: 'replace', id: ids[editIndex] })} className={btnCls}>
                      Αντικατάσταση
                    </button>
                    <button type="button" onClick={() => remove(editIndex)} className={`${btnCls} text-red-600`}>
                      Αφαίρεση
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            {textKeys.map((k) => (
              <label key={k} className="flex flex-col gap-1 text-[11px] text-[#555]">
                {TEXT_KEYS[k]}
                <input
                  className={inputCls}
                  value={isObj(current) && typeof current[k] === 'string' ? (current[k] as string) : ''}
                  readOnly={readOnly}
                  onChange={(e) => patch(editIndex, k, e.target.value)}
                />
              </label>
            ))}
            {/* Editable, not read-only: an image whose size could not be read is
                stored as 0 and has to be correctable by hand. */}
            {sizeKeys.length ? (
              <div className="flex gap-2">
                {sizeKeys.map((k) => (
                  <label key={k} className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-[#555]">
                    {WIDTH_KEYS.has(k) ? 'Πλάτος (px)' : 'Ύψος (px)'}
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      value={isObj(current) && typeof current[k] === 'number' ? (current[k] as number) : 0}
                      readOnly={readOnly}
                      onChange={(e) => patch(editIndex, k, Math.max(0, Math.round(Number(e.target.value) || 0)))}
                    />
                  </label>
                ))}
              </div>
            ) : null}
            {sizeKeys.length && sizeMissing ? (
              <p className="text-[11px] text-[#767676]">{natural ? `Πραγματικές διαστάσεις: ${natural}.` : SIZE_FAILED}</p>
            ) : null}
            <label className="flex flex-col gap-1 text-[11px] text-[#555]">
              Διαδρομή εικόνας
              <input
                className={inputCls}
                value={currentSrc}
                readOnly={readOnly}
                onChange={(e) => patch(editIndex, imageKey, e.target.value)}
                onBlur={(e) => {
                  if (!readOnly && editing) void remeasure(editing, e.target.value)
                }}
              />
            </label>
            <button type="button" onClick={() => setEditing(null)} className={`${btnCls} self-end`}>
              Κλείσιμο
            </button>
          </div>
        ) : null}
      </div>

      {picker?.mode === 'add' ? (
        <LibraryModal
          open
          multiple
          upload
          title="Προσθήκη εικόνων"
          present={items.map(srcOf)}
          onConfirm={add}
          onClose={() => setPicker(null)}
        />
      ) : null}
      {picker?.mode === 'replace' ? (
        <LibraryModal
          open
          upload
          title="Αντικατάσταση εικόνας"
          current={srcOf(items[ids.indexOf(picker.id)])}
          onPick={(lib) => replace(picker.id, lib)}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </FieldLabel>
  )
}
