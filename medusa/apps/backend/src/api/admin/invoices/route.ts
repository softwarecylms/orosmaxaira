import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INVOICES_MODULE } from "../../../modules/invoices"
import type InvoicesModuleService from "../../../modules/invoices/service"

/** GET /admin/invoices?limit=&offset= — issued invoices, newest first, without their snapshots. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<InvoicesModuleService>(INVOICES_MODULE)
  const limit = Math.min(Number(req.query.limit) || 50, 200)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const [rows, count] = await service.listAndCountInvoices({}, { order: { number: "DESC" }, take: limit, skip: offset })
  res.json({
    invoices: rows.map(({ data, ...invoice }) => {
      const snapshot = (data ?? {}) as any
      return { ...invoice, customer: snapshot.customer?.name ?? "", total: snapshot.totals?.total ?? null }
    }),
    count,
    limit,
    offset,
  })
}
