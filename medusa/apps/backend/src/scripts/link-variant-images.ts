import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { batchVariantImagesWorkflow } from "@medusajs/medusa/core-flows"
import { revalidateStorefront, storefrontUrl } from "../lib/storefront"

/**
 * Backfill: give every size of the four multi-variant honeys its own picture,
 * so the photo lives on the variant («Επεξεργασία» on the 330 g → its image is
 * right there, WooCommerce-style) instead of only in the storefront's static
 * copy files.
 *
 *   npx medusa exec ./src/scripts/link-variant-images.ts dry    # plan only
 *   npx medusa exec ./src/scripts/link-variant-images.ts        # apply
 *   npx medusa exec ./src/scripts/link-variant-images.ts force  # apply to edited sizes too
 *
 * Production: run it inside the Railway environment, so the cache drop at the
 * end reaches the live site instead of a local dev server —
 *
 *   railway run --service medusa-backend \
 *     npx medusa exec ./src/scripts/link-variant-images.ts dry
 *
 * Pointing only `DATABASE_URL` at Railway's Postgres proxy from a laptop works
 * too, but then STOREFRONT_URL is still the local one: the script prints where
 * it sent the revalidation, and orosmaxaira.com has to be told separately
 * (POST {"tags":["products"]} to /api/revalidate/ with REVALIDATION_SECRET).
 *
 * What it does, per variant: links the product image for that size to the
 * variant with `batchVariantImagesWorkflow` — the same workflow the admin's
 * variant editor calls. That link is all the storefront and the admin read.
 *
 * What it never does: create, delete, reorder or re-upload a product image;
 * touch `product.thumbnail`; touch any other product; remove a link somebody
 * made in the admin (extra links are reported, not undone). It also leaves
 * `variant.thumbnail` («Κύρια εικόνα») alone on purpose: Medusa fills a new cart
 * line item's picture with `item.thumbnail ?? variant.thumbnail ??
 * product.thumbnail` (core-flows/cart/utils/prepare-line-item-data), so writing
 * it would quietly change the image on new orders — in /account/orders, in the
 * admin's order view and on the invoice. Which size photo becomes a variant's
 * main image is the shop manager's call, in the variant editor.
 *
 * Safe to re-run: a size already linked to its image is skipped, and so is a
 * size a shop manager has since given a photo of its own in the admin — putting
 * the mapping back would undo their choice and, with two photos on the variant,
 * the site would show whichever comes first in the product's image order. Those
 * sizes are printed, not written; "force" links them anyway (their own photos
 * are still left in place).
 *
 * The mapping is the storefront's own per-size images (the Greek
 * `variations.sizes` in src/components/shop/*), embedded below because
 * that file sits outside this package's rootDir and cannot be imported.
 * Nothing is trusted blindly: every size label must resolve to exactly one live
 * variant and every URL to exactly one of the product's images, or the whole
 * product is refused and printed. So if someone renames a size or re-uploads a
 * photo, the script stops instead of guessing.
 *
 * It finishes by asking the storefront to drop its cached product reads —
 * `batchVariantImagesWorkflow` emits no event, so nothing else would.
 */

