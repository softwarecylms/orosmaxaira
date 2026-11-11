import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { revalidateStorefront } from "../../../lib/storefront"

/**
 * The shop's own product order («Σειρά προϊόντων» panel on the Products page).
 *
 * The position lives in `metadata.sort_rank` on the product itself — one number
 * per product, not per language, so /en always shows the order /el does. The
 * storefront's default sort is category first, then this rank; a product with
 * no rank keeps its old place after the ranked ones.
 *
 * GET  → every product with what the panel needs to draw it.
 * POST { ids } → those products get ranks 10, 20, 30… in that order. The panel
 *   sends one category at a time, and ranks only matter within a category.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "title", "thumbnail", "status", "metadata", "categories.name"],
    pagination: { take: 1000 },
  })
  res.json({
    products: data.map((p: any) => ({
      id: p.id,
      title: p.title,
      thumbnail: p.thumbnail,
      status: p.status,
      categories: (p.categories ?? []).map((c: any) => c?.name).filter(Boolean),
      sort_rank: typeof p.metadata?.sort_rank === "number" ? p.metadata.sort_rank : null,
    })),
  })
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
