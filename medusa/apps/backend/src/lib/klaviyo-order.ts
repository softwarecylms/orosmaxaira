import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { trackEvent, type KlaviyoProfile } from "./klaviyo"

/**
 * An order as Klaviyo's recommended ecommerce events (Placed Order, Ordered
 * Product, Fulfilled Order, Canceled Order, Refunded Order).
 *
 * The product id is the Greek handle everywhere: in the browser events, in the
 * catalog feed (/klaviyo-catalog.json) and here, so Klaviyo can match them. Every
 * `Items` entry carries the same fields the marketing playbook promises.
 */

const ORDER_FIELDS = [
  "id",
  "display_id",
  "email",
  "status",
  "created_at",
  "metadata",
  "total",
  "item_subtotal",
  "shipping_total",
  "discount_total",
  // Medusa computes the totals from what is loaded, so the adjustment, tax and
  // shipping lines must come in full or shipping and discounts read as zero.
  "items.*",
  "items.adjustments.*",
  "items.tax_lines.*",
  "shipping_address.*",
  "billing_address.*",
  "shipping_methods.*",
  "shipping_methods.adjustments.*",
  "shipping_methods.tax_lines.*",
]

const str = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim())
/** Medusa totals can be BigNumber objects. */
const num = (v: unknown) => {
  const n = Number((v as { numeric_?: unknown } | null)?.numeric_ ?? v)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}
/** Klaviyo rejects the whole event for a malformed phone, so only clean E.164 goes through. */
const e164 = (p: unknown) => {
  const s = str(p).replace(/[\s\-()]/g, "")
  return /^\+[1-9]\d{7,14}$/.test(s) ? s : undefined
}

const site = () => (process.env.STOREFRONT_URL || "https://orosmaxaira.com").replace(/\/$/, "")
const absolute = (url: unknown) => {
  const u = str(url)
  return !u ? undefined : /^https?:\/\//.test(u) ? u : `${site()}${u.startsWith("/") ? "" : "/"}${u}`
}

export type KlaviyoOrder = NonNullable<Awaited<ReturnType<typeof loadKlaviyoOrder>>>

export async function loadKlaviyoOrder(container: MedusaContainer, orderId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "order", fields: ORDER_FIELDS, filters: { id: orderId } })
  const order = data?.[0] as any
  if (!order?.email) return null

  const items = (order.items ?? []) as any[]
  const productIds = [...new Set(items.map((i) => i.product_id).filter(Boolean))] as string[]
  const categoriesOf = new Map<string, string[]>()
  if (productIds.length) {
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "categories.name"],
      filters: { id: productIds },
    })
    for (const p of products as any[]) {
      categoriesOf.set(p.id, (p.categories ?? []).map((c: any) => str(c?.name)).filter(Boolean))
    }
  }

  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const language = str(meta.locale) === "en" ? "en" : "el"
  const productUrl = (handle: string) => `${site()}${language === "en" ? "/en" : ""}/product/${handle}/`

  const lines = items.map((i) => {
    const handle = str(i.product_handle)
    const variant = str(i.variant_title)
    return {
      LineId: str(i.id),
      ProductID: handle || str(i.product_id),
      SKU: str(i.variant_sku) || undefined,
      ProductName: str(i.product_title) || str(i.title),
      VariantName: variant && variant !== "Default" ? variant : undefined,
      Quantity: num(i.quantity),
      ItemPrice: num(i.unit_price),
      RowTotal: num(i.unit_price) * num(i.quantity),
      ProductURL: handle ? productUrl(handle) : undefined,
      ImageURL: absolute(i.thumbnail),
      Categories: categoriesOf.get(i.product_id) ?? [],
      Brand: "Όρος Μαχαιρά",
    }
  })

  const billing = order.billing_address?.address_1 ? order.billing_address : order.shipping_address
  const address = (a: any) =>
    a && {
      FirstName: str(a.first_name),
      LastName: str(a.last_name),
      Company: str(a.company) || undefined,
      Address1: str(a.address_1),
      Address2: str(a.address_2) || undefined,
      City: str(a.city),
      Zip: str(a.postal_code),
      CountryCode: str(a.country_code).toUpperCase(),
      Phone: str(a.phone) || undefined,
    }
  const codes = [
    ...new Set(items.flatMap((i) => (i.adjustments ?? []).map((a: any) => str(a?.code)).filter(Boolean))),
  ]

  const profile: KlaviyoProfile = {
    email: str(order.email),
    first_name: str(billing?.first_name) || undefined,
    last_name: str(billing?.last_name) || undefined,
    phone_number: e164(billing?.phone ?? meta.phone),
    properties: { language },
  }

  return {
    id: str(order.id),
    status: str(order.status),
    language,
    optedIn: str(meta.marketing_opt_in) === "true",
    time: new Date(order.created_at).toISOString(),
    value: num(order.total),
    profile,
    lines,
    properties: {
      OrderId: order.display_id,
      Categories: [...new Set(lines.flatMap((l) => l.Categories))],
      ItemNames: lines.map((l) => l.ProductName),
      Brands: ["Όρος Μαχαιρά"],
      DiscountCode: codes.join(", ") || undefined,
      DiscountValue: num(order.discount_total),
      ShippingValue: num(order.shipping_total),
      ShippingMethod: str(order.shipping_methods?.[0]?.name) || undefined,
      DeliveryMethod: str(meta.delivery) || undefined,
      Items: lines,
      BillingAddress: address(billing),
      ShippingAddress: address(order.shipping_address),
      Language: language,
    },
  }
}

/**
 * Placed Order plus one Ordered Product per line. The ids are the order and
 * line ids, so running it again (a retry, the backfill) adds nothing twice.
 */
export async function sendPlacedOrder(o: KlaviyoOrder, time = o.time) {
  await trackEvent("Placed Order", o.profile, o.properties, { uniqueId: o.id, value: o.value, time })
  for (const line of o.lines) {
    await trackEvent(
      "Ordered Product",
      o.profile,
      { ...line, OrderId: o.properties.OrderId },
      { uniqueId: `${o.id}-${line.LineId}`, value: line.RowTotal, time },
    )
  }
}
