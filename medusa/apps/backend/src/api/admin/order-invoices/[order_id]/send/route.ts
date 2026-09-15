import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { sendInvoice } from "../../../../../lib/invoice/issue"

/** POST /admin/order-invoices/:order_id/send — { to? } — email the invoice (issuing it if needed). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { to } = (req.body ?? {}) as { to?: string }
  const { data, ...invoice } = await sendInvoice(req.scope, req.params.order_id, { to })
  res.json({ invoice })
}
