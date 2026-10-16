import { useEffect, useMemo, useRef, useState } from "react"
import { Badge, Button, FocusModal, Input, Text, Select, IconButton, clx } from "@medusajs/ui"
import {
  Photo,
  Trash,
  MagnifyingGlass,
  ArrowUpTray,
  CheckCircleSolid,
  ExclamationCircle,
  Spinner,
} from "@medusajs/icons"
import { sdk } from "../lib/sdk"
import { useLibrary, type Library, type MediaItem } from "../lib/storefront"

/**
 * Image field with a visual library picker, in place of a bare URL text input.
 *
 * Shows the chosen image as a thumbnail; clicking it opens the site's media
 * library (the storefront's `public/images/`, indexed by `GET /admin/media`)
 * where an image can be searched, filtered by folder and picked. External URLs
 * are still accepted — some product photos live on the old WordPress domain.
 *
 * The stored value is unchanged: the same `/images/...` path or absolute URL as
 * before, so nothing downstream needs to know this picker exists.
 */

/** Absolute src for a stored value, so thumbnails render inside the admin. */
function srcFor(value: string, origin: string): string {
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value
  return `${origin}${value.startsWith("/") ? "" : "/"}${value}`
}

/**
 * `src` for showing a stored value inside the admin — `srcFor`, plus one
 * display-only rewrite: Medusa's local file provider hands out
 * `http://localhost:9000/static/…` whatever port the backend really runs on,
 * so in local dev those previews are pointed at this origin. Never persist it.
 */
export function previewSrc(value: string, origin: string): string {
  const u = srcFor((value ?? "").trim(), origin)
  if (typeof window === "undefined") return u
  const m = u.match(/^https?:\/\/(?:localhost|127\.0\.0\.1):9000(\/static\/.*)$/i)
  if (m && window.location.origin !== "http://localhost:9000") {
    return `${window.location.origin}${m[1]}`
  }
  return u
}

/** The path/URL without its query string (`?v=` cache-busters). */
export const bareUrl = (u: string) => String(u ?? "").trim().split(/[?#]/)[0]

function prettyBytes(n?: number | null): string {
  if (n == null || !Number.isFinite(n)) return ""
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

/** «1920×1080 · 245 KB» — whichever parts are known. */
export function imageInfo(width?: number | null, height?: number | null, bytes?: number | null): string {
  return [width && height ? `${width}×${height}` : "", prettyBytes(bytes)].filter(Boolean).join(" · ")
}

/**
 * A thumbnail that fills its box, except for images far from square — a logo or
 * a banner is shown whole rather than cropped to an unrecognisable middle.
 * `className` sets the size; it must not set the object fit.
 */
export function FitImage({ src, className }: { src: string; className?: string }) {
  const [fit, setFit] = useState("object-cover")
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      className={clx(className, fit)}
      onLoad={(e) => {
        const el = e.currentTarget
        const ratio = el.naturalHeight ? el.naturalWidth / el.naturalHeight : 1
        setFit(ratio > 1.6 || ratio < 0.625 ? "object-contain" : "object-cover")
      }}
      onError={(e) => {
        ;(e.currentTarget as HTMLImageElement).style.opacity = "0.15"
      }}
    />
  )
}

/** Last path segment, decoded — a readable name for a URL. */
export function fileNameOf(url: string): string {
  const path = bareUrl(url)
  const last = path.split("/").filter(Boolean).pop() ?? path
  try {
    return decodeURIComponent(last)
  } catch {
    return last
  }
}

// ── Uploads ──────────────────────────────────────────────────────────────────

/** An image chosen in the library modal, with whatever metadata is known. */
export type PickedImage = {
  /** The value to store: a `/images/...` site path, or an absolute URL for uploads. */
  path: string
  name: string
  width?: number
  height?: number
  bytes?: number
}

const UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif"
const UPLOAD_ACCEPTED = new Set(UPLOAD_ACCEPT.split(","))
const UPLOAD_MAX_BYTES = 10 * 1024 * 1024
const UPLOADS_FOLDER = "Μεταφορτώσεις"

function errorText(e: unknown): string {
  if (e instanceof Error && e.message) return e.message
  return typeof e === "string" ? e : "Άγνωστο σφάλμα"
}

const isLocalHost = (host: string) => /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/i.test(host)

/** True when an uploaded file got a URL nobody else can open (the local file
 *  provider on a real server — it is also wiped on every deploy). */
function unusableUploadUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return isLocalHost(host) && !isLocalHost(window.location.hostname)
  } catch {
    return true
  }
}

