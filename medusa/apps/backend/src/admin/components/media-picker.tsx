import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  Badge,
  Button,
  FocusModal,
  Heading,
  Input,
  Select,
  Tabs,
  Text,
  clx,
} from "@medusajs/ui"
import {
  ArrowUpTray,
  CheckCircleSolid,
  ExclamationCircle,
  MagnifyingGlass,
  Photo,
  Spinner,
} from "@medusajs/icons"
import { sdk } from "../lib/sdk"
import { useLibrary, type MediaItem } from "../lib/storefront"

/**
 * «Βιβλιοθήκη πολυμέσων» — one modal to choose images from, for anything that
 * stores an image URL in Medusa (product thumbnail, product gallery, …).
 *
 * Three sources, as tabs:
 *  - «Εικόνες προϊόντος»      the images passed in by the caller (optional)
 *  - «Βιβλιοθήκη ιστοσελίδας» the storefront's public/images (GET /admin/media)
 *  - «Μεταφορτώσεις»           files uploaded from the admin (GET /admin/media-assets)
 *
 * plus a «Μεταφόρτωση» button: POST /admin/uploads through the SDK, then the
 * file is recorded in media-assets (best effort) and selected.
 *
 * Every URL handed to `onPick` is ABSOLUTE — product images in Medusa are
 * stored as absolute URLs, so a library path `/images/x.jpg` becomes
 * `${storefront origin}/images/x.jpg`. Nothing is saved by the modal itself;
 * the caller decides what to do with the picked URLs.
 */

export type PickerProductImage = { id: string; url: string }

type Asset = {
  id: string
  url: string
  name: string
  width?: number | null
  height?: number | null
  size?: number | null
  mime_type?: string | null
  created_at?: string
}

type LibraryItem = MediaItem & { width?: number; height?: number }

