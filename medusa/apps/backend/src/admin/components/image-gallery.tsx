import { useMemo, useRef, useState, type CSSProperties, type DragEvent } from "react"
import { createPortal } from "react-dom"
import { Button, IconButton, Input, Label, Text, clx, usePrompt } from "@medusajs/ui"
import {
  ArrowLeftMini,
  ArrowPath,
  ArrowRightMini,
  ArrowUpTray,
  DotsSix,
  ExclamationCircle,
  Photo,
  Plus,
  Spinner,
  Trash,
  XMark,
  XMarkMini,
} from "@medusajs/icons"
// NOTE: @dnd-kit/* is not declared in apps/backend/package.json — it resolves
// because npm hoists it from @medusajs/dashboard, which depends on the same
// three packages. Declare them there (a change that may touch package.json)
// before the dashboard ever drops them.
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useLibrary } from "../lib/storefront"
import {
  LibraryModal,
  fileNameOf,
  imageInfo,
  measureImage,
  previewSrc,
  uploadImage,
  type PickedImage,
} from "./image-picker"

/**
 * Gallery editor, modelled on Elementor's «Image Gallery» control.
 *
 *  - One field: a grid of square thumbnails with the image count.
 *  - «Προσθήκη εικόνων» opens the library with multi-select (and upload); the
 *    choice is appended in the order it was made. Files dropped from the
 *    computer onto the field are uploaded and appended too.
 *  - Drag a thumbnail to reorder (the dashed slot shows where it lands). From
 *    the keyboard: the ⠿ handle + Space/arrows, or the ← → buttons on focus.
 *  - × removes one image; «Καθαρισμός» empties the gallery after a confirm.
 *  - Click a thumbnail to edit it below the grid: replace, alt text (and
 *    caption/title when the items carry them).
 *
 * The stored shape is unchanged — `{ url, alt }[]` — and unknown keys on
 * existing items are kept as they are.
 */

export type GalleryItem = { url: string; alt?: string } & Record<string, unknown>

const EMPTY: GalleryItem[] = []

/** Optional text keys an item shape may carry, editable when present. */
const TEXT_KEYS = [
  { key: "caption", label: "Λεζάντα" },
  { key: "title", label: "Τίτλος" },
] as const

/** Intrinsic-size key pairs — filled for new items only if the list already uses them. */
const SIZE_KEYS = [
  ["w", "h"],
  ["width", "height"],
] as const

let idSeq = 0

/**
 * Stable ids for rows that have none, so drag-and-drop and the open editor
 * follow an image when the array is reordered. Rows are matched to the previous
 * render in three passes: identity (untouched rows keep their object), then
 * url, then — when the list is the same length — position, so a row edited in
 * place (a typed url, a replaced image) keeps its id and the open editor stays
 * open. Only a genuinely new row gets a fresh id.
 */
function useStableIds(rows: GalleryItem[]): string[] {
  const prev = useRef<{ rows: GalleryItem[]; ids: string[] }>({ rows: [], ids: [] })
  return useMemo(() => {
    const p = prev.current
    if (p.rows === rows) return p.ids
    const used = new Set<number>()
    const ids: string[] = new Array(rows.length).fill("")
    const claim = (i: number, j: number) => {
      used.add(j)
      ids[i] = p.ids[j]
    }
    rows.forEach((r, i) => {
      const j = p.rows.findIndex((q, k) => q === r && !used.has(k))
      if (j >= 0) claim(i, j)
    })
    rows.forEach((r, i) => {
      if (ids[i]) return
      const j = p.rows.findIndex((q, k) => !used.has(k) && q.url === r.url)
      if (j >= 0) claim(i, j)
    })
    // Same length, slot still free: the row was edited in place, not replaced.
    if (rows.length === p.rows.length) {
      rows.forEach((_, i) => {
        if (!ids[i] && !used.has(i)) claim(i, i)
      })
    }
    rows.forEach((_, i) => {
      if (!ids[i]) ids[i] = `img-${++idSeq}`
    })
    prev.current = { rows, ids }
    return ids
  }, [rows])
}

