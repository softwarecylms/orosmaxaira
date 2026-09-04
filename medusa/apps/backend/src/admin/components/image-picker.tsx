import { useMemo, useState } from "react"
import { Button, FocusModal, Input, Text, Select, IconButton } from "@medusajs/ui"
import { Photo, Trash, MagnifyingGlass } from "@medusajs/icons"
import { useLibrary, type Library } from "../lib/storefront"

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

function prettyBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function ImagePicker({
  label,
  value,
  onChange,
  hint,
}: {
  label?: string
  value: string | null | undefined
  onChange: (next: string) => void
  hint?: string
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

      <div className="flex items-start gap-3">
        {/* Thumbnail — click to open the library */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Επιλογή από τη βιβλιοθήκη"
          className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-field transition-colors hover:border-ui-border-interactive"
        >
          {current ? (
            <img
              src={srcFor(current, origin)}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.opacity = "0.15"
              }}
            />
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
            placeholder="/images/… ή https://…"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button size="small" variant="secondary" type="button" onClick={() => setOpen(true)}>
              <Photo />
              Βιβλιοθήκη
            </Button>
            {current ? (
              <IconButton
                size="small"
                variant="transparent"
                type="button"
                title="Αφαίρεση"
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

function LibraryModal({
  lib,
  current,
  onPick,
  onClose,
}: {
  lib: Library | null
  current: string
  onPick: (path: string) => void
  onClose: () => void
}) {
  const [q, setQ] = useState("")
  const [folder, setFolder] = useState("all")

  const shown = useMemo(() => {
    const items = lib?.items ?? []
    const needle = q.trim().toLowerCase()
    return items.filter(
      (i) =>
        (folder === "all" || i.folder === folder) &&
        (!needle || i.name.toLowerCase().includes(needle) || i.folder.toLowerCase().includes(needle)),
    )
  }, [lib, q, folder])

  return (
    <FocusModal open onOpenChange={(o) => !o && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Text weight="plus">Βιβλιοθήκη εικόνων</Text>
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
                {(lib?.folders ?? []).map((f) => (
                  <Select.Item key={f} value={f}>
                    {f}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {lib ? `${shown.length} εικόνες` : "Φόρτωση…"}
            </Text>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {shown.map((item) => {
              const active = item.path === current
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onPick(item.path)}
                  title={`${item.path} · ${prettyBytes(item.bytes)}`}
                  className={`group flex flex-col overflow-hidden rounded-lg border text-left transition-colors ${
                    active
                      ? "border-ui-border-interactive ring-2 ring-ui-border-interactive"
                      : "border-ui-border-base hover:border-ui-border-interactive"
                  }`}
                >
                  <span className="block h-24 w-full bg-ui-bg-field">
                    <img
                      src={`${lib?.origin ?? ""}${item.path}`}
                      alt=""
                      loading="lazy"
                      className="h-24 w-full object-cover"
                    />
                  </span>
                  <span className="flex flex-col gap-0.5 p-2">
                    <Text size="xsmall" className="truncate">
                      {item.name}
                    </Text>
                    <Text size="xsmall" className="truncate text-ui-fg-muted">
                      {item.folder}
                    </Text>
                  </span>
                </button>
              )
            })}
          </div>

          {lib && !shown.length && !lib.error ? (
            <Text size="small" className="text-ui-fg-subtle">
              Καμία εικόνα δεν ταιριάζει.
            </Text>
          ) : null}
        </FocusModal.Body>

        <FocusModal.Footer>
          <Button size="small" variant="secondary" type="button" onClick={onClose}>
            Κλείσιμο
          </Button>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}