/** Intrinsic size of an image — a picked File or a URL. Resolves `{}` on failure. */
export function measureImage(source: File | string): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const objectUrl = typeof source === "string" ? null : URL.createObjectURL(source)
    const img = new Image()
    let settled = false
    const done = (v: { width?: number; height?: number }) => {
      if (settled) return
      settled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      resolve(v)
    }
    img.onload = () => done({ width: img.naturalWidth || undefined, height: img.naturalHeight || undefined })
    img.onerror = () => done({})
    setTimeout(() => done({}), 10_000)
    img.src = objectUrl ?? (source as string)
  })
}

/**
 * Upload one image through Medusa (`POST /admin/uploads`) and record it in the
 * «Μεταφορτώσεις» list (`POST /admin/media-assets`, best effort). Resolves with
 * the stored ABSOLUTE URL — whatever the configured file provider returns.
 * Throws a Greek, user-facing message on failure.
 */
export async function uploadImage(file: File): Promise<PickedImage> {
  if (!UPLOAD_ACCEPTED.has(file.type)) {
    throw new Error("Μη αποδεκτός τύπος — JPG, PNG, WebP, GIF ή AVIF.")
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    throw new Error(`Πολύ μεγάλο αρχείο (${prettyBytes(file.size)}) — έως ${prettyBytes(UPLOAD_MAX_BYTES)}.`)
  }
  const size = await measureImage(file)
  const res = await sdk.admin.upload.create({ files: [file] })
  const stored = res.files?.[0]
  if (!stored?.url) throw new Error("Ο server δεν επέστρεψε διεύθυνση αρχείου.")

  if (unusableUploadUrl(stored.url)) {
    // Local file provider on a real server: the URL points at localhost and the
    // file disappears on the next deploy. Don't let it be saved.
    sdk.admin.upload.delete(stored.id).catch(() => undefined)
    throw new Error("Ο χώρος αποθήκευσης αρχείων δεν έχει ρυθμιστεί στον server — το αρχείο δεν θα διατηρούνταν.")
  }

  try {
    await sdk.client.fetch("/admin/media-assets", {
      method: "POST",
      body: {
        url: stored.url,
        file_key: stored.id,
        name: file.name,
        mime_type: file.type || null,
        width: size.width ?? null,
        height: size.height ?? null,
        size: file.size,
      },
    })
  } catch {
    // The file is already stored — listing it later is a nicety.
  }

  return { path: stored.url, name: file.name, width: size.width, height: size.height, bytes: file.size }
}

type Asset = {
  id: string
  url: string
  name: string
  width?: number | null
  height?: number | null
  size?: number | null
}

type LibraryEntry = PickedImage & { folder: string }