const countLabel = (n: number) => `${n} ${n === 1 ? "εικόνα" : "εικόνες"}`

export function ImageGallery({
  label,
  value,
  onChange,
}: {
  label: string
  value: GalleryItem[] | null | undefined
  onChange: (next: GalleryItem[]) => void
}) {
  const rows = Array.isArray(value) ? value : EMPTY
  const ids = useStableIds(rows)
  const lib = useLibrary()
  const origin = lib?.origin ?? ""
  const prompt = usePrompt()

  // Uploads and size measuring are async — by the time they finish the editor
  // may have re-rendered (reorders, typing, a language switch). Those writes go
  // through the latest props, never a stale closure.
  const latest = useRef({ rows, ids, onChange })
  latest.current = { rows, ids, onChange }

  // library modal: "add" = multi-select append; "replace" = swap the edited image
  const [modal, setModal] = useState<"add" | "replace" | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const editIndex = editing ? ids.indexOf(editing) : -1
  const editRow = editIndex >= 0 ? rows[editIndex] : null

  // item shape of the existing list
  const textKeys = TEXT_KEYS.filter(({ key }) => rows.some((r) => key in r))
  const sizeKeys = SIZE_KEYS.find(([a, b]) => rows.some((r) => a in r || b in r)) ?? null

  // A site path needs the storefront origin — wait for it, or the browser asks
  // the admin's own origin for `/images/...` and gets a 404.
  const src = (u: unknown) => {
    const v = String(u ?? "").trim()
    return !origin && !/^https?:\/\//i.test(v) ? "" : previewSrc(v, origin)
  }

  // ── mutations (always a new array) ──
  const patch = (i: number, p: Record<string, unknown>) =>
    onChange(rows.map((r, j) => (j === i ? ({ ...r, ...p } as GalleryItem) : r)))

  const remove = (i: number) => {
    if (ids[i] === editing) setEditing(null)
    onChange(rows.filter((_, j) => j !== i))
  }

  const move = (i: number, to: number) => {
    if (to < 0 || to >= rows.length || to === i) return
    onChange(arrayMove(rows, i, to))
  }

  /** Size fields for an image, when this list stores them. */
  const sizeFor = async (img: PickedImage): Promise<Record<string, unknown>> => {
    if (!sizeKeys) return {}
    let { width, height } = img
    if (!width || !height) {
      const m = await measureImage(src(img.path))
      width = m.width
      height = m.height
    }
    return { [sizeKeys[0]]: width ?? 0, [sizeKeys[1]]: height ?? 0 }
  }

  /** After a hand-typed url: the stored size must describe the image it names. */
  const remeasure = async (id: string, url: string) => {
    if (!sizeKeys || !url.trim()) return
    const m = await measureImage(src(url))
    if (!m.width || !m.height) return // unreachable/slow image: leave it to «Αντικατάσταση»
    const { rows: now, ids: nowIds, onChange: emit } = latest.current
    const i = nowIds.indexOf(id)
    const row = i >= 0 ? now[i] : null
    if (!row || String(row.url ?? "") !== url) return
    if (row[sizeKeys[0]] === m.width && row[sizeKeys[1]] === m.height) return
    emit(
      now.map((r, j) =>
        j === i ? ({ ...r, [sizeKeys[0]]: m.width, [sizeKeys[1]]: m.height } as GalleryItem) : r,
      ),
    )
  }

  const newItem = async (img: PickedImage): Promise<GalleryItem> => {
    const item: GalleryItem = { url: img.path, alt: "" }
    for (const { key } of textKeys) item[key] = ""
    return { ...item, ...(await sizeFor(img)) }
  }

  const append = async (imgs: PickedImage[]) => {
    if (!imgs.length) return
    const items = await Promise.all(imgs.map(newItem))
    const { rows: now, onChange: emit } = latest.current
    emit([...now, ...items])
  }

  const replace = async (id: string, img: PickedImage) => {
    const size = await sizeFor(img)
    const { rows: now, ids: nowIds, onChange: emit } = latest.current
    const i = nowIds.indexOf(id)
    if (i < 0) return
    emit(now.map((r, j) => (j === i ? ({ ...r, url: img.path, ...size } as GalleryItem) : r)))
  }

  const clearAll = async () => {
    const ok = await prompt({
      title: "Καθαρισμός γκαλερί",
      description: `${
        rows.length === 1
          ? "Να αφαιρεθεί η εικόνα από τη γκαλερί;"
          : `Να αφαιρεθούν και οι ${rows.length} εικόνες από τη γκαλερί;`
      } Τα αρχεία δεν διαγράφονται από τη βιβλιοθήκη. Η αλλαγή ισχύει μόλις αποθηκεύσετε.`,
      confirmText: "Καθαρισμός",
      cancelText: "Άκυρο",
    })
    if (!ok) return
    setEditing(null)
    latest.current.onChange([])
  }

  // ── files dropped from the computer ──
  const [fileOver, setFileOver] = useState(false)
  const [dropState, setDropState] = useState<{ done: number; total: number; errors: string[] } | null>(null)
  // Only an upload still running blocks the next drop — errors left on screen
  // from an earlier batch must not make drag-and-drop look dead.
  const dropping = useRef(false)
  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files")

  const dropZone = {
    onDragOver: (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
      if (!fileOver) setFileOver(true)
    },
    onDragLeave: (e: DragEvent) => {
      if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node | null)) setFileOver(false)
    },
    onDrop: async (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      setFileOver(false)
      const files = Array.from(e.dataTransfer.files ?? [])
      if (!files.length || dropping.current) return
      const errors: string[] = []
      const uploaded: PickedImage[] = []
      dropping.current = true
      setDropState({ done: 0, total: files.length, errors })
      try {
        for (const file of files) {
          try {
            uploaded.push(await uploadImage(file))
          } catch (err) {
            errors.push(`${file.name}: ${(err as Error)?.message ?? "σφάλμα"}`)
          }
          setDropState({ done: uploaded.length + errors.length, total: files.length, errors: [...errors] })
        }
        await append(uploaded)
        setDropState(errors.length ? { done: files.length, total: files.length, errors } : null)
      } finally {
        dropping.current = false
      }
    },
  }

  // ── drag to reorder ──
  const sensors = useSensors(
    // a few px of travel before a drag starts, so a click still opens the editor
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const position = (id: string | number) => ids.indexOf(String(id)) + 1
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Μετακίνηση εικόνας ${position(active.id)} από ${rows.length}.`,
    onDragOver: ({ active, over }) =>
      over ? `Η εικόνα ${position(active.id)} πάνω από τη θέση ${position(over.id)}.` : "Εκτός γκαλερί.",
    onDragEnd: ({ active, over }) =>
      over ? `Η εικόνα ${position(active.id)} μπήκε στη θέση ${position(over.id)}.` : "Η μετακίνηση ακυρώθηκε.",
    onDragCancel: () => "Η μετακίνηση ακυρώθηκε.",
  }

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id))
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    move(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
  }

  const activeRow = activeId ? rows[ids.indexOf(activeId)] : null

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <Label weight="plus">{label}</Label>
          <Text size="xsmall" className="text-ui-fg-muted">
            {countLabel(rows.length)}
          </Text>
        </div>
        <div className="flex items-center gap-1.5">
          {rows.length ? (
            <Button size="small" variant="transparent" type="button" onClick={clearAll}>
              <Trash />
              Καθαρισμός
            </Button>
          ) : null}
          <Button size="small" variant="secondary" type="button" onClick={() => setModal("add")}>
            <Plus />
            Προσθήκη εικόνων
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <button
          type="button"
          onClick={() => setModal("add")}
          {...dropZone}
          className={clx(
            "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-8 text-ui-fg-muted transition-colors hover:border-ui-border-interactive hover:text-ui-fg-base",
            fileOver ? "border-ui-border-interactive bg-ui-bg-highlight" : "border-ui-border-strong bg-ui-bg-field",
          )}
        >
          <Photo />
          <Text size="small">Δεν υπάρχουν εικόνες — Προσθήκη εικόνων</Text>
          <Text size="xsmall" className="text-ui-fg-muted">
            ή σύρετε αρχεία εδώ για μεταφόρτωση
          </Text>
        </button>
      ) : (
        <div
          {...dropZone}
          className={clx(
            "rounded-lg border p-2 transition-colors",
            fileOver
              ? "border-dashed border-ui-border-interactive bg-ui-bg-highlight"
              : "border-ui-border-base bg-ui-bg-subtle",
          )}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActiveId(null)}
            accessibility={{
              announcements,
              screenReaderInstructions: {
                draggable:
                  "Πατήστε Space για να πιάσετε την εικόνα, τα βέλη για να τη μετακινήσετε, Space για να την αφήσετε ή Escape για ακύρωση.",
              },
            }}
          >
            <SortableContext items={ids} strategy={rectSortingStrategy}>
              {/* Sized by the container, not the viewport: this panel is a
                  ~300px section inspector, where viewport columns made 40px
                  tiles whose ⠿/× controls covered the whole thumbnail. */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2">
                {rows.map((row, i) => (
                  <SortableTile
                    key={ids[i]}
                    id={ids[i]}
                    index={i}
                    count={rows.length}
                    src={src(row.url)}
                    alt={String(row.alt ?? "")}
                    selected={ids[i] === editing}
                    onOpen={() => setEditing(ids[i] === editing ? null : ids[i])}
                    onRemove={() => remove(i)}
                    onMove={(to) => move(i, to)}
                  />
                ))}
              </div>
            </SortableContext>

            {typeof document !== "undefined"
              ? createPortal(
                  <DragOverlay zIndex={10000}>
                    {activeRow ? (
                      <div className="aspect-square w-full cursor-grabbing overflow-hidden rounded-lg border border-ui-border-interactive bg-ui-bg-field shadow-elevation-flyout">
                        <TileImage key={src(activeRow.url)} src={src(activeRow.url)} />
                      </div>
                    ) : null}
                  </DragOverlay>,
                  document.body,
                )
              : null}
          </DndContext>

          <Text size="xsmall" className="mt-2 block text-ui-fg-muted">
            Σύρετε για αλλαγή σειράς · κλικ σε εικόνα για επεξεργασία · αποθέστε αρχεία εδώ για μεταφόρτωση
          </Text>
        </div>
      )}

      {dropState ? (
        <div className="flex flex-col gap-1">
          {dropState.done < dropState.total ? (
            <div className="flex items-center gap-2">
              <Spinner className="animate-spin text-ui-fg-muted" />
              <Text size="xsmall" className="text-ui-fg-subtle">
                <ArrowUpTray className="mr-1 inline" />
                Μεταφόρτωση {dropState.done} / {dropState.total}…
              </Text>
            </div>
          ) : null}
          {dropState.errors.map((err) => (
            <div key={err} className="flex items-center gap-2">
              <ExclamationCircle className="text-ui-fg-error" />
              <Text size="xsmall" className="text-ui-fg-error">
                {err}
              </Text>
            </div>
          ))}
          {dropState.done >= dropState.total ? (
            <div>
              <Button size="small" variant="transparent" type="button" onClick={() => setDropState(null)}>
                Απόκρυψη
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Editor for the clicked image */}
      {editRow ? (
        // Stacked, not side by side: the panel is as narrow as the inspector it
        // sits in, and a viewport-based row left the inputs a few px wide.
        <div className="flex flex-col gap-3 rounded-lg border border-ui-border-interactive bg-ui-bg-base p-3">
          <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-md bg-ui-bg-field">
            <PreviewImage key={String(editRow.url)} src={src(editRow.url)} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Text size="small" weight="plus">
                  Εικόνα {editIndex + 1} από {rows.length}
                </Text>
                <Text size="xsmall" className="truncate text-ui-fg-muted" title={String(editRow.url)}>
                  {fileNameOf(String(editRow.url)) || "—"}
                </Text>
              </div>
              <IconButton size="small" variant="transparent" type="button" title="Κλείσιμο" onClick={() => setEditing(null)}>
                <XMark />
              </IconButton>
            </div>

            <label className="flex flex-col gap-1">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Εναλλακτικό κείμενο (alt) — τι δείχνει η εικόνα
              </Text>
              <Input
                size="small"
                value={String(editRow.alt ?? "")}
                onChange={(e) => patch(editIndex, { alt: e.target.value })}
              />
            </label>

            {textKeys.map(({ key, label: l }) => (
              <label key={key} className="flex flex-col gap-1">
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {l}
                </Text>
                <Input
                  size="small"
                  value={String(editRow[key] ?? "")}
                  onChange={(e) => patch(editIndex, { [key]: e.target.value })}
                />
              </label>
            ))}

            <label className="flex flex-col gap-1">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Διεύθυνση (URL)
              </Text>
              <Input
                size="small"
                value={String(editRow.url ?? "")}
                placeholder="/images/… ή https://…"
                onChange={(e) => patch(editIndex, { url: e.target.value })}
                onBlur={(e) => {
                  if (editing) void remeasure(editing, e.target.value)
                }}
              />
            </label>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button size="small" variant="secondary" type="button" onClick={() => setModal("replace")}>
                <ArrowPath />
                Αντικατάσταση
              </Button>
              <Button size="small" variant="transparent" type="button" onClick={() => remove(editIndex)}>
                <Trash />
                Αφαίρεση
              </Button>
              <div className="flex-1" />
              <Button size="small" variant="secondary" type="button" onClick={() => setEditing(null)}>
                Κλείσιμο
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {modal ? (
        <LibraryModal
          lib={lib}
          allowUpload
          multiple={modal === "add"}
          title={modal === "add" ? "Προσθήκη εικόνων στη γκαλερί" : "Αντικατάσταση εικόνας"}
          current={modal === "replace" && editRow ? String(editRow.url ?? "") : ""}
          marked={rows.map((r) => String(r.url ?? ""))}
          onClose={() => setModal(null)}
          onPickMany={(imgs) => {
            setModal(null)
            void append(imgs)
          }}
          onPick={(path, img) => {
            setModal(null)
            if (modal !== "replace" || !editing) return
            void replace(editing, img ?? { path, name: fileNameOf(path) })
          }}
        />
      ) : null}
    </div>
  )
}

/** Cropped to the square tile, except far-from-square images (a logo, a banner):
 *  those are shown whole, or the editor sees a fragment instead of the picture. */
function TileImage({ src }: { src: string }) {
  const [fit, setFit] = useState("object-cover")
  return src ? (
    <img
      src={src}
      alt=""
      loading="lazy"
      draggable={false}
      className={clx("pointer-events-none h-full w-full select-none", fit)}
      onLoad={(e) => {
        const el = e.currentTarget as HTMLImageElement
        el.style.opacity = ""
        const ratio = el.naturalHeight ? el.naturalWidth / el.naturalHeight : 1
        setFit(ratio > 1.6 || ratio < 0.625 ? "object-contain" : "object-cover")
      }}
      onError={(e) => {
        ;(e.currentTarget as HTMLImageElement).style.opacity = "0.15"
      }}
    />
  ) : (
    <span className="flex h-full w-full items-center justify-center text-ui-fg-muted">
      <Photo />
    </span>
  )
}

/** Large preview in the editor, with the intrinsic size once loaded. */
function PreviewImage({ src }: { src: string }) {
  const [size, setSize] = useState<string>("")
  if (!src) {
    return (
      <span className="text-ui-fg-muted">
        <Photo />
      </span>
    )
  }
  return (
    <div className="relative h-full w-full">
      <img
        src={src}
        alt=""
        className="h-full w-full object-contain"
        onLoad={(e) => {
          const el = e.currentTarget
          setSize(imageInfo(el.naturalWidth, el.naturalHeight))
        }}
        onError={() => setSize("Η εικόνα δεν φορτώνει")}
      />
      {size ? (
        <span className="absolute bottom-1 left-1 rounded bg-ui-bg-base px-1.5 py-0.5 text-[11px] text-ui-fg-subtle">
          {size}
        </span>
      ) : null}
    </div>
  )
}

function SortableTile({
  id,
  index,
  count,
  src,
  alt,
  selected,
  onOpen,
  onRemove,
  onMove,
}: {
  id: string
  index: number
  count: number
  src: string
  alt: string
  selected: boolean
  onOpen: () => void
  onRemove: () => void
  onMove: (to: number) => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const reveal =
    "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"

  return (
    <div
      ref={setNodeRef}
      style={style}
      // Pointer drags start anywhere on the tile; keyboard drags only from the
      // handle (dnd-kit ignores key events whose target isn't the activator).
      {...listeners}
      // `touch-none`: dnd-kit's pointer sensor needs the browser to leave the
      // gesture alone, or a drag on a tablet turns into a page scroll.
      className={clx(
        "group relative aspect-square cursor-grab touch-none overflow-hidden rounded-lg border bg-ui-bg-field",
        isDragging
          ? "border-2 border-dashed border-ui-border-interactive opacity-60"
          : selected
            ? "border-ui-border-interactive ring-2 ring-ui-border-interactive"
            : "border-ui-border-base hover:border-ui-border-interactive",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        title={alt ? `Επεξεργασία — ${alt}` : "Επεξεργασία εικόνας"}
        aria-label={`Εικόνα ${index + 1}${alt ? `: ${alt}` : ""} — επεξεργασία`}
        className={clx("absolute inset-0 block h-full w-full", isDragging && "invisible")}
      >
        <TileImage key={src} src={src} />
      </button>

      {!isDragging ? (
        <>
          <span className="pointer-events-none absolute bottom-0.5 left-0.5 rounded bg-ui-bg-base px-1 text-[10px] leading-4 text-ui-fg-subtle">
            {index + 1}
          </span>

          {/* The controls stay in the corners and stay small, so the middle of
              even a 72px tile is always the «open the editor» click target. */}
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            aria-label={`Μετακίνηση εικόνας ${index + 1}`}
            title="Σύρετε για αλλαγή σειράς"
            className={clx(
              "absolute left-0.5 top-0.5 flex h-5 w-5 cursor-grab touch-none items-center justify-center rounded-md bg-ui-bg-base text-ui-fg-subtle shadow-borders-base",
              reveal,
            )}
          >
            <DotsSix />
          </button>

          <button
            type="button"
            onClick={onRemove}
            aria-label={`Αφαίρεση εικόνας ${index + 1}`}
            title="Αφαίρεση"
            className={clx(
              "absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ui-bg-base text-ui-fg-subtle shadow-borders-base hover:text-ui-fg-error",
              reveal,
            )}
          >
            <XMarkMini />
          </button>

          {/* Keyboard fallback — shown while something in the tile has focus */}
          <div className="pointer-events-none absolute bottom-0.5 right-0.5 flex gap-0.5 opacity-0 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100">
            <IconButton
              size="2xsmall"
              variant="primary"
              type="button"
              title="Μετακίνηση αριστερά"
              aria-label={`Μετακίνηση εικόνας ${index + 1} αριστερά`}
              disabled={index === 0}
              onClick={() => onMove(index - 1)}
            >
              <ArrowLeftMini />
            </IconButton>
            <IconButton
              size="2xsmall"
              variant="primary"
              type="button"
              title="Μετακίνηση δεξιά"
              aria-label={`Μετακίνηση εικόνας ${index + 1} δεξιά`}
              disabled={index === count - 1}
              onClick={() => onMove(index + 1)}
            >
              <ArrowRightMini />
            </IconButton>
          </div>
        </>
      ) : null}
    </div>
  )
}
