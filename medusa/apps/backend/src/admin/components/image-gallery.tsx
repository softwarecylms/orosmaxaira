import { useState } from "react"
import { IconButton, Label, Text } from "@medusajs/ui"
import { Plus, Trash, Photo, ArrowLeftMini, ArrowRightMini } from "@medusajs/icons"
import { useLibrary } from "../lib/storefront"
import { LibraryModal } from "./image-picker"

/**
 * Compact gallery editor — a grid of thumbnails rather than a stacked card per
 * image. Activities carry 9–11 gallery images, which as full-width rows pushed
 * everything below them off the screen.
 *
 * Each tile: click the image to swap it from the library, use the arrows to
 * reorder, the bin to remove, and the small field underneath for alt text. The
 * trailing "+" tile appends.
 *
 * The stored shape is unchanged — `{ url, alt }[]`, exactly what the Repeater
 * produced before.
 */

export type GalleryItem = { url: string; alt?: string } & Record<string, unknown>

export function ImageGallery({
  label,
  value,
  onChange,
}: {
  label: string
  value: GalleryItem[] | null | undefined
  onChange: (next: GalleryItem[]) => void
}) {
  const rows = value ?? []
  const lib = useLibrary()
  const origin = lib?.origin ?? ""
  // index being picked for; -1 = appending; null = modal closed
  const [picking, setPicking] = useState<number | null>(null)

  const set = (i: number, patch: Partial<GalleryItem>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= rows.length) return
    const next = [...rows]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  const src = (u: string) =>
    !u ? "" : /^https?:\/\//i.test(u) ? u : `${origin}${u.startsWith("/") ? "" : "/"}${u}`

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label weight="plus">{label}</Label>
        <Text size="xsmall" className="text-ui-fg-muted">
          {rows.length} εικόνες
        </Text>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
        {rows.map((row, i) => (
          <div
            key={i}
            className="group relative flex flex-col gap-1 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-1"
          >
            <button
              type="button"
              title="Αλλαγή εικόνας"
              onClick={() => setPicking(i)}
              className="relative block h-[74px] w-full overflow-hidden rounded bg-ui-bg-field"
            >
              {row.url ? (
                <img
                  src={src(String(row.url))}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.opacity = "0.15"
                  }}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-ui-fg-muted">
                  <Photo />
                </span>
              )}
            </button>

            {/* Controls — visible on hover / keyboard focus */}
            <div className="pointer-events-none absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <IconButton
                size="2xsmall"
                variant="primary"
                type="button"
                title="Μετακίνηση αριστερά"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <ArrowLeftMini />
              </IconButton>
              <IconButton
                size="2xsmall"
                variant="primary"
                type="button"
                title="Μετακίνηση δεξιά"
                disabled={i === rows.length - 1}
                onClick={() => move(i, 1)}
              >
                <ArrowRightMini />
              </IconButton>
              <IconButton
                size="2xsmall"
                variant="primary"
                type="button"
                title="Αφαίρεση"
                onClick={() => onChange(rows.filter((_, j) => j !== i))}
              >
                <Trash />
              </IconButton>
            </div>

            <input
              value={String(row.alt ?? "")}
              placeholder="Alt"
              title="Εναλλακτικό κείμενο (alt)"
              onChange={(e) => set(i, { alt: e.target.value })}
              className="w-full rounded border border-ui-border-base bg-ui-bg-field px-1.5 py-1 text-[11px] outline-none focus:border-ui-border-interactive"
            />
          </div>
        ))}

        {/* Append tile */}
        <button
          type="button"
          title="Προσθήκη εικόνας"
          onClick={() => setPicking(-1)}
          className="flex h-[74px] flex-col items-center justify-center gap-1 self-start rounded-lg border border-dashed border-ui-border-strong bg-ui-bg-field text-ui-fg-muted transition-colors hover:border-ui-border-interactive hover:text-ui-fg-base"
        >
          <Plus />
          <span className="text-[11px]">Προσθήκη</span>
        </button>
      </div>

      {rows.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          Καμία εικόνα ακόμη.
        </Text>
      ) : null}

      {picking !== null ? (
        <LibraryModal
          lib={lib}
          current={picking >= 0 ? String(rows[picking]?.url ?? "") : ""}
          onClose={() => setPicking(null)}
          onPick={(path) => {
            if (picking >= 0) set(picking, { url: path })
            else onChange([...rows, { url: path, alt: "" }])
            setPicking(null)
          }}
        />
      ) : null}
    </div>
  )
}