/** Greek size label (the «Μέγεθος» option value) → the product image URL. */
const MAP: Record<string, Record<string, string>> = {
  "thymarisio-meli-oros-machaira": {
    "100g": "https://orosmaxaira.com/wp-content/uploads/2023/07/Oros-Maxaira-thimarisio-meli-100g-600x600.jpg",
    "330g": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-thimarisio-meli-330g-600x600.jpg",
    "480g": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-thimarisio-meli-480g-600x600.jpg",
    "500g": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-thimarisio-meli-500g-600x600.jpg",
    "790g": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-thimarisio-meli-790g-600x600.jpg",
    "3kg": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-thimarisio-meli-3kg-600x600.jpg",
  },
  "gyri-oros-machaira": {
    "230g": "https://orosmaxaira.com/wp-content/uploads/2020/11/cyprus-pollen-230.jpg",
    // Also the product thumbnail — that stays as it is; the link is additional.
    "500g": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-gyri.jpg",
  },
  "meli-antheon-oros-machaira": {
    "100g": "https://orosmaxaira.com/wp-content/uploads/2023/07/Oros-Maxaira-meli-anthewn-100g.jpg",
    "250g": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-meli-anthewn-250g.jpg",
    "330g": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-meli-anthewn-330g.jpg",
    "480g": "https://orosmaxaira.com/wp-content/uploads/2021/09/Oros-Maxaira-meli-anthewn-480g.jpg",
    "500g": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-meli-anthewn-500g.jpg",
    "790g": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-meli-anthewn-790g.jpg",
    "1Kg": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-meli-anthewn-1kg.jpg",
    "3Kg": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-meli-anthewn-3kg.jpg",
  },
  "avrasto-meli-antheon-oros-machaira": {
    "100g": "https://orosmaxaira.com/wp-content/uploads/2023/07/Oros-Maxaira-avrasto-100g.jpg",
    "500g": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-avrasto-500g.jpg",
    "790g": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-avrasto-790g.jpg",
    "3Kg": "https://orosmaxaira.com/wp-content/uploads/2020/11/Oros-Maxaira-avrasto-3kg.jpg",
  },
}

/** The product option whose values are the size labels. */
const SIZE_OPTION = "Μέγεθος"

const FIELDS = [
  "id",
  "handle",
  "title",
  "options.id",
  "options.title",
  "options.values.id",
  "options.values.value",
  "images.id",
  "images.url",
  "images.rank",
  // Which variants an image belongs to. NOT `variants.images`: Medusa fills
  // that with every *unlinked* product image as well, so it cannot tell a
  // variant's own pictures from the general ones.
  "images.variants.id",
  "variants.id",
  "variants.title",
  "variants.thumbnail",
  "variants.options.id",
  "variants.options.value",
]

type OptionValue = { id: string; value: string }
type ProductOption = { id: string; title?: string | null; values?: OptionValue[] | null }
type Image = { id: string; url: string; rank?: number | null; variants?: { id: string }[] | null }
type Variant = {
  id: string
  title?: string | null
  thumbnail?: string | null
  options?: OptionValue[] | null
}
type Product = {
  id: string
  handle: string
  title?: string | null
  options?: ProductOption[] | null
  images?: Image[] | null
  variants?: Variant[] | null
}

type Row = {
  handle: string
  label: string
  variantId: string
  variantTitle: string
  imageId: string
  imageUrl: string
  imageRank: number | null
  /** The image is already attached to this variant. */
  linked: boolean
  /** The variant's «Κύρια εικόνα», if a shop manager has set one — reported so
   *  the plan shows it, never written (see the header). */
  thumbnail: string | null
  /** Image ids attached to this variant that are not the mapped one. */
  strays: string[]
  /** Left to the admin: the size already carries a photo of its own, so the
   *  mapping is not re-applied over it (unless "force"). */
  hold: boolean
  /** Other variants sharing the mapped image. */
  shared: string[]
}

const file = (url: string) => url.split("/").pop() ?? url
const short = (id: string) => id.replace(/^(variant|img)_/, "").slice(-6)

function table(head: string[], rows: string[][]): string {
  const width = head.map((h, i) => Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length)))
  const line = (r: string[]) => r.map((c, i) => (c ?? "").padEnd(width[i])).join("  ").trimEnd()
  return [line(head), width.map((w) => "─".repeat(w)).join("  "), ...rows.map(line)].join("\n")
}

/** Mirrors the storefront's `sizeLabel()`: the «Μέγεθος» option value, else the
 *  first option value, else the variant title. */
