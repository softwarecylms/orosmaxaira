import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ensureInvoice, findInvoice, refreshInvoice } from "../../../../lib/invoice/issue"

const view = (invoice: Awaited<ReturnType<typeof findInvoice>>) => {
  if (!invoice) return null
  const { data, ...rest } = invoice
  return { ...rest, customer_email: data?.customer?.email ?? "" }
}

/** GET /admin/order-invoices/:order_id — the order's invoice, or null. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ invoice: view(await findInvoice(req.scope, req.params.order_id)) })
}

/**
 * POST /admin/order-invoices/:order_id — issue the invoice if the order has
 * none; with { refresh: true }, rebuild it from the current order and settings
 * (same number and date).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { refresh } = (req.body ?? {}) as { refresh?: boolean }
  const invoice = refresh
    ? await refreshInvoice(req.scope, req.params.order_id)
    : await ensureInvoice(req.scope, req.params.order_id)
  res.json({ invoice: view(invoice) })
}
