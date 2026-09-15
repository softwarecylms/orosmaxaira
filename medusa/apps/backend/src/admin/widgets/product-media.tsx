import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import { ArrowLeftMini, ArrowRightMini, ArrowPath, Photo, Plus, Trash } from "@medusajs/icons"
import { Badge, Button, Container, Heading, IconButton, Text, clx, toast, usePrompt } from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { MediaPickerModal, displaySrc } from "../components/media-picker"
import { sdk } from "../lib/sdk"

/**
 * «Εικόνες προϊόντος» — replaces the core «Μέσα» section on the product page
 * with two separate fields:
 *
 *  1. «Κύρια εικόνα» — `product.thumbnail`. Saved on its own
 *     (`{ thumbnail }` only), so the images relation is never touched.
 *  2. «Συλλογή εικόνων» — the product's OWN images: every image that is not
 *     linked to a variant. Variant images are managed in the variant editor
 *     and are hidden here, but they are still product images in Medusa.
 *
 * WHY THE GALLERY SAVE IS CAREFUL. `POST /admin/products/:id { images }`
 * replaces the whole collection: any image left out is hard-deleted and the
 * DB cascades its variant links away; an entry without `id` becomes a new row.
 * So a save:
 *  - re-fetches the images (with `images.variants.id`) right before writing,
 *  - applies the user's edits as a diff (removed ids / order / new URLs) on
 *    top of that fresh list — images added or linked elsewhere meanwhile are
 *    kept,
 *  - sends EVERY image with its id; variant images stay at their positions,
 *  - refuses to send if a variant image or an unknown id would be affected.
 *
 * UX: the thumbnail saves immediately (one non-destructive string; the pick in
 * the modal is already an explicit confirmation). The gallery is a draft with
 * «Αποθήκευση» / «Ακύρωση»: removals are permanent deletes of image rows, so
 * they are batched, reviewable, confirmed, and written in a single request
 * instead of one wholesale replace per arrow click.
 *
 * PLACEMENT. There is no widget zone next to the core media section, so the
 * widget mounts in `product.details.before` and portals its card into a slot
 * inserted right before that section (found by its `/products/:id/media`
 * links), then hides the core section with a scoped CSS rule. If the section
 * can't be found, the card renders in place and nothing is hidden.
 */

const MEDIA_FIELDS =
  "id,thumbnail,images.id,images.url,images.rank,images.variants.id,-type,-collection,-options,-tags,-variants,-sales_channels"

const SLOT = "data-oros-product-media"
const HIDDEN = "data-oros-core-media-hidden"
const STYLE = "data-oros-hide-core-media"
const GIVE_UP_MS = 2000

// ─── data ────────────────────────────────────────────────────────────────────

type Img = { id: string; url: string; rank: number; variants: string[] }
type MediaState = {
  thumbnail: string | null
  images: Img[]
  /** Every image came back with a `variants` array — without it we cannot
   *  tell gallery images from variant images, so the gallery is read-only. */
  reliable: boolean
}
type GalleryItem = { id: string; url: string }
type DraftItem = { key: string; id?: string; url: string }
type ImagePayload = { id?: string; url: string }

function normalize(product: unknown): MediaState {
  const p = (product ?? {}) as { thumbnail?: string | null; images?: unknown[] | null }
  let reliable = Array.isArray(p.images)
  const images = (p.images ?? []).map((raw, index) => {
    const i = raw as { id: string; url: string; rank?: number | null; variants?: { id: string }[] | null }
    if (!Array.isArray(i.variants)) reliable = false
    return {
      id: i.id,
      url: i.url,
      rank: typeof i.rank === "number" ? i.rank : index,
      variants: (i.variants ?? []).filter(Boolean).map((v) => v.id),
    }
  })
  images.sort((a, b) => a.rank - b.rank) // stable: equal ranks keep API order
  return { thumbnail: p.thumbnail ?? null, images, reliable }
}

async function fetchMedia(productId: string): Promise<MediaState> {
  const { product } = await sdk.admin.product.retrieve(productId, { fields: MEDIA_FIELDS })
  return normalize(product)
}

const isVariantImage = (i: Img) => i.variants.length > 0
const sig = (items: { id?: string; url: string }[]) => items.map((i) => i.id ?? `url:${i.url}`).join("|")

type Plan = {
  images: ImagePayload[]
  changed: boolean
  removed: number
  keptLinked: number
  skippedDuplicates: number
  vanished: number
  variantIds: string[]
}