type UploadRow = {
  key: string
  name: string
  state: "uploading" | "done" | "error"
  error?: string
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif"
const ACCEPTED = new Set(ACCEPT.split(","))
const MAX_BYTES = 10 * 1024 * 1024

const isAbsolute = (u: string) => /^https?:\/\//i.test(u)

/** Absolute URL for a stored value; site paths go onto the storefront origin. */
export function absoluteUrl(value: string, origin: string): string {
  const v = (value ?? "").trim()
  if (!v || isAbsolute(v)) return v
  if (!origin) return ""
  return `${origin.replace(/\/+$/, "")}${v.startsWith("/") ? "" : "/"}${v}`
}

/**
 * `src` for showing a stored URL inside the admin. The only rewrite: Medusa's
 * local file provider hands out `http://localhost:9000/static/…` regardless of
 * the port the backend really runs on, so in local dev those previews are
 * pointed at this origin. Display only — never persist the result.
 */
export function displaySrc(url: string | null | undefined): string {
  const u = (url ?? "").trim()
  if (typeof window === "undefined") return u
  const m = u.match(/^https?:\/\/(?:localhost|127\.0\.0\.1):9000(\/static\/.*)$/i)
  if (m && window.location.origin !== "http://localhost:9000") {
    return `${window.location.origin}${m[1]}`
  }
  return u
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

export function prettyBytes(n?: number | null): string {
  if (n == null || !Number.isFinite(n)) return ""
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function dims(w?: number | null, h?: number | null): string {
  return w && h ? `${w}×${h}` : ""
}

function measure(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const src = URL.createObjectURL(file)
    const img = new Image()
    const done = (v: { width?: number; height?: number }) => {
      URL.revokeObjectURL(src)
      resolve(v)
    }
    img.onload = () => done({ width: img.naturalWidth || undefined, height: img.naturalHeight || undefined })
    img.onerror = () => done({})
    img.src = src
  })
}

function errorText(e: unknown): string {
  if (e instanceof Error && e.message) return e.message
  return typeof e === "string" ? e : "Άγνωστο σφάλμα"
}

function fileNameFromUrl(url: string): string {
  try {
    const last = new URL(url).pathname.split("/").filter(Boolean).pop() ?? url
    return decodeURIComponent(last)
  } catch {
    return url.split("/").pop() ?? url
  }
}

type TabKey = "product" | "library" | "uploads"

export function MediaPickerModal({
  open,
  onClose,
  onPick,
  multiple = false,
  productImages,
  title = "Βιβλιοθήκη πολυμέσων",
  current,
  disabledUrls,
  confirmLabel,
}: {
  open: boolean
  onClose: () => void
  /** Absolute URLs, in the order they were selected. */
  onPick: (urls: string[]) => void
  multiple?: boolean
  productImages?: PickerProductImage[]
  title?: string
  /** The value being replaced (single mode) — highlighted, preselected. */
  current?: string | null
  /** URLs that are already in use: shown, but not selectable. */
  disabledUrls?: string[]
  confirmLabel?: string
}) {
  if (!open) return null
  return (
    <PickerBody
      onClose={onClose}
      onPick={onPick}
      multiple={multiple}
      productImages={productImages}
      title={title}
      current={current ?? ""}
      disabledUrls={disabledUrls}
      confirmLabel={confirmLabel}
    />
  )
}

function PickerBody({
  onClose,
  onPick,
  multiple,
  productImages,
  title,
  current,
  disabledUrls,
  confirmLabel,
}: {
  onClose: () => void
  onPick: (urls: string[]) => void
  multiple: boolean
  productImages?: PickerProductImage[]
  title: string
  current: string
  disabledUrls?: string[]
  confirmLabel?: string
}) {
  const lib = useLibrary()
  const origin = lib?.origin ?? ""

  const product = useMemo(() => {
    const seen = new Set<string>()
    return (productImages ?? []).filter((i) => {
      if (!i.url || seen.has(i.url)) return false
      seen.add(i.url)
      return true
    })
  }, [productImages])

  const [tab, setTab] = useState<TabKey>(product.length ? "product" : "library")
  const [q, setQ] = useState("")
  const [folder, setFolder] = useState("all")
  const [selected, setSelected] = useState<string[]>(() =>
    !multiple && current && !(disabledUrls ?? []).includes(current) ? [current] : []
  )

  const disabled = useMemo(() => new Set(disabledUrls ?? []), [disabledUrls])

  // ── uploads tab: stored assets + this session's uploads ──
  const [assets, setAssets] = useState<Asset[] | null>(null)
  const [assetsError, setAssetsError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    sdk.client
      .fetch<{ assets: Asset[] }>("/admin/media-assets", { method: "GET" })
      .then((r) => alive && setAssets(r.assets ?? []))
      .catch((e) => {
        if (!alive) return
        setAssets([])
        setAssetsError(errorText(e))
      })
    return () => {
      alive = false
    }
  }, [])

  const [uploads, setUploads] = useState<UploadRow[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const toggle = (url: string) => {
    if (!url || disabled.has(url)) return
    setSelected((prev) => {
      if (!multiple) return [url]
      return prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    })
  }

  const confirm = (urls = selected) => {
    const clean = urls.filter((u) => isAbsolute(u) && !disabled.has(u))
    if (!clean.length) return
    onPick(multiple ? clean : clean.slice(-1))
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
    setUploads((prev) => [...rows, ...prev])
    setTab("uploads")
    setUploading(true)

    const patch = (key: string, p: Partial<UploadRow>) =>
      setUploads((prev) => prev.map((r) => (r.key === key ? { ...r, ...p } : r)))

    const picked: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const row = rows[i]
      try {
        if (!ACCEPTED.has(file.type)) {
          throw new Error("Μη αποδεκτός τύπος — JPG, PNG, WebP, GIF ή AVIF.")
        }
        if (file.size > MAX_BYTES) {
          throw new Error(`Πολύ μεγάλο αρχείο (${prettyBytes(file.size)}) — έως ${prettyBytes(MAX_BYTES)}.`)
        }
        const size = await measure(file)
        const res = await sdk.admin.upload.create({ files: [file] })
        const stored = res.files?.[0]
        if (!stored?.url) throw new Error("Ο server δεν επέστρεψε διεύθυνση αρχείου.")

        if (unusableUploadUrl(stored.url)) {
          // Local file provider on a real server: the URL points at localhost
          // and the file disappears on the next deploy. Don't let it be saved.
          sdk.admin.upload.delete(stored.id).catch(() => undefined)
          throw new Error(
            "Ο χώρος αποθήκευσης αρχείων δεν έχει ρυθμιστεί στον server — το αρχείο δεν θα διατηρούνταν."
          )
        }

        const asset: Asset = {
          id: stored.id,
          url: stored.url,
          name: file.name,
          width: size.width ?? null,
          height: size.height ?? null,
          size: file.size,
          mime_type: file.type,
          created_at: new Date().toISOString(),
        }
        // Record it for the «Μεταφορτώσεις» tab — a failure here must not
        // lose the upload, which already exists in storage.
        try {
          const saved = await sdk.client.fetch<{ asset: Asset }>("/admin/media-assets", {
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
          if (saved?.asset?.id) asset.id = saved.asset.id
        } catch {
          // shown in this session anyway
        }
        setAssets((prev) => [asset, ...(prev ?? []).filter((a) => a.url !== asset.url)])
        picked.push(stored.url)
        patch(row.key, { state: "done" })
      } catch (e) {
        patch(row.key, { state: "error", error: errorText(e) })
      }
    }

    setUploading(false)
    if (picked.length) {
      setSelected((prev) => (multiple ? [...prev.filter((u) => !picked.includes(u)), ...picked] : [picked[picked.length - 1]]))
    }
  }

  const needle = q.trim().toLowerCase()

  const libraryItems = useMemo(() => {
    const items = (lib?.items ?? []) as LibraryItem[]
    return items.filter(
      (i) =>
        (folder === "all" || i.folder === folder) &&
        (!needle || i.name.toLowerCase().includes(needle) || i.folder.toLowerCase().includes(needle))
    )
  }, [lib, folder, needle])

  const assetItems = useMemo(
    () => (assets ?? []).filter((a) => !needle || (a.name ?? "").toLowerCase().includes(needle)),
    [assets, needle]
  )

  const productItems = useMemo(
    () => product.filter((p) => !needle || fileNameFromUrl(p.url).toLowerCase().includes(needle)),
    [product, needle]
  )

  const doneCount = uploads.filter((u) => u.state !== "uploading").length
  const pendingRows = uploads.filter((u) => u.state !== "done")

  return (
    <FocusModal open onOpenChange={(o) => !o && !uploading && onClose()}>
      <FocusModal.Content aria-describedby={undefined}>
        <FocusModal.Header>
          <div className="flex flex-1 items-center justify-between gap-x-4">
            <FocusModal.Title asChild>
              <Heading level="h2">{title}</Heading>
            </FocusModal.Title>
            <div className="flex items-center gap-x-2">
              <input
                ref={fileInput}
                type="file"
                accept={ACCEPT}
                multiple={multiple}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Button
                size="small"
                variant="primary"
                type="button"
                isLoading={uploading}
                onClick={() => fileInput.current?.click()}
              >
                <ArrowUpTray />
                Μεταφόρτωση
              </Button>
            </div>
          </div>
        </FocusModal.Header>

        <FocusModal.Body className="flex min-h-0 flex-col overflow-y-auto">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="flex flex-col">
            <div className="border-ui-border-base bg-ui-bg-base sticky top-0 z-10 flex flex-col gap-3 border-b px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs.List>
                  {product.length ? (
                    <Tabs.Trigger value="product">Εικόνες προϊόντος ({product.length})</Tabs.Trigger>
                  ) : null}
                  <Tabs.Trigger value="library">Βιβλιοθήκη ιστοσελίδας</Tabs.Trigger>
                  <Tabs.Trigger value="uploads">Μεταφορτώσεις{assets ? ` (${assets.length})` : ""}</Tabs.Trigger>
                </Tabs.List>
                <div className="flex min-w-[220px] flex-1 items-center gap-2 sm:max-w-[420px]">
                  <MagnifyingGlass className="text-ui-fg-muted shrink-0" />
                  <Input
                    size="small"
                    value={q}
                    placeholder="Αναζήτηση…"
                    onChange={(e) => setQ(e.target.value)}
                  />
                  {tab === "library" ? (
                    <Select size="small" value={folder} onValueChange={setFolder}>
                      <Select.Trigger className="w-[200px] shrink-0">
                        <Select.Value placeholder="Όλοι οι φάκελοι" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="all">Όλοι οι φάκελοι</Select.Item>
                        {(lib?.folders ?? []).map((f) => (
                          <Select.Item key={f} value={f}>
                            {f}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  ) : null}
                </div>
              </div>

              {uploads.length ? (
                <div className="flex flex-col gap-1.5">
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-ui-bg-subtle h-1.5 flex-1 overflow-hidden rounded-full">
                        <div
                          className="bg-ui-fg-interactive h-full rounded-full transition-all"
                          style={{ width: `${Math.round((doneCount / uploads.length) * 100)}%` }}
                        />
                      </div>
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {doneCount} / {uploads.length}
                      </Text>
                    </div>
                  ) : null}
                  {pendingRows.map((u) => (
                    <div key={u.key} className="flex items-center gap-2">
                      {u.state === "uploading" ? (
                        <Spinner className="text-ui-fg-muted animate-spin" />
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
            </div>

            {product.length ? (
              <Tabs.Content value="product" className="px-6 py-4">
                <Grid empty={!productItems.length} emptyText="Καμία εικόνα δεν ταιριάζει.">
                  {productItems.map((p) => (
                    <Tile
                      key={p.url}
                      src={displaySrc(p.url)}
                      name={fileNameFromUrl(p.url)}
                      meta=""
                      selected={selected.includes(p.url)}
                      current={p.url === current}
                      disabled={disabled.has(p.url)}
                      multiple={multiple}
                      onClick={() => toggle(p.url)}
                      onDoubleClick={() => !multiple && confirm([p.url])}
                    />
                  ))}
                </Grid>
              </Tabs.Content>
            ) : null}

            <Tabs.Content value="library" className="flex flex-col gap-3 px-6 py-4">
              {lib?.error ? (
                <div className="border-ui-border-error bg-ui-bg-subtle rounded-lg border p-3">
                  <Text size="small" className="text-ui-fg-error">
                    {lib.error}
                  </Text>
                </div>
              ) : null}
              {!lib ? (
                <Text size="small" className="text-ui-fg-subtle">
                  Φόρτωση βιβλιοθήκης…
                </Text>
              ) : (
                <>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {libraryItems.length} εικόνες · από {origin || "—"}
                  </Text>
                  <Grid empty={!libraryItems.length && !lib.error} emptyText="Καμία εικόνα δεν ταιριάζει.">
                    {libraryItems.map((item) => {
                      const url = absoluteUrl(item.path, origin)
                      return (
                        <Tile
                          key={item.path}
                          src={url}
                          name={item.name}
                          sub={item.folder}
                          meta={[dims(item.width, item.height), prettyBytes(item.bytes)].filter(Boolean).join(" · ")}
                          selected={!!url && selected.includes(url)}
                          current={!!url && url === current}
                          disabled={!url || disabled.has(url)}
                          multiple={multiple}
                          onClick={() => toggle(url)}
                          onDoubleClick={() => !multiple && url && confirm([url])}
                        />
                      )
                    })}
                  </Grid>
                </>
              )}
            </Tabs.Content>

            <Tabs.Content value="uploads" className="flex flex-col gap-3 px-6 py-4">
              {assetsError ? (
                <Text size="small" className="text-ui-fg-error">
                  Οι προηγούμενες μεταφορτώσεις δεν φορτώθηκαν: {assetsError}
                </Text>
              ) : null}
              {assets === null ? (
                <Text size="small" className="text-ui-fg-subtle">
                  Φόρτωση…
                </Text>
              ) : !assets.length ? (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="border-ui-border-strong text-ui-fg-subtle hover:border-ui-border-interactive hover:text-ui-fg-base flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 transition-colors"
                >
                  <ArrowUpTray />
                  <Text size="small">Δεν υπάρχουν μεταφορτώσεις ακόμη — πατήστε για μεταφόρτωση εικόνας.</Text>
                </button>
              ) : (
                <Grid empty={!assetItems.length} emptyText="Καμία εικόνα δεν ταιριάζει.">
                  {assetItems.map((a) => (
                    <Tile
                      key={a.id + a.url}
                      src={displaySrc(a.url)}
                      name={a.name}
                      meta={[dims(a.width, a.height), prettyBytes(a.size)].filter(Boolean).join(" · ")}
                      selected={selected.includes(a.url)}
                      current={a.url === current}
                      disabled={disabled.has(a.url)}
                      multiple={multiple}
                      onClick={() => toggle(a.url)}
                      onDoubleClick={() => !multiple && confirm([a.url])}
                    />
                  ))}
                </Grid>
              )}
            </Tabs.Content>
          </Tabs>
        </FocusModal.Body>

        <FocusModal.Footer className="justify-between">
          <Text size="small" className="text-ui-fg-subtle">
            {multiple
              ? selected.length
                ? `${selected.length} επιλεγμένες`
                : "Επιλέξτε μία ή περισσότερες εικόνες."
              : "Επιλέξτε μία εικόνα (διπλό κλικ για άμεση επιλογή)."}
          </Text>
          <div className="flex items-center gap-2">
            <Button size="small" variant="secondary" type="button" disabled={uploading} onClick={onClose}>
              Κλείσιμο
            </Button>
            <Button
              size="small"
              type="button"
              disabled={uploading || !selected.length || (!multiple && selected[0] === current)}
              onClick={() => confirm()}
            >
              {confirmLabel ?? (multiple ? `Προσθήκη (${selected.length})` : "Επιλογή")}
            </Button>
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}

function Grid({
  children,
  empty,
  emptyText,
}: {
  children: ReactNode
  empty: boolean
  emptyText: string
}) {
  if (empty) {
    return (
      <Text size="small" className="text-ui-fg-subtle">
        {emptyText}
      </Text>
    )
  }
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">{children}</div>
}

function Tile({
  src,
  name,
  sub,
  meta,
  selected,
  current,
  disabled,
  multiple,
  onClick,
  onDoubleClick,
}: {
  src: string
  name: string
  sub?: string
  meta: string
  selected: boolean
  current: boolean
  disabled: boolean
  multiple: boolean
  onClick: () => void
  onDoubleClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
      aria-pressed={selected}
      title={[name, meta].filter(Boolean).join(" · ")}
      className={clx(
        "group relative flex flex-col overflow-hidden rounded-lg border text-left transition-colors",
        selected
          ? "border-ui-border-interactive ring-ui-border-interactive ring-2"
          : "border-ui-border-base hover:border-ui-border-interactive",
        disabled && "cursor-not-allowed opacity-50 hover:border-ui-border-base"
      )}
    >
      <span className="bg-ui-bg-subtle relative block aspect-square w-full">
        {src ? (
          <img
            src={src}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.opacity = "0.15"
            }}
          />
        ) : (
          <span className="text-ui-fg-muted flex h-full w-full items-center justify-center">
            <Photo />
          </span>
        )}
        {selected ? (
          <span className="bg-ui-bg-base absolute right-1.5 top-1.5 rounded-full">
            <CheckCircleSolid className="text-ui-fg-interactive" />
          </span>
        ) : multiple && !disabled ? (
          <span className="border-ui-border-strong bg-ui-bg-base/80 absolute right-1.5 top-1.5 h-4 w-4 rounded-full border opacity-0 transition-opacity group-hover:opacity-100" />
        ) : null}
        {disabled ? (
          <span className="absolute left-1.5 top-1.5">
            <Badge size="2xsmall">Υπάρχει ήδη</Badge>
          </span>
        ) : current ? (
          <span className="absolute left-1.5 top-1.5">
            <Badge size="2xsmall" color="blue">
              Τρέχουσα
            </Badge>
          </span>
        ) : null}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 p-2">
        <Text size="xsmall" className="truncate">
          {name}
        </Text>
        {sub ? (
          <Text size="xsmall" className="text-ui-fg-muted truncate">
            {sub}
          </Text>
        ) : null}
        {meta ? (
          <Text size="xsmall" className="text-ui-fg-muted truncate">
            {meta}
          </Text>
        ) : null}
      </span>
    </button>
  )
}
