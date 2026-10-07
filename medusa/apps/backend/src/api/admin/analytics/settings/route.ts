import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INVOICES_MODULE } from "../../../../modules/invoices"
import type InvoicesModuleService from "../../../../modules/invoices/service"
import { getAnalyticsSettings, ORDER_STATUSES, saveAnalyticsSettings } from "../../../../lib/analytics/settings"

const respond = async (req: MedusaRequest, res: MedusaResponse, settings: Awaited<ReturnType<typeof getAnalyticsSettings>>) => {
  // The VAT rate is the invoice's, shown here so the Taxes report's figures can be traced.
  const { config } = await req.scope.resolve<InvoicesModuleService>(INVOICES_MODULE).getSettings()
  res.json({ settings, statuses: ORDER_STATUSES, vat_rate: config.show_vat ? Number(config.vat_rate) || 0 : 0 })
}

/** GET /admin/analytics/settings — the analytics settings and the choices behind them. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  await respond(req, res, await getAnalyticsSettings(req.scope))
}

/** POST /admin/analytics/settings — save them; unknown values fall back to the defaults. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  await respond(req, res, await saveAnalyticsSettings(req.scope, req.body))
}
