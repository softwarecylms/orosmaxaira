/** Shared types and helpers for the invoice admin (routes/invoices, widgets/order-invoice). */

export type InvoiceConfig = {
  title: string
  prefix: string
  digits: number
  shop_name: string
  shop_details: string
  vat_rate: number
  show_vat: boolean
  show_sku: boolean
  show_email: boolean
  show_phone: boolean
  show_acs_point: boolean
  labels: Record<string, string>
  payment_labels: Record<string, string>
  footer_text: string
  signatures: string
  send_on_fulfillment: boolean
  copy_to: string
  email_subject_el: string
  email_body_el: string
  email_subject_en: string
  email_body_en: string
}

export type InvoiceSettings = {
  next_number: number
  last_number: number | null
  config: InvoiceConfig
  logo: string | null
}

export type InvoiceRow = {
  id: string
  order_id: string
  order_display_id: number | null
  number: number
  code: string
  issued_at: string
  sent_at: string | null
  sent_to: string | null
  customer?: string
  customer_email?: string
  total?: number | null
}

export const formatCode = (number: number, config: Pick<InvoiceConfig, "prefix" | "digits">) =>
  `${config.prefix}${String(number).padStart(Math.max(1, Number(config.digits) || 1), "0")}`

export const pdfUrl = (orderId: string, download = false) =>
  `/admin/order-invoices/${orderId}/pdf${download ? "?download=1" : ""}`

export const dateTime = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("el-GR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Nicosia" }).format(
        new Date(iso)
      )
    : ""

/** Error text from a failed admin request. */
export const errorText = (e: unknown) => (e instanceof Error ? e.message : "Κάτι πήγε στραβά.")

/**
 * POST a JSON body and open the PDF it returns in a new tab. The tab is opened
 * before the request so the browser treats it as the click's popup.
 */
export async function openPdfFromPost(path: string, body: unknown) {
  const tab = window.open("", "_blank")
  try {
    const res = await fetch(path, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const message = await res.json().then((j) => j?.message).catch(() => null)
      throw new Error(message || `Η προεπισκόπηση απέτυχε (${res.status}).`)
    }
    const url = URL.createObjectURL(await res.blob())
    if (tab) tab.location.href = url
    else window.open(url, "_blank")
  } catch (e) {
    tab?.close()
    throw e
  }
}
