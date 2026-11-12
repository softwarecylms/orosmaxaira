import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { revalidateStorefront } from "../../../lib/storefront"

/**
 * The shop's own product order («Σειρά προϊόντων» panel on the Products page).
 *
 * ONE overall order: the position lives in `metadata.sort_rank` on the product
 * itself — one number per product, not per language, so /en always shows the
 * order /el does. The shop page follows it as is; a category page shows its
 * own products in the same relative order. A product with no rank comes after
 * the ranked ones, in the shop's old order (category, then the lead rule below).
 *
 * GET  → every product, already in the order the shop shows them now, so the
 *   panel opens on exactly what customers see.
 * POST { ids } → those products get ranks 10, 20, 30… in that order. The panel
 *   always sends the whole list.
 */

/** The shop's category order — keep in step with SHOP_CATEGORIES in the
 *  storefront (src/components/shop/shop-content.ts). */
const CATEGORY_ORDER = [
  "Μέλι", "Προϊόντα Μέλισσας", "Καλλυντικά", "Πακέτα Δώρων", "Αξεσουάρ",
  "Συνεργαζόμενες μάρκες", "Σπρέι", "Μέλι με βότανα", "Κρέμες", "Σιρόπια", "Παστίλιες",
]

/** The storefront's order for a product nobody has ranked yet (mirrors
 *  `defaultOrderRank` in shop-browser.tsx). */
function legacyRank(title: string, categories: string[]): number {
  const category = categories.find((c) => CATEGORY_ORDER.includes(c)) ?? categories[0]
  const i = category ? CATEGORY_ORDER.indexOf(category) : -1
  const cat = i < 0 ? CATEGORY_ORDER.length : i
  const lead =
    category === "Προϊόντα Μέλισσας" && (title === "Υδρόμελο" || title.startsWith("Γύρη Μελισσών")) ? 0 : 1
  return cat * 10 + lead
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "title", "thumbnail", "status", "metadata", "categories.name"],
    pagination: { take: 1000 },
  })
  const rows = data.map((p: any) => {
    const categories: string[] = (p.categories ?? []).map((c: any) => c?.name).filter(Boolean)
    const rank = typeof p.metadata?.sort_rank === "number" ? p.metadata.sort_rank : null
    return {
      id: p.id,
      title: p.title,
      thumbnail: p.thumbnail,
      status: p.status,
      hidden: p.metadata?.hidden === true || p.metadata?.hidden === "true",
      category: categories.find((c) => CATEGORY_ORDER.includes(c)) ?? categories[0] ?? null,
      sort_rank: rank,
      order: rank ?? 1_000_000_000 + legacyRank(p.title, categories),
    }
  })
  // Stable: equal keys keep Medusa's own listing order, as the shop does.
  rows.sort((a, b) => a.order - b.order)
  res.json({ products: rows.map(({ order, ...r }) => r) })
}

export async function POST(req: MedusaRequest<{ ids?: unknown }>, res: MedusaResponse) {
  const ids = Array.isArray(req.body?.ids)
    ? (req.body.ids as unknown[]).filter((x): x is string => typeof x === "string" && !!x)
    : []
  if (!ids.length) {
    res.status(400).json({ message: "ids required" })
    return
  }
  const products = req.scope.resolve(Modules.PRODUCT)
  const rows = await products.listProducts({ id: ids }, { select: ["id", "metadata"] })
  const byId = new Map(rows.map((p) => [p.id, p]))

  // Metadata is replaced as a whole on update, so carry every other key over.
  await products.upsertProducts(
    ids
      .filter((id) => byId.has(id))
      .map((id, i) => ({
        id,
        metadata: { ...(byId.get(id)!.metadata ?? {}), sort_rank: (i + 1) * 10 },
      })),
  )
  // Best effort, like every other cache ping: the shop's TTL is the fallback.
  await revalidateStorefront(["products"])
  res.json({ saved: ids.length })
}
