import { MedusaError, Modules } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import { INVOICES_MODULE } from "../../modules/invoices"
import type InvoicesModuleService from "../../modules/invoices/service"
import { emailShell, escLines, esc, paragraph, signoff } from "../email-layout"
import { buildSnapshot, loadOrder, type InvoiceSnapshot } from "./snapshot"
import { renderInvoicePdf } from "./pdf"

/**
 * The invoice lifecycle, shared by the subscribers and the admin routes:
 *  - issue   — on order.placed: take the next number, freeze the snapshot.
 *  - refresh — rebuild the snapshot from the current order + settings, keeping
 *              the number and date (an edited order, a corrected seller block).
 *  - send    — email the PDF to the customer (on the first fulfillment, or by hand).
 */

type Invoice = {
  id: string
  order_id: string
  order_display_id: number | null
  number: number
  code: string
  issued_at: Date
  data: InvoiceSnapshot
  sent_at: Date | null
  sent_to: string | null
}

const addressList = (value: string) =>
  value
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean)

const invoices = (container: MedusaContainer) => container.resolve<InvoicesModuleService>(INVOICES_MODULE)

export async function findInvoice(container: MedusaContainer, orderId: string): Promise<Invoice | null> {
  const [invoice] = await invoices(container).listInvoices({ order_id: orderId }, { take: 1 })
  return (invoice as unknown as Invoice) ?? null
}

async function orderOrThrow(container: MedusaContainer, orderId: string) {
  const order = await loadOrder(container, orderId)
  if (!order) throw new MedusaError(MedusaError.Types.NOT_FOUND, `Order ${orderId} not found`)
  return order
}

/** The order's invoice, issuing it (with the next number) if it has none yet. */
export async function ensureInvoice(container: MedusaContainer, orderId: string): Promise<Invoice> {
  const existing = await findInvoice(container, orderId)
  if (existing) return existing

  const service = invoices(container)
  const order = await orderOrThrow(container, orderId)
  const settings = await service.getSettings()
  const issuedAt = new Date()
  try {
    await service.issueInvoice({
      order_id: orderId,
      order_display_id: order.display_id ?? null,
      issued_at: issuedAt,
      data: buildSnapshot(order, settings.config, settings.logo, issuedAt),
    })
  } catch (e) {
    // Issued concurrently (the placed subscriber and a click) — the transaction
    // rolled the counter back, so just return the one that won.
    const raced = await findInvoice(container, orderId)
    if (raced) return raced
    throw e
  }
  return (await findInvoice(container, orderId))!
}

export async function refreshInvoice(container: MedusaContainer, orderId: string): Promise<Invoice> {
  const invoice = await findInvoice(container, orderId)
  if (!invoice) return ensureInvoice(container, orderId)
  const service = invoices(container)
  const order = await orderOrThrow(container, orderId)
  const settings = await service.getSettings()
  const data = { ...buildSnapshot(order, settings.config, settings.logo, new Date(invoice.issued_at)), code: invoice.code }
  await service.updateInvoices({ id: invoice.id, data })
  return (await findInvoice(container, orderId))!
}

export const invoicePdf = (invoice: Invoice) => renderInvoicePdf(invoice.data)

export const pdfFilename = (invoice: Invoice) => `${invoice.code}.pdf`

const fill = (template: string, invoice: Invoice) =>
  template
    .replaceAll("{number}", invoice.code)
    .replaceAll("{order}", invoice.order_display_id != null ? `#${invoice.order_display_id}` : "")
    .replaceAll("{name}", invoice.data.customer.name || "")

/** Email the invoice PDF to the customer (plus the settings' copy-to list). */
export async function sendInvoice(
  container: MedusaContainer,
  orderId: string,
  options: { to?: string } = {}
): Promise<Invoice> {
  const invoice = await ensureInvoice(container, orderId)
  const { config } = await invoices(container).getSettings()
  const to = options.to?.trim() || invoice.data.customer.email || (await loadOrder(container, orderId))?.email
  if (!to) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Η παραγγελία δεν έχει email πελάτη.")

  const lang = invoice.data.locale
  const subject = fill(lang === "en" ? config.email_subject_en : config.email_subject_el, invoice)
  const body = fill(lang === "en" ? config.email_body_en : config.email_body_el, invoice)
  const html = emailShell({
    lang,
    heading: lang === "en" ? `Invoice ${invoice.code}` : `Τιμολόγιο ${invoice.code}`,
    preheader: subject,
    body:
      body
        .split(/\n{2,}/)
        .map((p) => paragraph(escLines(p)))
        .join("") +
      paragraph(
        esc(lang === "en" ? `The invoice is attached as ${pdfFilename(invoice)}.` : `Το τιμολόγιο επισυνάπτεται ως ${pdfFilename(invoice)}.`),
        "font-size:13px;"
      ) +
      signoff(lang),
  })

  const pdf = await invoicePdf(invoice)
  const recipients = [to, ...addressList(config.copy_to)]
  const notification = container.resolve<any>(Modules.NOTIFICATION)
  for (const recipient of recipients) {
    await notification.createNotifications({
      to: recipient,
      channel: "email",
      template: "order-invoice",
      content: { subject, text: body, html },
      attachments: [{ filename: pdfFilename(invoice), content: pdf.toString("base64"), content_type: "application/pdf" }],
      trigger_type: "invoice",
      resource_id: orderId,
      resource_type: "order",
    })
  }

  await invoices(container).updateInvoices({ id: invoice.id, sent_at: new Date(), sent_to: recipients.join(", ") })
  return (await findInvoice(container, orderId))!
}
