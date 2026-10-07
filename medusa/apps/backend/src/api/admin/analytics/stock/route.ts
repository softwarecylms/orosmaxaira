import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { loadCatalog } from "../../../../lib/analytics/data"
import { getAnalyticsSettings } from "../../../../lib/analytics/settings"

type StockStatus = "instock" | "lowstock" | "outofstock" | "onbackorder" | "untracked"

/**
 * GET /admin/analytics/stock — every variant with its sellable stock and a
 * WooCommerce-style status. "Low stock" is at or below the threshold in the
 * analytics settings; a variant that may be backordered is "on backorder"
 * once it runs out.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const [catalog, settings] = await Promise.all([loadCatalog(req.scope), getAnalyticsSettings(req.scope)])
  const threshold = settings.low_stock_threshold

  const rows = [...catalog.products.values()].flatMap((p) =>
    p.variants.map((v) => {
      const status: StockStatus =
        v.stock === null
          ? "untracked"
          : v.stock <= 0
            ? v.allow_backorder
              ? "onbackorder"
              : "outofstock"
            : v.stock <= threshold
              ? "lowstock"
              : "instock"
      return {
        id: v.id,
        product_id: p.id,
        title: p.title,
        variant_title: p.variants.length > 1 ? v.title : "",
        sku: v.sku,
        product_status: p.status,
        status,
        stock: v.stock,
      }
    })
  )
  rows.sort((a, b) => a.title.localeCompare(b.title, "el") || a.variant_title.localeCompare(b.variant_title, "el"))

  const counts: Record<StockStatus, number> = { instock: 0, lowstock: 0, outofstock: 0, onbackorder: 0, untracked: 0 }
  rows.forEach((r) => counts[r.status]++)
  res.json({ rows, counts, low_stock_threshold: threshold })
}
