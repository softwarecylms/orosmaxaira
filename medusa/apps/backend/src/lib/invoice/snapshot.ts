import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import type { InvoiceConfig } from "./config"

/**
 * Everything printed on an invoice, frozen when it is issued. The PDF renderer
 * reads only this — never the live order or settings — so an issued invoice
 * stays exactly as it was sent.
 */
export type InvoiceSnapshot = {
  code: string
  title: string
  seller: { name: string; details: string }
  logo: string | null
  labels: InvoiceConfig["labels"]
  vat_rate: number
  show_vat: boolean
  show_sku: boolean
  footer_text: string
  signatures: string[]
  issued_at: string
  order: { display_id: number | null; created_at: string }
  payment_method: string
  customer: {
    name: string
    lines: string[]
    email: string
    phone: string
    company: string
    vat_number: string
    acs_point: string
  }
  lines: { title: string; sku: string; quantity: number; total: number }[]
  totals: { subtotal: number; discount: number; shipping: number; total: number }
  shipping_method: string
  currency: string
  /** The customer's language for the email ("el" / "en"); the invoice itself is Greek. */
  locale: "el" | "en"
}

export const ORDER_FIELDS = [
  "id",
  "display_id",
  "email",
  "currency_code",
  "created_at",
  "metadata",
  "total",
  "item_subtotal",
  "shipping_total",
  "discount_total",
  "items.*",
  "shipping_address.*",
  "billing_address.*",
  "shipping_methods.*",
]

const COUNTRIES: Record<string, string> = { cy: "Κύπρος", gr: "Ελλάδα" }

const str = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim())
const num = (v: unknown) => {
  const n = Number((v as any)?.numeric_ ?? v)
  return Number.isFinite(n) ? n : 0
}

export async function loadOrder(container: MedusaContainer, orderId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "order", fields: ORDER_FIELDS, filters: { id: orderId } })
  return (data?.[0] ?? null) as any
}

export function buildSnapshot(order: any, config: InvoiceConfig, logo: string | null, issuedAt: Date): Omit<InvoiceSnapshot, "code"> {
  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const address = order.billing_address?.address_1 ? order.billing_address : order.shipping_address ?? {}
  const name =
    str(meta.customer_name) || [str(address.first_name), str(address.last_name)].filter(Boolean).join(" ")

  const lines = (order.items ?? []).map((item: any) => ({
    title: str(item.product_title) || str(item.title),
    sku: str(item.variant_sku),
    quantity: num(item.quantity),
    total: num(item.unit_price) * num(item.quantity),
  }))
  const itemsTotal = lines.reduce((sum: number, l: { total: number }) => sum + l.total, 0)
  const shipping = num(order.shipping_total)
  const discount = num(order.discount_total)

  const payment = str(meta.payment_method)
  return {
    title: config.title,
    seller: { name: config.shop_name, details: config.shop_details },
    logo,
    labels: config.labels,
    vat_rate: num(config.vat_rate),
    show_vat: !!config.show_vat,
    show_sku: !!config.show_sku,
    footer_text: config.footer_text,
    signatures: config.signatures
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    issued_at: issuedAt.toISOString(),
    order: { display_id: order.display_id ?? null, created_at: new Date(order.created_at).toISOString() },
    payment_method: config.payment_labels[payment] ?? payment,
    customer: {
      name,
      lines: [
        str(address.address_1),
        str(address.address_2),
        str(address.city),
        str(address.postal_code),
        COUNTRIES[str(address.country_code).toLowerCase()] ?? str(address.country_code).toUpperCase(),
      ].filter(Boolean),
      email: config.show_email ? str(order.email) : "",
      phone: config.show_phone ? str(meta.phone) || str(address.phone) : "",
      company: str(meta.company) || str(address.company),
      vat_number: str(meta.vat),
      acs_point: config.show_acs_point && str(meta.delivery) === "acs" ? str(meta.acs_point) : "",
    },
    lines,
    totals: {
      subtotal: num(order.item_subtotal) || itemsTotal,
      discount,
      shipping,
      total: num(order.total),
    },
    shipping_method: (order.shipping_methods ?? []).map((m: any) => str(m.name)).filter(Boolean).join(", "),
    currency: str(order.currency_code) || "eur",
    locale: str(meta.locale) === "en" ? "en" : "el",
  }
}