/**
 * The complete `images` payload for a gallery save, built on the FRESH list.
 * Pure — throws instead of producing anything that would drop a variant image.
 */
function planGalleryWrite(fresh: Img[], base: GalleryItem[], items: DraftItem[]): Plan {
  const byId = new Map(fresh.map((i) => [i.id, i]))
  const draftIds = new Set(items.flatMap((i) => (i.id ? [i.id] : [])))
  const removed = new Set(base.filter((b) => !draftIds.has(b.id)).map((b) => b.id))

  const desired: ImagePayload[] = []
  const used = new Set<string>()
  const newUrls = new Set<string>()
  let skippedDuplicates = 0
  let vanished = 0

  for (const it of items) {
    if (it.id) {
      const f = byId.get(it.id)
      if (!f) {
        vanished++ // deleted elsewhere since the page loaded
        continue
      }
      if (isVariantImage(f) || used.has(f.id)) continue // now a variant's image — it keeps its slot
      desired.push({ id: f.id, url: f.url })
      used.add(f.id)
      continue
    }
    // A new URL. Matching is by id only, so an existing URL would become a
    // duplicate row: reuse the existing gallery image instead, or skip.
    const existing = fresh.find((f) => f.url === it.url)
    if (existing) {
      if (!isVariantImage(existing) && !used.has(existing.id)) {
        desired.push({ id: existing.id, url: existing.url })
        used.add(existing.id)
      } else {
        skippedDuplicates++
      }
      continue
    }
    if (newUrls.has(it.url)) continue
    desired.push({ url: it.url })
    newUrls.add(it.url)
  }

  // Gallery images the user never saw (added elsewhere meanwhile): keep them.
  for (const f of fresh) {
    if (isVariantImage(f) || used.has(f.id) || removed.has(f.id)) continue
    desired.push({ id: f.id, url: f.url })
    used.add(f.id)
  }

  let keptLinked = 0
  let removedCount = 0
  for (const id of removed) {
    const f = byId.get(id)
    if (!f) continue
    if (isVariantImage(f)) keptLinked++
    else if (!used.has(id)) removedCount++
  }

  // Variant images keep their positions; gallery slots take the new order.
  const out: ImagePayload[] = []
  let g = 0
  for (const f of fresh) {
    if (isVariantImage(f)) out.push({ id: f.id, url: f.url })
    else if (g < desired.length) out.push(desired[g++])
  }
  while (g < desired.length) out.push(desired[g++])

  // ── invariants: never send a payload that loses a variant image ──
  const variantIds = fresh.filter(isVariantImage).map((f) => f.id)
  const outIds = out.flatMap((o) => (o.id ? [o.id] : []))
  const outIdSet = new Set(outIds)
  if (variantIds.some((id) => !outIdSet.has(id))) {
    throw new Error("Ασφαλιστική διακοπή: μια εικόνα παραλλαγής θα χανόταν. Δεν αποθηκεύτηκε τίποτα.")
  }
  if (outIdSet.size !== outIds.length || outIds.some((id) => !byId.has(id))) {
    throw new Error("Ασφαλιστική διακοπή: μη έγκυρη λίστα εικόνων. Δεν αποθηκεύτηκε τίποτα.")
  }

  const changed = out.length !== fresh.length || out.some((o, i) => o.id !== fresh[i].id)
  return { images: out, changed, removed: removedCount, keptLinked, skippedDuplicates, vanished, variantIds }
}

