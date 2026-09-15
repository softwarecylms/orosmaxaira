import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { findInvoice, invoicePdf, pdfFilename } from "../../../../../lib/invoice/issue"

/** GET /admin/order-invoices/:order_id/pdf[?download=1] — the invoice PDF. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const invoice = await findInvoice(req.scope, req.params.order_id)
  if (!invoice) return res.status(404).json({ message: "Η παραγγελία δεν έχει τιμολόγιο." })
  const pdf = await invoicePdf(invoice)
  const disposition = req.query.download ? "attachment" : "inline"
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `${disposition}; filename="${pdfFilename(invoice)}"`)
  res.send(pdf)
}
