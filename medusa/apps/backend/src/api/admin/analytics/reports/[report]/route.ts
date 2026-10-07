import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { buildReport, isReport } from "../../../../../lib/analytics/reports"
import { getAnalyticsSettings } from "../../../../../lib/analytics/settings"

/**
 * GET /admin/analytics/reports/:report — one «Αναλύσεις» report (overview,
 * products, revenue, orders, variations, categories, coupons, taxes).
 * Query: period (a preset or "custom" with after/before dates), compare
 * (previous_period | previous_year), interval, product_id. Anything missing
 * falls back to the analytics settings.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { report } = req.params
  if (!isReport(report)) {
    res.status(404).json({ message: "Άγνωστη αναφορά." })
    return
  }
  const settings = await getAnalyticsSettings(req.scope)
  try {
    res.json(await buildReport(req.scope, report, req.query, settings))
  } catch (e) {
    // resolvePeriod rejects bad custom dates with a message meant for the admin.
    if (e instanceof Error && /ημερομηνίες|περίοδος/.test(e.message)) {
      res.status(400).json({ message: e.message })
      return
    }
    throw e
  }
}