function labelOf(v: Variant, sizeValueIds: Set<string>): string {
  const own = v.options?.find((o) => sizeValueIds.has(o.id))
  return own?.value ?? v.options?.[0]?.value ?? v.title ?? v.id
}

/** The rows to act on for one product, or a list of reasons to refuse it. */
function planProduct(
  p: Product,
  wanted: Record<string, string>,
  force: boolean,
): { rows: Row[]; refusals: string[] } {
  const refusals: string[] = []
  const images = (p.images ?? []).filter((i) => !!i.url)
  const variants = p.variants ?? []

  const sizeOption = (p.options ?? []).find((o) => o.title === SIZE_OPTION)
  const sizeValueIds = new Set((sizeOption?.values ?? []).map((v) => v.id))
  if (!sizeOption) refusals.push(`no «${SIZE_OPTION}» option — refusing this product`)

  // Two sizes must never point at the same picture.
  const byUrl = new Map<string, string[]>()
  for (const [label, url] of Object.entries(wanted)) byUrl.set(url, [...(byUrl.get(url) ?? []), label])
  for (const [url, labels] of byUrl) {
    if (labels.length > 1) refusals.push(`${file(url)} is mapped to ${labels.length} sizes (${labels.join(", ")})`)
  }

  const live = new Map<string, Variant[]>()
  for (const v of variants) {
    const label = labelOf(v, sizeValueIds)
    live.set(label, [...(live.get(label) ?? []), v])
  }
  for (const label of live.keys()) {
    if (!wanted[label]) refusals.push(`live size "${label}" has no image in the mapping`)
  }

  const rows: Row[] = []
  for (const [label, url] of Object.entries(wanted)) {
    const matches = live.get(label) ?? []
    if (matches.length !== 1) {
      refusals.push(`size "${label}" matches ${matches.length} variants (expected 1)`)
      continue
    }
    const hits = images.filter((i) => i.url === url)
    if (hits.length !== 1) {
      refusals.push(`${file(url)} matches ${hits.length} product images (expected 1)`)
      continue
    }
    const v = matches[0]
    const img = hits[0]
    const linkedTo = (id: string) => images.filter((i) => (i.variants ?? []).some((x) => x.id === id))
    const strays = linkedTo(v.id)
      .filter((i) => i.id !== img.id)
      .map((i) => i.id)
    rows.push({
      handle: p.handle,
      label,
      variantId: v.id,
      variantTitle: v.title ?? label,
      imageId: img.id,
      imageUrl: img.url,
      imageRank: img.rank ?? null,
      linked: (img.variants ?? []).some((x) => x.id === v.id),
      thumbnail: v.thumbnail ?? null,
      strays,
      hold: strays.length > 0 && !force,
      shared: (img.variants ?? []).map((x) => x.id).filter((id) => id !== v.id),
    })
  }
  return { rows, refusals }
}

async function load(container: ExecArgs["container"], handles: string[]): Promise<Map<string, Product>> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "product", fields: FIELDS, filters: { handle: handles } })
  return new Map((data as unknown as Product[]).map((p) => [p.handle, p]))
}

