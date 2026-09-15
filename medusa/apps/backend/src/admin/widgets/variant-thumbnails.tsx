import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import { Photo } from "@medusajs/icons"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { sdk } from "../lib/sdk"

/**
 * Variant thumbnails in the product page's «Παραλλαγές» table.
 *
 * The core table already has an image column, but it only reads
 * `variant.thumbnail`, and attaching images to a variant does not set that
 * field. So most rows show the grey placeholder even when the variant has its
 * own photos. This widget shows `variant.thumbnail`, else the variant's first
 * assigned image (by rank), else a neutral placeholder, at a size you can
 * actually recognise.
 *
 * Like product-view.tsx, the admin has no widget zone inside that table. So
 * the widget mounts in `product.details.after`, renders nothing of its own, and
 * portals one thumbnail into the first cell of every row:
 *
 * - Rows carry no variant id in the DOM (the row click is a JS navigate). The
 *   id lives on the React row's key (`getRowId = row.id`), which is read from
 *   the <tr>'s fiber. If React internals ever change, rows are matched by SKU
 *   (unique) and then by title (only when unique). A row that cannot be
 *   matched is left alone rather than showing a guess.
 * - One foreign `<span data-oros-vt-slot>` is appended next to the core
 *   Thumbnail. The core one is hidden with CSS keyed on a marker attribute, not
 *   removed: React owns those nodes, and removing them would crash the page on
 *   the next re-render.
 * - A MutationObserver (rAF-batched) re-scans on pagination, search, sort and
 *   refetches. Existing slots are reused, so duplicate inserts cannot happen.
 *   Mutations caused by our own slots are ignored, so there is no feedback loop.
 * - The slot has `pointer-events: none`, so a click lands on the core cell and
 *   the row opens the variant as usual. A portal's React events would
 *   otherwise bubble to this widget instead of to the row.
 *
 * Which images belong to a variant comes from `images.variants.id`:
 * `variant.images` also contains every general product image, so it cannot
 * tell the two apart. The query key sits under ["products", "detail", id], so
 * the dashboard's own saves and the variant editor's invalidations refresh it.
 */

const MARK_CONTAINER = "data-oros-variant-thumbs"
const MARK_CELL = "data-oros-vt-cell"
const MARK_HOST = "data-oros-vt-host"
const MARK_SLOT = "data-oros-vt-slot"
const STYLE_ID = "oros-variant-thumbs-style"

const SIZE = 36
const VARIANT_PREFIX = "variant_"
const HEADINGS = ["Variants", "Παραλλαγές"]

const FIELDS =
  "id,images.id,images.url,images.rank,images.variants.id,variants.id,variants.title,variants.sku,variants.thumbnail"

const STYLES = `
[${MARK_HOST}] > :not([${MARK_SLOT}]) { display: none !important; }
[${MARK_CONTAINER}] thead th:first-child, td[${MARK_CELL}] { max-width: none !important; }
[${MARK_SLOT}] { display: inline-flex; flex-shrink: 0; pointer-events: none; }
`

type ThumbImage = { id: string; url: string; rank?: number | null; variants?: { id: string }[] | null }
type ThumbVariant = { id: string; title?: string | null; sku?: string | null; thumbnail?: string | null }
type ThumbProduct = { id: string; images?: ThumbImage[] | null; variants?: ThumbVariant[] | null }

type Info = {
  byId: Map<string, { src: string | null; alt: string }>
  bySku: Map<string, string>
  byTitle: Map<string, string>
}

type Slot = { id: string; el: HTMLElement }

/**
 * Local file-provider uploads come back as http://localhost:9000/static/…, a
 * port this backend does not use. Rewrite them to this origin for display only;
 * nothing is saved.
 */
const LOCAL_STATIC = "http://localhost:9000/static/"
function displayUrl(url: string): string {
  if (url.startsWith(LOCAL_STATIC) && window.location.port !== "9000") {
    return `${window.location.origin}/static/${url.slice(LOCAL_STATIC.length)}`
  }
  return url
}