function errorText(e: unknown): string {
  if (e instanceof Error && e.message) return e.message
  return typeof e === "string" ? e : "Άγνωστο σφάλμα"
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

// ─── placement ───────────────────────────────────────────────────────────────

const attrValue = (s: string) => s.replace(/["\\]/g, "\\$&")

/** The core «Μέσα» Container of this product, or null. Its links are the
 *  anchor: tiles link to `…/media`, the empty state to `…/media?view=edit`. */
function findCoreMediaSection(productId: string): HTMLElement | null {
  const id = attrValue(productId)
  const links = document.querySelectorAll<HTMLAnchorElement>(
    `a[href$="/products/${id}/media"], a[href$="/products/${id}/media?view=edit"]`
  )
  for (const a of Array.from(links)) {
    if (a.closest(`[${SLOT}]`) || a.closest('[role="dialog"]')) continue
    // Tiles also carry shadow-elevation-card-rest; only the Container has bg-ui-bg-base.
    const section = a.closest<HTMLElement>(".shadow-elevation-card-rest.bg-ui-bg-base")
    if (!section?.parentElement) continue
    // Sanity: it follows the general section (the one holding the <h1> title).
    let prev = section.previousElementSibling
    while (prev && prev.hasAttribute(SLOT)) prev = prev.previousElementSibling
    if (!prev?.querySelector("h1")) continue
    return section
  }
  return null
}

function hideCss(productId: string): string {
  const id = attrValue(productId)
  return [
    `div.shadow-elevation-card-rest.bg-ui-bg-base:has(> div.grid > div > a[href$="/products/${id}/media"])`,
    `div.shadow-elevation-card-rest.bg-ui-bg-base:has(> div > a[href$="/products/${id}/media?view=edit"])`,
    `[${HIDDEN}="${id}"]`,
  ].join(",\n") + " { display: none !important; }"
}

function usePlacement(productId: string) {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [gaveUp, setGaveUp] = useState(false)

  useEffect(() => {
    let slot: HTMLElement | null = null
    let style: HTMLStyleElement | null = null
    let marked: HTMLElement | null = null
    let raf = 0

    const unhide = () => {
      style?.remove()
      style = null
      marked?.removeAttribute(HIDDEN)
      marked = null
    }

    const attach = () => {
      const section = findCoreMediaSection(productId)
      if (!section?.parentElement) return false
      slot = document.createElement("div")
      slot.setAttribute(SLOT, productId)
      section.parentElement.insertBefore(slot, section)

      style = document.createElement("style")
      style.setAttribute(STYLE, productId)
      style.textContent = hideCss(productId)
      document.head.appendChild(style)
      section.setAttribute(HIDDEN, productId)
      marked = section

      setHost(slot)
      return true
    }

    const tick = () => {
      raf = 0
      if (slot && !slot.isConnected) {
        // The page re-rendered without our slot: show the core section again
        // and the card in place until the slot can be re-created.
        slot = null
        unhide()
        setHost(null)
        setGaveUp(true)
      }
      if (!slot) attach()
    }

    attach()
    const observer = new MutationObserver(() => {
      if (!raf) raf = window.requestAnimationFrame(tick)
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const timer = window.setTimeout(() => {
      if (!slot) setGaveUp(true)
    }, GIVE_UP_MS)

    return () => {
      observer.disconnect()
      if (raf) window.cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      unhide()
      slot?.remove()
      slot = null
      setHost(null)
      setGaveUp(false)
    }
  }, [productId])

  return { host, gaveUp }
}

// ─── widget ──────────────────────────────────────────────────────────────────

const ProductMediaWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const productId = data.id
  const { host, gaveUp } = usePlacement(productId)
  const queryClient = useQueryClient()
  const prompt = usePrompt()

  // Under the dashboard's product-detail key, so its own mutations (and the
  // variant editor's invalidations) refetch this too.
  const query = useQuery({
    queryKey: ["products", "detail", productId, { query: { fields: MEDIA_FIELDS } }],
    queryFn: () => fetchMedia(productId),
  })
  const media = query.data

  const [busy, setBusy] = useState<null | "thumbnail" | "gallery">(null)
  const [picker, setPicker] = useState<null | "thumbnail" | "gallery">(null)

  const thumbnail = (media ? media.thumbnail : data.thumbnail) ?? null
  const galleryBase = useMemo<GalleryItem[]>(
    () => (media?.images ?? []).filter((i) => !isVariantImage(i)).map((i) => ({ id: i.id, url: i.url })),
    [media]
  )
  const variantImages = useMemo(() => (media?.images ?? []).filter(isVariantImage), [media])

  // Gallery draft: null = showing what is saved.
  const [draft, setDraft] = useState<{ base: GalleryItem[]; items: DraftItem[] } | null>(null)
  useEffect(() => setDraft(null), [productId])

  const items: DraftItem[] = draft?.items ?? galleryBase.map((i) => ({ key: i.id, id: i.id, url: i.url }))
  const dirty = !!draft
  const baseMoved = !!draft && sig(draft.base) !== sig(galleryBase)
  const canEditGallery = !!media?.reliable && !busy

  const edit = (fn: (current: DraftItem[], base: GalleryItem[]) => DraftItem[]) =>
    setDraft((d) => {
      const base = d?.base ?? galleryBase
      const current = d?.items ?? base.map((i) => ({ key: i.id, id: i.id, url: i.url }))
      const next = fn(current, base)
      return sig(next) === sig(base) ? null : { base, items: next }
    })

  const move = (index: number, dir: -1 | 1) =>
    edit((cur) => {
      const j = index + dir
      if (j < 0 || j >= cur.length) return cur
      const next = [...cur]
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })

  const remove = (key: string) => edit((cur) => cur.filter((i) => i.key !== key))

  const addUrls = (urls: string[]) =>
    edit((cur, base) => {
      const next = [...cur]
      for (const url of urls) {
        if (next.some((i) => i.url === url)) continue
        // Re-adding something removed in this draft: keep the existing row.
        const known = base.find((b) => b.url === url)
        next.push(known ? { key: known.id, id: known.id, url } : { key: `new:${url}`, url })
      }
      return next
    })

  const invalidate = () =>
    Promise.all(
      [["products"], ["product_variants"], ["product_variant"]].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey })
      )
    )

  const saveThumbnail = async (url: string | null) => {
    setBusy("thumbnail")
    try {
      // Only `thumbnail` — leaving `images` out means the images are not touched.
      await sdk.admin.product.update(productId, { thumbnail: url }, { fields: "id,thumbnail" })
      toast.success(url ? "Η κύρια εικόνα αποθηκεύτηκε." : "Η κύρια εικόνα αφαιρέθηκε.")
    } catch (e) {
      toast.error(`Η κύρια εικόνα δεν αποθηκεύτηκε: ${errorText(e)}`)
    } finally {
      await invalidate()
      setBusy(null)
    }
  }

  const removeThumbnail = async () => {
    const ok = await prompt({
      title: "Αφαίρεση κύριας εικόνας;",
      description:
        "Το προϊόν θα μείνει χωρίς κύρια εικόνα — το κατάστημα θα δείχνει την πρώτη εικόνα της συλλογής. Οι εικόνες της συλλογής δεν αλλάζουν.",
      confirmText: "Αφαίρεση",
      cancelText: "Άκυρο",
    })
    if (ok) await saveThumbnail(null)
  }

  const saveGallery = async () => {
    if (!draft) return
    const removedCount = draft.base.filter((b) => !draft.items.some((i) => i.id === b.id)).length
    if (removedCount) {
      const ok = await prompt({
        title: `Αφαίρεση ${plural(removedCount, "εικόνας", "εικόνων")};`,
        description:
          "Οι εικόνες που αφαιρέσατε θα διαγραφούν από το προϊόν. Η κύρια εικόνα και οι εικόνες των παραλλαγών δεν αλλάζουν.",
        confirmText: "Αποθήκευση",
        cancelText: "Άκυρο",
      })
      if (!ok) return
    }

    setBusy("gallery")
    try {
      const fresh = await fetchMedia(productId)
      if (!fresh.reliable) {
        throw new Error("Δεν ήταν δυνατό να διαβαστούν οι συνδέσεις εικόνων με παραλλαγές. Δεν αποθηκεύτηκε τίποτα.")
      }
      const plan = planGalleryWrite(fresh.images, draft.base, draft.items)
      if (!plan.changed) {
        setDraft(null)
        toast.info("Δεν υπήρχαν αλλαγές για αποθήκευση.")
        return
      }

      const { product } = await sdk.admin.product.update(productId, { images: plan.images }, { fields: MEDIA_FIELDS })

      const after = normalize(product)
      if (after.reliable) {
        const lost = plan.variantIds.filter((id) => !after.images.some((i) => i.id === id && isVariantImage(i)))
        if (lost.length) {
          toast.error(`Προσοχή: ${plural(lost.length, "εικόνα παραλλαγής", "εικόνες παραλλαγών")} δεν βρέθηκαν μετά την αποθήκευση.`)
        }
      }

      setDraft(null)
      const notes = [
        plan.keptLinked
          ? `${plural(plan.keptLinked, "εικόνα κρατήθηκε", "εικόνες κρατήθηκαν")} γιατί συνδέθηκαν στο μεταξύ με παραλλαγή`
          : "",
        plan.skippedDuplicates ? `${plural(plan.skippedDuplicates, "διπλή εικόνα παραλείφθηκε", "διπλές εικόνες παραλείφθηκαν")}` : "",
        plan.vanished ? `${plural(plan.vanished, "εικόνα είχε ήδη διαγραφεί", "εικόνες είχαν ήδη διαγραφεί")}` : "",
      ].filter(Boolean)
      toast.success("Η συλλογή εικόνων αποθηκεύτηκε.", notes.length ? { description: notes.join(" · ") } : undefined)
    } catch (e) {
      toast.error(`Η συλλογή δεν αποθηκεύτηκε: ${errorText(e)}`)
    } finally {
      await invalidate()
      setBusy(null)
    }
  }

  // ── picker inputs ──
  const allImageUrls = (media?.images ?? []).map((i) => i.url)
  const thumbnailChoices = (media?.images ?? []).map((i) => ({ id: i.id, url: i.url }))
  const galleryChoices =
    thumbnail && !allImageUrls.includes(thumbnail) && !items.some((i) => i.url === thumbnail)
      ? [{ id: "thumbnail", url: thumbnail }]
      : undefined
  const galleryDisabled = [...items.map((i) => i.url), ...variantImages.map((i) => i.url)]

  const card = (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-col">
          <Heading level="h2">Εικόνες προϊόντος</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Η κύρια εικόνα και η συλλογή που εμφανίζονται στη σελίδα του προϊόντος.
          </Text>
        </div>
        {query.isFetching && !query.isLoading ? <ArrowPath className="text-ui-fg-muted animate-spin" /> : null}
      </div>

      {/* 1 ── Κύρια εικόνα */}
      <div className="flex flex-col gap-3 px-6 py-4">
        <div className="flex flex-col">
          <Text size="small" weight="plus">
            Κύρια εικόνα
          </Text>
          <Text size="xsmall" className="text-ui-fg-subtle">
            Εμφανίζεται στις λίστες του καταστήματος και πρώτη στη σελίδα. Αποθηκεύεται αμέσως.
          </Text>
        </div>
        <div className="flex flex-wrap items-start gap-4">
          <button
            type="button"
            disabled={!!busy}
            onClick={() => setPicker("thumbnail")}
            title={thumbnail ?? "Επιλογή κύριας εικόνας"}
            className="border-ui-border-base bg-ui-bg-subtle hover:border-ui-border-interactive relative flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-colors"
          >
            {thumbnail ? (
              <img
                src={displaySrc(thumbnail)}
                alt=""
                className="h-full w-full object-contain"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.opacity = "0.15"
                }}
              />
            ) : (
              <span className="text-ui-fg-muted flex flex-col items-center gap-1">
                <Photo />
                <span className="text-xs">Χωρίς κύρια εικόνα</span>
              </span>
            )}
            {busy === "thumbnail" ? (
              <span className="bg-ui-bg-base/70 absolute inset-0 flex items-center justify-center">
                <ArrowPath className="text-ui-fg-subtle animate-spin" />
              </span>
            ) : null}
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {thumbnail ? (
              <Text size="xsmall" className="text-ui-fg-muted break-all">
                {thumbnail}
              </Text>
            ) : (
              <Text size="small" className="text-ui-fg-subtle">
                Δεν έχει οριστεί κύρια εικόνα.
              </Text>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="small"
                variant="secondary"
                type="button"
                disabled={!!busy}
                isLoading={busy === "thumbnail"}
                onClick={() => setPicker("thumbnail")}
              >
                <Photo />
                {thumbnail ? "Αντικατάσταση" : "Επιλογή εικόνας"}
              </Button>
              {thumbnail ? (
                <Button size="small" variant="transparent" type="button" disabled={!!busy} onClick={removeThumbnail}>
                  <Trash />
                  Αφαίρεση
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* 2 ── Συλλογή εικόνων */}
      <div className="flex flex-col gap-3 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <Text size="small" weight="plus">
              Συλλογή εικόνων
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Οι εικόνες των παραλλαγών διαχειρίζονται από την επεξεργασία κάθε παραλλαγής
              {variantImages.length
                ? ` (${plural(variantImages.length, "εικόνα παραλλαγής δεν εμφανίζεται", "εικόνες παραλλαγών δεν εμφανίζονται")} εδώ).`
                : "."}
            </Text>
          </div>
          <Text size="xsmall" className="text-ui-fg-muted shrink-0">
            {media ? plural(items.length, "εικόνα", "εικόνες") : ""}
          </Text>
        </div>

        {query.isLoading ? (
          <Text size="small" className="text-ui-fg-subtle">
            Φόρτωση εικόνων…
          </Text>
        ) : query.isError ? (
          <div className="flex items-center gap-3">
            <Text size="small" className="text-ui-fg-error">
              Οι εικόνες δεν φορτώθηκαν: {errorText(query.error)}
            </Text>
            <Button size="small" variant="secondary" type="button" onClick={() => query.refetch()}>
              Επανάληψη
            </Button>
          </div>
        ) : !media?.reliable ? (
          <Text size="small" className="text-ui-fg-error">
            Δεν ήταν δυνατό να διαβαστεί ποιες εικόνες ανήκουν σε παραλλαγές — η συλλογή είναι προσωρινά μόνο για
            προβολή, ώστε να μη χαθούν εικόνες παραλλαγών.
          </Text>
        ) : null}

        {media ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-3">
            {items.map((item, index) => (
              <div
                key={item.key}
                className={clx(
                  "border-ui-border-base bg-ui-bg-subtle flex flex-col overflow-hidden rounded-lg border",
                  !item.id && "border-ui-border-interactive"
                )}
              >
                <div className="bg-ui-bg-field relative aspect-square w-full">
                  <img
                    src={displaySrc(item.url)}
                    alt=""
                    loading="lazy"
                    title={item.url}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.opacity = "0.15"
                    }}
                  />
                  <span className="absolute left-1.5 top-1.5 flex flex-col items-start gap-1">
                    {item.url === thumbnail ? (
                      <Badge size="2xsmall" color="blue">
                        Κύρια
                      </Badge>
                    ) : null}
                    {!item.id ? (
                      <Badge size="2xsmall" color="green">
                        Νέα
                      </Badge>
                    ) : null}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-0.5 px-1 py-1">
                  <div className="flex items-center gap-0.5">
                    <IconButton
                      size="2xsmall"
                      variant="transparent"
                      type="button"
                      title="Μετακίνηση αριστερά"
                      disabled={!canEditGallery || index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowLeftMini />
                    </IconButton>
                    <IconButton
                      size="2xsmall"
                      variant="transparent"
                      type="button"
                      title="Μετακίνηση δεξιά"
                      disabled={!canEditGallery || index === items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowRightMini />
                    </IconButton>
                  </div>
                  <IconButton
                    size="2xsmall"
                    variant="transparent"
                    type="button"
                    title="Αφαίρεση από τη συλλογή"
                    disabled={!canEditGallery}
                    onClick={() => remove(item.key)}
                  >
                    <Trash />
                  </IconButton>
                </div>
              </div>
            ))}

            <button
              type="button"
              disabled={!canEditGallery}
              onClick={() => setPicker("gallery")}
              className="border-ui-border-strong bg-ui-bg-field text-ui-fg-muted hover:border-ui-border-interactive hover:text-ui-fg-base flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus />
              <span className="text-xs">Προσθήκη</span>
            </button>
          </div>
        ) : null}

        {dirty ? (
          <div className="border-ui-border-base bg-ui-bg-subtle flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2">
            <Text size="small" className="text-ui-fg-subtle">
              {baseMoved
                ? "Μη αποθηκευμένες αλλαγές — οι εικόνες άλλαξαν και από αλλού· θα συγχωνευθούν κατά την αποθήκευση."
                : "Μη αποθηκευμένες αλλαγές στη συλλογή."}
            </Text>
            <div className="flex items-center gap-2">
              <Button size="small" variant="secondary" type="button" disabled={!!busy} onClick={() => setDraft(null)}>
                Ακύρωση
              </Button>
              <Button
                size="small"
                type="button"
                disabled={!!busy || !media?.reliable}
                isLoading={busy === "gallery"}
                onClick={saveGallery}
              >
                Αποθήκευση
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <MediaPickerModal
        open={picker === "thumbnail"}
        title="Κύρια εικόνα"
        onClose={() => setPicker(null)}
        productImages={thumbnailChoices}
        current={thumbnail}
        confirmLabel="Ορισμός ως κύρια"
        onPick={(urls) => {
          setPicker(null)
          const url = urls[urls.length - 1]
          if (url && url !== thumbnail) void saveThumbnail(url)
        }}
      />
      <MediaPickerModal
        open={picker === "gallery"}
        title="Προσθήκη στη συλλογή"
        multiple
        onClose={() => setPicker(null)}
        productImages={galleryChoices}
        disabledUrls={galleryDisabled}
        onPick={(urls) => {
          setPicker(null)
          addUrls(urls)
        }}
      />
    </Container>
  )

  if (host) return createPortal(card, host)
  if (!gaveUp) return null
  return card
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default ProductMediaWidget