export default async function linkVariantImages({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const dry = args.includes("dry")
  const force = args.includes("force")
  const handles = Object.keys(MAP)

  const products = await load(container, handles)

  const plans: Row[] = []
  const refusals: string[] = []
  for (const handle of handles) {
    const p = products.get(handle)
    if (!p) {
      refusals.push(`${handle}: not found`)
      continue
    }
    const { rows, refusals: bad } = planProduct(p, MAP[handle], force)
    if (bad.length) {
      // Refuse the whole product: a half-mapped product is worse than none.
      for (const r of bad) refusals.push(`${handle}: ${r}`)
      continue
    }
    plans.push(...rows)
  }

  if (refusals.length) {
    logger.warn(`Skipped ${refusals.length} ambiguous mapping(s):\n  ${refusals.join("\n  ")}`)
  }
  for (const r of plans) {
    if (r.strays.length) {
      const also = `also linked to ${r.strays.length} other image(s) (${r.strays.map(short).join(", ")})`
      logger.warn(
        r.hold
          ? `${r.handle} ${r.label}: ${also} — somebody has set this size's photo in the admin, so it is left alone. Re-run with "force" to put the mapped image on it as well.`
          : `${r.handle} ${r.label}: ${also} — left in place, untick them in the admin if they are wrong.`,
      )
    }
    if (r.shared.length) {
      logger.warn(
        `${r.handle} ${r.label}: ${file(r.imageUrl)} is also on variant(s) ${r.shared.map(short).join(", ")}.`,
      )
    }
  }

  const todo = plans.filter((r) => !r.linked && !r.hold)
  const held = plans.filter((r) => r.hold)
  logger.info(
    `Plan (${plans.length} sizes across ${new Set(plans.map((r) => r.handle)).size} products, ` +
      `${todo.length} to change):\n` +
      table(
        ["product", "size", "variant", "image", "rank", "now", "after", "main image"],
        plans.map((r) => [
          r.handle,
          r.label,
          short(r.variantId),
          file(r.imageUrl),
          r.imageRank === null ? "—" : String(r.imageRank),
          r.linked ? "linked" : "—",
          r.hold ? "left to the admin" : r.linked ? "unchanged" : "linked",
          r.thumbnail ? file(r.thumbnail) : "— (not set, left alone)",
        ]),
      ),
  )

  if (!todo.length) {
    logger.info(
      held.length
        ? `Nothing to write — ${plans.length - held.length} size(s) already carry their image, ${held.length} left to the admin.`
        : "Nothing to do — every size already carries its image.",
    )
    return
  }
  if (dry) {
    logger.info(`Dry run — nothing written. Re-run without "dry" to apply.`)
    return
  }

  let linked = 0
  for (const r of todo) {
    // `add` only: never remove a link — a removal is also what would clear the
    // variant's main image inside this workflow.
    await batchVariantImagesWorkflow(container).run({
      input: { variant_id: r.variantId, add: [r.imageId] },
    })
    linked++
    logger.info(`${r.handle} · ${r.label} → ${file(r.imageUrl)}`)
  }

  // Read the rows back rather than trusting the writes.
  const after = await load(container, handles)
  const check: string[][] = []
  let wrong = 0
  for (const r of plans.filter((x) => !x.hold)) {
    const p = after.get(r.handle)
    const img = (p?.images ?? []).find((i) => i.id === r.imageId)
    const v = (p?.variants ?? []).find((x) => x.id === r.variantId)
    const isLinked = (img?.variants ?? []).some((x) => x.id === r.variantId)
    if (!isLinked) wrong++
    check.push([
      r.handle,
      r.label,
      short(r.variantId),
      file(r.imageUrl),
      isLinked ? "linked" : "NOT LINKED",
      v?.thumbnail ? file(v.thumbnail) : "—",
    ])
  }
  logger.info(
    `After (${linked} image link(s) written):\n` +
      table(["product", "size", "variant", "image", "link", "main image"], check),
  )
  if (wrong) throw new Error(`${wrong} variant(s) did not end up with their image — see the table above.`)

  // `batchVariantImagesWorkflow` emits no event, so nothing else tells the
  // storefront to drop its cached product reads (the middleware in
  // src/api/middlewares.ts only covers the admin's own route).
  const tags = ["products", ...handles.map((h) => `product-${h}`)]
  const ok = await revalidateStorefront(tags)
  logger.info(
    ok
      ? `Storefront cache dropped at ${storefrontUrl()} (${tags.join(", ")}).`
      : `Could not drop the storefront cache at ${storefrontUrl()} — POST {"tags":["products"]} to the live site's /api/revalidate/ yourself, or the pages keep the old photos until their TTL.`,
  )
  logger.info("Done. Re-run to confirm it reports nothing to do.")
}
