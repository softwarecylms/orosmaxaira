import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { INVOICES_MODULE } from "../../../../modules/invoices"
import type InvoicesModuleService from "../../../../modules/invoices/service"
import { formatCode, withDefaults, type InvoiceConfig } from "../../../../lib/invoice/config"
import { renderInvoicePdf } from "../../../../lib/invoice/pdf"
import { buildSnapshot, loadOrder } from "../../../../lib/invoice/snapshot"

/** A stand-in order for previews on a shop with no orders yet. */
const SAMPLE_ORDER = {
  display_id: 1,
  email: "customer@example.com",
  currency_code: "eur",
  created_at: new Date().toISOString(),
  metadata: { customer_name: "Όνομα Πελάτη", phone: "99 000000", payment_method: "card" },
  item_subtotal: 33.8,
  discount_total: 1.69,
  shipping_total: 4.76,
  total: 36.87,
  items: [
    { product_title: "Κρέμα Σώματος", variant_sku: "5291270000950-1", unit_price: 15.9, quantity: 1 },
    { product_title: "Φυσική Κηραλοιφή για Ευαίσθητες Επιδερμίδες", variant_sku: "5291270000882", unit_price: 17.9, quantity: 1 },
  ],
  billing_address: { address_1: "Οδός 1", city: "Λευκωσία", postal_code: "2042", country_code: "cy" },
  shipping_methods: [{ name: "ACS Κύπρος" }],
}

/**
 * POST /admin/invoices/preview — { config?, logo?, order_id? } → a PDF of what
 * an invoice would look like with these (unsaved) settings, on the given order,
 * the latest order, or a sample.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<InvoicesModuleService>(INVOICES_MODULE)
  const body = (req.body ?? {}) as { config?: InvoiceConfig; logo?: string | null; order_id?: string }
  const settings = await service.getSettings()
  const config = withDefaults(body.config ?? settings.config)
  const logo = body.logo === undefined ? settings.logo : body.logo

  // Totals are only computed when the order is loaded by id, so find the latest id first.
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  let orderId = body.order_id
  if (!orderId) {
    const { data: latest } = await query.graph({
      entity: "order",
      fields: ["id"],
      pagination: { take: 1, order: { created_at: "DESC" } },
    })
    orderId = latest?.[0]?.id
  }
  const order = (orderId && (await loadOrder(req.scope, orderId))) || SAMPLE_ORDER

  const pdf = await renderInvoicePdf({
    ...buildSnapshot(order, config, logo, new Date()),
    code: formatCode(settings.next_number, config),
  })
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", 'inline; filename="preview.pdf"')
  res.send(pdf)
}
