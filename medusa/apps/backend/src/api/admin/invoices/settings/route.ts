import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INVOICES_MODULE } from "../../../../modules/invoices"
import type InvoicesModuleService from "../../../../modules/invoices/service"
import type { InvoiceConfig } from "../../../../lib/invoice/config"

/** GET /admin/invoices/settings — the invoice layout, texts, logo and next number. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<InvoicesModuleService>(INVOICES_MODULE)
  res.json({ settings: await service.getSettings() })
}

/** POST /admin/invoices/settings — { config?, logo? (data URL or null), next_number? }. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<InvoicesModuleService>(INVOICES_MODULE)
  const body = (req.body ?? {}) as { config?: InvoiceConfig; logo?: string | null; next_number?: number }
  if (body.logo && !/^data:image\/(png|jpe?g);base64,/.test(body.logo)) {
    return res.status(400).json({ message: "Το λογότυπο πρέπει να είναι εικόνα PNG ή JPG." })
  }
  const settings = await service.saveSettings({
    config: body.config,
    logo: body.logo,
    next_number: body.next_number == null ? undefined : Number(body.next_number),
  })
  res.json({ settings })
}