function buildInfo(product: ThumbProduct): Info {
  const images = [...(product.images ?? [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  const byId: Info["byId"] = new Map()
  const bySku: Info["bySku"] = new Map()
  const byTitle: Info["byTitle"] = new Map()
  const dupTitles = new Set<string>()

  for (const v of product.variants ?? []) {
    const own = images.find((img) => img.variants?.some((x) => x.id === v.id))
    const src = v.thumbnail || own?.url || null
    byId.set(v.id, { src: src ? displayUrl(src) : null, alt: v.title ?? "" })

    const sku = v.sku?.trim()
    if (sku) bySku.set(sku, v.id)
    const title = v.title?.trim()
    if (title) {
      if (byTitle.has(title)) dupTitles.add(title)
      else byTitle.set(title, v.id)
    }
  }
  dupTitles.forEach((t) => byTitle.delete(t))
  return { byId, bySku, byTitle }
}

/** The variants section's card, found by its "create" link, else by its heading. */
function findVariantsContainer(productId: string): HTMLElement | null {
  const link = document.querySelector(`a[href$="/products/${CSS.escape(productId)}/variants/create"]`)
  const byLink = link?.closest<HTMLElement>(".shadow-elevation-card-rest.bg-ui-bg-base")
  if (byLink) return byLink
  for (const h2 of Array.from(document.querySelectorAll("h2"))) {
    if (HEADINGS.includes(h2.textContent?.trim() ?? "")) {
      const card = h2.closest<HTMLElement>(".shadow-elevation-card-rest.bg-ui-bg-base")
      if (card?.querySelector("table")) return card
    }
  }
  return null
}

/** The cell holding the core Thumbnail (or our slot), and its column index. */
function findThumbCell(tr: HTMLTableRowElement): { cell: HTMLTableCellElement; host: HTMLElement; index: number } | null {
  const cells = Array.from(tr.cells)
  for (let index = 0; index < cells.length; index++) {
    const host = cells[index].querySelector<HTMLElement>(":scope > div")
    if (host?.querySelector(`:scope > [${MARK_SLOT}], :scope > div.bg-ui-bg-component`)) {
      return { cell: cells[index], host, index }
    }
  }
  return null
}

type FiberLike = { key?: unknown; return?: FiberLike | null }

/** The row's React key — the variant id — read from the <tr>'s fiber. */
function fiberVariantKey(el: Element): string | null {
  const prop = Object.keys(el).find((k) => k.startsWith("__reactFiber$"))
  let fiber: FiberLike | null = prop ? ((el as unknown as Record<string, FiberLike | undefined>)[prop] ?? null) : null
  for (let hop = 0; fiber && hop < 4; hop++, fiber = fiber.return ?? null) {
    if (typeof fiber.key === "string" && fiber.key.startsWith(VARIANT_PREFIX)) return fiber.key
  }
  return null
}

function rowVariantId(tr: HTMLTableRowElement, thumbIndex: number, info: Info): string | null {
  const key = fiberVariantKey(tr)
  if (key) return info.byId.has(key) ? key : null

  const sku = tr.cells[thumbIndex + 2]?.textContent?.trim()
  if (sku && info.bySku.has(sku)) return info.bySku.get(sku)!
  const title = tr.cells[thumbIndex + 1]?.textContent?.trim()
  if (title && info.byTitle.has(title)) return info.byTitle.get(title)!
  return null
}

function sameSlots(a: Slot[], b: Slot[]): boolean {
  return a.length === b.length && a.every((s, i) => s.el === b[i].el && s.id === b[i].id)
}

/** True when a mutation only concerns our own slots (or what we portal into them). */
function isOwnMutation(m: MutationRecord): boolean {
  if (m.target instanceof Element && m.target.closest(`[${MARK_SLOT}]`)) return true
  const nodes = [...Array.from(m.addedNodes), ...Array.from(m.removedNodes)]
  return nodes.length > 0 && nodes.every((n) => n instanceof Element && n.hasAttribute(MARK_SLOT))
}

/** Removes every slot and marker under `root`, handing rows back to the core thumbnail. */
function clearMarkers(root: ParentNode) {
  root.querySelectorAll(`[${MARK_SLOT}]`).forEach((el) => el.remove())
  for (const mark of [MARK_HOST, MARK_CELL, MARK_CONTAINER]) {
    root.querySelectorAll(`[${mark}]`).forEach((el) => el.removeAttribute(mark))
  }
}

const VariantThumb = ({ src, alt }: { src: string | null; alt: string }) => {
  const [broken, setBroken] = useState(false)
  return (
    <span
      className="bg-ui-bg-component border-ui-border-base flex items-center justify-center overflow-hidden rounded-md border"
      style={{ width: SIZE, height: SIZE }}
    >
      {src && !broken ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover object-center"
          onError={() => setBroken(true)}
        />
      ) : (
        <Photo className="text-ui-fg-subtle" />
      )}
    </span>
  )
}

const VariantThumbnailsWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const productId = data.id
  const [slots, setSlots] = useState<Slot[]>([])

  const { data: result } = useQuery({
    queryKey: ["products", "detail", productId, { oros: "variant-thumbnails", updated_at: data.updated_at }],
    queryFn: () => sdk.admin.product.retrieve(productId, { fields: FIELDS }),
    placeholderData: keepPreviousData,
  })

  const info = useMemo(() => {
    const product = result?.product as unknown as ThumbProduct | undefined
    return product && product.id === productId ? buildInfo(product) : null
  }, [result, productId])

  const infoRef = useRef<Info | null>(info)
  const scheduleRef = useRef<(() => void) | null>(null)

  // New data can change which rows match and what they show.
  useEffect(() => {
    infoRef.current = info
    scheduleRef.current?.()
  }, [info])

  useEffect(() => {
    let style = document.getElementById(STYLE_ID)
    const ownStyle = !style
    if (!style) {
      style = document.createElement("style")
      style.id = STYLE_ID
      style.textContent = STYLES
      document.head.appendChild(style)
    }

    const scan = () => {
      const current = infoRef.current
      const container = findVariantsContainer(productId)
      const next: Slot[] = []

      if (container && !current) {
        // No usable data (loading another product, or a failed fetch): show the core thumbnails.
        clearMarkers(container)
        container.removeAttribute(MARK_CONTAINER)
      } else if (container && current) {
        if (!container.hasAttribute(MARK_CONTAINER)) container.setAttribute(MARK_CONTAINER, "")

        container.querySelectorAll<HTMLTableRowElement>("tbody > tr").forEach((tr) => {
          const found = findThumbCell(tr)
          if (!found) return
          const { cell, host, index } = found
          let slot = host.querySelector<HTMLElement>(`:scope > [${MARK_SLOT}]`)
          const id = rowVariantId(tr, index, current)

          if (!id) {
            // Unknown row (e.g. data not refetched yet): give it back to the core thumbnail.
            slot?.remove()
            host.removeAttribute(MARK_HOST)
            cell.removeAttribute(MARK_CELL)
            return
          }

          if (!slot) {
            slot = document.createElement("span")
            slot.setAttribute(MARK_SLOT, id)
            host.appendChild(slot)
          } else if (slot.getAttribute(MARK_SLOT) !== id) {
            slot.setAttribute(MARK_SLOT, id)
          }
          if (!host.hasAttribute(MARK_HOST)) host.setAttribute(MARK_HOST, "")
          if (!cell.hasAttribute(MARK_CELL)) cell.setAttribute(MARK_CELL, "")
          next.push({ id, el: slot })
        })
      }

      setSlots((prev) => (sameSlots(prev, next) ? prev : next))
    }

    let frame = 0
    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        scan()
      })
    }
    scheduleRef.current = schedule

    const observer = new MutationObserver((mutations) => {
      if (mutations.every(isOwnMutation)) return
      schedule()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    schedule()

    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      scheduleRef.current = null
      clearMarkers(document)
      if (ownStyle) style?.remove()
      setSlots([])
    }
  }, [productId])

  if (!info || !slots.length) return null

  const seen = new Map<string, number>()
  return (
    <>
      {slots.map((slot) => {
        const n = seen.get(slot.id) ?? 0
        seen.set(slot.id, n + 1)
        const entry = info.byId.get(slot.id)
        const src = entry?.src ?? null
        return createPortal(
          <VariantThumb key={src ?? "none"} src={src} alt={entry?.alt ?? ""} />,
          slot.el,
          `${slot.id}:${n}`
        )
      })}
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default VariantThumbnailsWidget