export function ImagePicker({
  label,
  value,
  onChange,
  hint,
  disabled,
  alt,
  onAltChange,
}: {
  label?: string
  value: string | null | undefined
  onChange: (next: string) => void
  hint?: string
  disabled?: boolean
  /** Alt text, shown inside the box so it travels with the image it describes. */
  alt?: string
  onAltChange?: (next: string) => void
}) {
  const [open, setOpen] = useState(false)
  const lib = useLibrary()

  const origin = lib?.origin ?? ""
  const current = (value ?? "").trim()

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {label}
        </Text>
      ) : null}

      <div className="flex flex-col gap-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-2">
      <div className="flex items-start gap-3">
        {/* Thumbnail — click to open the library */}
        <button
          type="button"
          onClick={() => !disabled && setOpen(true)}
          title="Επιλογή από τη βιβλιοθήκη"
          className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-field transition-colors hover:border-ui-border-interactive"
        >
          {/* A site path needs the storefront origin — wait for it, or the
              browser asks the admin's own origin and gets a 404. */}
          {current && (origin || /^https?:\/\//i.test(current)) ? (
            <FitImage key={current} src={srcFor(current, origin)} className="h-full w-full" />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-ui-fg-muted">
              <Photo />
              <span className="text-[11px]">Επιλογή</span>
            </span>
          )}
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Input
            value={current}
            disabled={disabled}
            placeholder="/images/… ή https://…"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="secondary"
              type="button"
              disabled={disabled}
              onClick={() => setOpen(true)}
            >
              <Photo />
              Βιβλιοθήκη
            </Button>
            {current ? (
              <IconButton
                size="small"
                variant="transparent"
                type="button"
                title="Αφαίρεση"
                disabled={disabled}
                onClick={() => onChange("")}
              >
                <Trash />
              </IconButton>
            ) : null}
            {hint ? (
              <Text size="xsmall" className="text-ui-fg-muted">
                {hint}
              </Text>
            ) : null}
          </div>
        </div>
      </div>

      {onAltChange ? (
        <input
          value={alt ?? ""}
          placeholder="Alt — τι δείχνει η εικόνα"
          title="Εναλλακτικό κείμενο (alt)"
          onChange={(e) => onAltChange(e.target.value)}
          className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1.5 text-sm outline-none focus:border-ui-border-interactive"
        />
      ) : null}
      </div>

      {open ? (
        <LibraryModal
          lib={lib}
          current={current}
          onClose={() => setOpen(false)}
          onPick={(p) => {
            onChange(p)
            setOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}

type UploadRow = { key: string; name: string; state: "uploading" | "done" | "error"; error?: string }

/**
 * The site's image library in a modal.
 *
 * Default (single) mode is unchanged: clicking an image calls `onPick` at once.
 * `multiple` turns clicks into a checkbox selection — numbered in the order it
 * was made — confirmed with «Προσθήκη (n)» through `onPickMany`. `allowUpload`
 * adds «Μεταφόρτωση» (files go through Medusa's file provider and come back as
 * absolute URLs) and a «Μεταφορτώσεις» folder listing earlier uploads. `marked`
 * values (already in the gallery) get a badge; they can still be chosen.
 *
 * NOTE: `media-picker.tsx` (product images) is a second library modal with its
 * own upload path. The two should be merged into one modal + one `uploadImage`,
 * with the stored value (a relative `/images/...` path here, an absolute URL
 * there) as an option — a follow-up, once that file stops moving.
 */
export function LibraryModal({
  lib,
  current,
  onPick,
  onClose,
  multiple = false,
  onPickMany,
  marked,
  allowUpload = false,
  title = "Βιβλιοθήκη εικόνων",
}: {
  lib: Library | null
  current: string
  onPick: (path: string, image?: PickedImage) => void
  onClose: () => void
  multiple?: boolean
  /** Multi mode: the confirmed selection, in the order it was made. */
  onPickMany?: (images: PickedImage[]) => void
  /** Values already in use — shown with a «Υπάρχει ήδη» badge (query strings ignored). */
  marked?: string[]
  allowUpload?: boolean
  title?: string
}) {
  const [q, setQ] = useState("")
  const [folder, setFolder] = useState("all")
  const [selected, setSelected] = useState<PickedImage[]>([])

  // ── earlier uploads (only when uploading is offered) ──
  const [assets, setAssets] = useState<Asset[] | null>(null)
  useEffect(() => {
    if (!allowUpload) return
    let alive = true
    sdk.client
      .fetch<{ assets: Asset[] }>("/admin/media-assets", { method: "GET" })
      .then((r) => alive && setAssets(r.assets ?? []))
      .catch(() => alive && setAssets([]))
    return () => {
      alive = false
    }
  }, [allowUpload])

  const [uploads, setUploads] = useState<UploadRow[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const entries = useMemo<LibraryEntry[]>(() => {
    const uploaded: LibraryEntry[] = (assets ?? []).map((a) => ({
      path: a.url,
      name: a.name || fileNameOf(a.url),
      folder: UPLOADS_FOLDER,
      width: a.width ?? undefined,
      height: a.height ?? undefined,
      bytes: a.size ?? undefined,
    }))
    // The manifest carries width/height too; the shared type just doesn't say so.
    const site = ((lib?.items ?? []) as (MediaItem & { width?: number; height?: number })[]).map(
      (i): LibraryEntry => ({
        path: i.path,
        name: i.name,
        folder: i.folder,
        width: i.width,
        height: i.height,
        bytes: i.bytes,
      }),
    )
    const seen = new Set<string>()
    return [...uploaded, ...site].filter((e) => {
      if (!e.path || seen.has(e.path)) return false
      seen.add(e.path)
      return true
    })
  }, [assets, lib])

  const folders = useMemo(
    () => [...(allowUpload ? [UPLOADS_FOLDER] : []), ...(lib?.folders ?? [])],
    [allowUpload, lib],
  )

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return entries.filter(
      (i) =>
        (folder === "all" || i.folder === folder) &&
        (!needle || i.name.toLowerCase().includes(needle) || i.folder.toLowerCase().includes(needle)),
    )
  }, [entries, q, folder])

  const markedSet = useMemo(() => new Set((marked ?? []).map(bareUrl).filter(Boolean)), [marked])
  const currentBare = bareUrl(current)

  const choose = (entry: PickedImage) => {
    if (!multiple) {
      onPick(entry.path, entry)
      return
    }
    setSelected((prev) =>
      prev.some((p) => p.path === entry.path)
        ? prev.filter((p) => p.path !== entry.path)
        : [...prev, entry],
    )
  }

  const confirm = () => {
    if (!selected.length) return
    if (onPickMany) onPickMany(selected)
    else onPick(selected[selected.length - 1].path, selected[selected.length - 1])
  }

  const handleFiles = async (list: FileList | null) => {
    const files = Array.from(list ?? [])
    if (fileInput.current) fileInput.current.value = ""
    if (!files.length) return

    const rows: UploadRow[] = files.map((f, i) => ({
      key: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      state: "uploading",
    }))
    setUploads((prev) => [...rows, ...prev.filter((r) => r.state !== "done")])
    setUploading(true)
    const patch = (key: string, p: Partial<UploadRow>) =>
      setUploads((prev) => prev.map((r) => (r.key === key ? { ...r, ...p } : r)))

    const done: PickedImage[] = []
    for (let i = 0; i < files.length; i++) {
      try {
        const img = await uploadImage(files[i])
        done.push(img)
        setAssets((prev) => [
          { id: img.path, url: img.path, name: img.name, width: img.width, height: img.height, size: img.bytes },
          ...(prev ?? []).filter((a) => a.url !== img.path),
        ])
        patch(rows[i].key, { state: "done" })
      } catch (e) {
        patch(rows[i].key, { state: "error", error: errorText(e) })
      }
    }
    setUploading(false)
    if (!done.length) return

    if (!multiple) {
      const last = done[done.length - 1]
      onPick(last.path, last)
      return
    }
    setSelected((prev) => [...prev.filter((p) => !done.some((d) => d.path === p.path)), ...done])
    setFolder(UPLOADS_FOLDER)
  }

  const pendingRows = uploads.filter((u) => u.state !== "done")
  const finished = uploads.filter((u) => u.state !== "uploading").length

  return (
    <FocusModal open onOpenChange={(o) => !o && !uploading && onClose()}>
      <FocusModal.Content aria-describedby={undefined}>
        <FocusModal.Header>
          <div className="flex flex-1 items-center justify-between gap-x-4">
            <FocusModal.Title asChild>
              <Text weight="plus">{title}</Text>
            </FocusModal.Title>
            {allowUpload ? (
              <div className="flex items-center gap-x-2">
                <input
                  ref={fileInput}
                  type="file"
                  accept={UPLOAD_ACCEPT}
                  multiple={multiple}
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <Button
                  size="small"
                  variant="secondary"
                  type="button"
                  isLoading={uploading}
                  onClick={() => fileInput.current?.click()}
                >
                  <ArrowUpTray />
                  Μεταφόρτωση
                </Button>
              </div>
            ) : null}
          </div>
        </FocusModal.Header>

        <FocusModal.Body className="flex flex-col gap-4 overflow-y-auto p-6">
          {lib?.error ? (
            <div className="rounded-lg border border-ui-border-error bg-ui-bg-subtle p-3">
              <Text size="small" className="text-ui-fg-error">
                {lib.error}
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Μπορείτε πάντα να επικολλήσετε ένα URL στο πεδίο.
              </Text>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[220px] flex-1 items-center gap-2">
              <MagnifyingGlass className="text-ui-fg-muted" />
              <Input
                value={q}
                placeholder="Αναζήτηση…"
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select value={folder} onValueChange={setFolder}>
              <Select.Trigger className="w-[240px]">
                <Select.Value placeholder="Όλοι οι φάκελοι" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">Όλοι οι φάκελοι</Select.Item>
                {folders.map((f) => (
                  <Select.Item key={f} value={f}>
                    {f}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {lib ? `${shown.length} ${shown.length === 1 ? "εικόνα" : "εικόνες"}` : "Φόρτωση…"}
            </Text>
          </div>

          {uploads.length && (uploading || pendingRows.length) ? (
            <div className="flex flex-col gap-1.5">
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ui-bg-subtle">
                    <div
                      className="h-full rounded-full bg-ui-fg-interactive transition-all"
                      style={{ width: `${Math.round((finished / uploads.length) * 100)}%` }}
                    />
                  </div>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {finished} / {uploads.length}
                  </Text>
                </div>
              ) : null}
              {pendingRows.map((u) => (
                <div key={u.key} className="flex items-center gap-2">
                  {u.state === "uploading" ? (
                    <Spinner className="animate-spin text-ui-fg-muted" />
                  ) : (
                    <ExclamationCircle className="text-ui-fg-error" />
                  )}
                  <Text size="xsmall" className={clx("truncate", u.state === "error" && "text-ui-fg-error")}>
                    {u.name}
                    {u.state === "uploading" ? " — μεταφόρτωση…" : ` — ${u.error}`}
                  </Text>
                </div>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {shown.map((item) => {
              const order = multiple ? selected.findIndex((s) => s.path === item.path) : -1
              const isSelected = order >= 0
              const active = !multiple && item.path === current
              const isCurrent = !active && !!currentBare && bareUrl(item.path) === currentBare
              const inUse = markedSet.has(bareUrl(item.path))
              const info = imageInfo(item.width, item.height, item.bytes)
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => choose(item)}
                  aria-pressed={multiple ? isSelected : undefined}
                  title={[item.path, info].filter(Boolean).join(" · ")}
                  className={clx(
                    "group relative flex flex-col overflow-hidden rounded-lg border text-left transition-colors",
                    active || isCurrent || isSelected
                      ? "border-ui-border-interactive ring-2 ring-ui-border-interactive"
                      : "border-ui-border-base hover:border-ui-border-interactive",
                  )}
                >
                  <span className="relative block h-24 w-full bg-ui-bg-field">
                    <FitImage src={previewSrc(item.path, lib?.origin ?? "")} className="h-24 w-full" />
                    {multiple ? (
                      isSelected ? (
                        <span className="absolute right-1.5 top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ui-fg-interactive px-1 text-[11px] font-medium text-ui-fg-on-color shadow">
                          {order + 1}
                        </span>
                      ) : (
                        <span className="absolute right-1.5 top-1.5 h-5 w-5 rounded-full border border-ui-border-strong bg-ui-bg-base opacity-60 transition-opacity group-hover:opacity-100" />
                      )
                    ) : active || isCurrent ? (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-ui-bg-base">
                        <CheckCircleSolid className="text-ui-fg-interactive" />
                      </span>
                    ) : null}
                    {inUse ? (
                      <span className="absolute left-1.5 top-1.5">
                        <Badge size="2xsmall">Υπάρχει ήδη</Badge>
                      </span>
                    ) : null}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5 p-2">
                    <Text size="xsmall" className="truncate">
                      {item.name}
                    </Text>
                    <Text size="xsmall" className="truncate text-ui-fg-muted">
                      {item.folder}
                    </Text>
                    {info ? (
                      <Text size="xsmall" className="truncate text-ui-fg-muted">
                        {info}
                      </Text>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>

          {lib && !shown.length && !lib.error ? (
            <Text size="small" className="text-ui-fg-subtle">
              {folder === UPLOADS_FOLDER && !q.trim()
                ? "Δεν υπάρχουν μεταφορτώσεις ακόμη — πατήστε «Μεταφόρτωση»."
                : "Καμία εικόνα δεν ταιριάζει."}
            </Text>
          ) : null}
        </FocusModal.Body>

        <FocusModal.Footer className="justify-between">
          {multiple ? (
            <div className="flex items-center gap-2">
              <Text size="small" className="text-ui-fg-subtle">
                {selected.length
                  ? `${selected.length} ${selected.length === 1 ? "επιλεγμένη" : "επιλεγμένες"}`
                  : "Επιλέξτε μία ή περισσότερες εικόνες."}
              </Text>
              {selected.length ? (
                <Button size="small" variant="transparent" type="button" onClick={() => setSelected([])}>
                  Αποεπιλογή
                </Button>
              ) : null}
            </div>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button size="small" variant="secondary" type="button" disabled={uploading} onClick={onClose}>
              Κλείσιμο
            </Button>
            {multiple ? (
              <Button
                size="small"
                type="button"
                disabled={uploading || !selected.length}
                onClick={confirm}
              >
                Προσθήκη ({selected.length})
              </Button>
            ) : null}
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}
