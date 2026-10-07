import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { instants, localDateHour, type DateRange } from "./dates"

/**
 * The raw material of every report: each order in a range, reduced to the few
 * numbers WooCommerce Analytics works with, plus the catalog (products,
 * variants, categories, stock) the product reports are grouped by.
 *
 * Orders go through Query, not SQL: Medusa keeps a row per order *version*
 * for items and summaries, and computes the totals at read time, so Query is
 * the only way to get the same figures the order page shows.
 */

// Medusa computes the totals from what is loaded, so items, adjustments, tax
// lines and shipping methods must come in full (see src/lib/klaviyo-order.ts).
const ORDER_FIELDS = [
  "id",
  "display_id",
  "status",
  "created_at",
  "email",
  "metadata",
  "item_subtotal",
  "item_discount_total",
  "shipping_total",
  "tax_total",
  "summary.*",
  "items.*",
  "items.adjustments.*",
  "items.tax_lines.*",
  "shipping_methods.*",
  "shipping_methods.adjustments.*",
  "shipping_methods.tax_lines.*",
  "shipping_address.first_name",
  "shipping_address.last_name",
  "billing_address.first_name",
  "billing_address.last_name",
  "fulfillments.id",
  "fulfillments.canceled_at",
  "fulfillments.shipped_at",
  "fulfillments.delivered_at",
]

const BATCH = 200

/** The order's progress as the admin's «Κατάσταση» widget names it (widgets/order-status.tsx). */
export type ShopStatus = "pending" | "fulfilled" | "shipped" | "delivered" | "completed" | "canceled" | "other"

export type FactLine = {
  product_id: string | null
  variant_id: string | null
  product_title: string
  variant_title: string
  sku: string
  quantity: number
  /** What the line brought in after its discounts. */
  net: number
}

export type FactDiscount = {
  /** The promotion id, or the code for an adjustment whose promotion is gone. */
  key: string
  promotion_id: string | null
  code: string
  amount: number
}

export type OrderFact = {
  id: string
  display_id: number | null
  created_at: string
  /** Calendar date and hour in Cyprus — what the buckets group by. */
  date: string
  hour: number
  status: ShopStatus
  email: string
  customer: string
  /** First order from this email address, as far as the shop's orders go back. */
  new_customer: boolean
  payment_method: string
  /** Products before discounts. */
  gross: number
  /** Product discounts (coupons and automatic promotions). */
  coupons: number
  /** The product part of refunds; a refunded shipping charge lowers `shipping` instead. */
  refunds: number
  /** gross − coupons − refunds */
  net: number
  /** Shipping charged, less any shipping refund. */
  shipping: number
  /** VAT on the products and on shipping. */
  order_tax: number
  shipping_tax: number
  /** net + shipping — what the customer paid and kept paid. */
  total: number
  items: number
  lines: FactLine[]
  discounts: FactDiscount[]
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim())
/** Medusa totals can be BigNumber objects. */
const num = (v: unknown) => {
  const n = Number((v as { numeric_?: unknown } | null)?.numeric_ ?? v)
  return Number.isFinite(n) ? n : 0
}

function shopStatus(order: any): ShopStatus {
  if (order.status === "canceled") return "canceled"
  if (order.status === "completed") return "completed"
  if (order.status !== "pending") return "other"
  const live = (order.fulfillments ?? []).filter((f: any) => f && !f.canceled_at)
  if (live.some((f: any) => f.delivered_at)) return "delivered"
  if (live.some((f: any) => f.shipped_at)) return "shipped"
  if (live.length) return "fulfilled"
  return "pending"
}

function customerName(order: any) {
  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const fromAddress = (a: any) => [str(a?.first_name), str(a?.last_name)].filter(Boolean).join(" ")
  return str(meta.customer_name) || fromAddress(order.billing_address) || fromAddress(order.shipping_address) || str(order.email)
}

/**
 * One order as report facts. The shop's prices include VAT and its orders carry
 * no tax lines, so VAT is worked out from the invoice rate, the same way the
 * invoice prints it. Should Medusa ever add tax lines, those are used instead.
 */
function toFact(order: any, vatRate: number): Omit<OrderFact, "new_customer"> {
  const { date, hour } = localDateHour(new Date(order.created_at))
  const gross = num(order.item_subtotal)
  const coupons = num(order.item_discount_total)
  const shippingCharged = num(order.shipping_total)
  const refunded = num(order.summary?.refunded_total)
  // A refund covers the products first, then the shipping charge.
  const refunds = Math.min(refunded, Math.max(gross - coupons, 0))
  const shippingRefund = Math.min(refunded - refunds, shippingCharged)
  const net = gross - coupons - refunds
  const shipping = shippingCharged - shippingRefund

  const items = (order.items ?? []) as any[]
  const shippingMethods = (order.shipping_methods ?? []) as any[]
  const taxLines = num(order.tax_total) > 0
  const included = vatRate > 0 ? vatRate / (100 + vatRate) : 0
  const order_tax = taxLines ? items.reduce((s, i) => s + num(i.tax_total), 0) : net * included
  const shipping_tax = taxLines ? shippingMethods.reduce((s, m) => s + num(m.tax_total), 0) : shipping * included

  const discounts = new Map<string, FactDiscount>()
  const addDiscount = (a: any) => {
    const amount = num(a?.amount)
    if (!amount) return
    const promotion_id = str(a.promotion_id) || null
    const code = str(a.code)
    const key = promotion_id ?? (code || "—")
    const d = discounts.get(key) ?? { key, promotion_id, code, amount: 0 }
    d.amount += amount
    discounts.set(key, d)
  }
  items.forEach((i) => (i.adjustments ?? []).forEach(addDiscount))
  shippingMethods.forEach((m) => (m.adjustments ?? []).forEach(addDiscount))

  const lines: FactLine[] = items.map((i) => ({
    product_id: str(i.product_id) || null,
    variant_id: str(i.variant_id) || null,
    product_title: str(i.product_title) || str(i.title),
    variant_title: str(i.variant_title),
    sku: str(i.variant_sku),
    quantity: num(i.quantity),
    net: num(i.total) - (taxLines && !i.is_tax_inclusive ? num(i.tax_total) : 0),
  }))

  return {
    id: order.id,
    display_id: order.display_id ?? null,
    created_at: new Date(order.created_at).toISOString(),
    date,
    hour,
    status: shopStatus(order),
    email: str(order.email).toLowerCase(),
    customer: customerName(order),
    payment_method: str(order.metadata?.payment_method),
    gross,
    coupons,
    refunds,
    net,
    shipping,
    order_tax,
    shipping_tax,
    total: net + shipping,
    items: lines.reduce((s, l) => s + l.quantity, 0),
    lines,
    discounts: [...discounts.values()],
  }
}

async function queryAll(container: MedusaContainer, fields: string[], filters: Record<string, unknown>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const out: any[] = []
  for (let skip = 0; ; skip += BATCH) {
    const { data } = await query.graph({
      entity: "order",
      fields,
      filters,
      pagination: { skip, take: BATCH, order: { created_at: "ASC" } },
    })
    out.push(...data)
    if (data.length < BATCH) return out
  }
}

const statusFilter = (excluded: string[]) => (excluded.length ? { status: { $nin: excluded } } : {})

/** Every counted order placed in the range, oldest first. */
export async function loadOrderFacts(
  container: MedusaContainer,
  range: DateRange,
  opts: { excludedStatuses: string[]; vatRate: number }
): Promise<OrderFact[]> {
  const { start, end } = instants(range)
  const orders = await queryAll(container, ORDER_FIELDS, {
    is_draft_order: false,
    created_at: { $gte: start, $lt: end },
    ...statusFilter(opts.excludedStatuses),
  })
  const facts = orders.map((o) => toFact(o, opts.vatRate))

  // New vs returning: an email seen on an earlier order is a returning customer.
  const emails = [...new Set(facts.map((f) => f.email).filter(Boolean))]
  const seen = new Set<string>()
  if (emails.length) {
    const earlier = await queryAll(container, ["id", "email"], {
      is_draft_order: false,
      email: emails,
      created_at: { $lt: start },
      ...statusFilter(opts.excludedStatuses),
    })
    earlier.forEach((o) => seen.add(str(o.email).toLowerCase()))
  }
  return facts.map((f) => {
    const new_customer = !!f.email && !seen.has(f.email)
    if (f.email) seen.add(f.email)
    return { ...f, new_customer }
  })
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export type CatalogVariant = {
  id: string
  product_id: string
  title: string
  sku: string
  manage_inventory: boolean
  allow_backorder: boolean
  /** Sellable units across locations; null when stock is not tracked. */
  stock: number | null
}

export type CatalogProduct = {
  id: string
  title: string
  handle: string
  status: string
  thumbnail: string | null
  category_ids: string[]
  variants: CatalogVariant[]
}

export type CatalogCategory = { id: string; name: string; parent_id: string | null; path: string }

export type Catalog = {
  products: Map<string, CatalogProduct>
  variants: Map<string, CatalogVariant>
  categories: Map<string, CatalogCategory>
}

/** Sellable units of a variant: the scarcest of its inventory items, per unit it needs. */
function variantStock(v: any): number | null {
  if (!v.manage_inventory) return null
  const links = ((v.inventory_items ?? []) as any[]).filter((l) => l?.inventory)
  if (!links.length) return 0
  return Math.min(
    ...links.map((l) => {
      const available = ((l.inventory.location_levels ?? []) as any[]).reduce(
        (s, lv) => s + num(lv?.stocked_quantity) - num(lv?.reserved_quantity),
        0
      )
      return Math.floor(available / Math.max(num(l.required_quantity) || 1, 1))
    })
  )
}

export async function loadCatalog(container: MedusaContainer): Promise<Catalog> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const [{ data: products }, { data: categories }] = await Promise.all([
    query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "status",
        "thumbnail",
        "categories.id",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.manage_inventory",
        "variants.allow_backorder",
        "variants.inventory_items.required_quantity",
        "variants.inventory_items.inventory.location_levels.stocked_quantity",
        "variants.inventory_items.inventory.location_levels.reserved_quantity",
      ],
    }),
    query.graph({ entity: "product_category", fields: ["id", "name", "parent_category_id"] }),
  ])

  const catMap = new Map<string, CatalogCategory>()
  for (const c of categories as any[]) {
    catMap.set(c.id, { id: c.id, name: str(c.name), parent_id: c.parent_category_id ?? null, path: str(c.name) })
  }
  for (const c of catMap.values()) {
    const names = [c.name]
    const visited = new Set([c.id])
    for (let p = c.parent_id ? catMap.get(c.parent_id) : undefined; p && !visited.has(p.id); p = p.parent_id ? catMap.get(p.parent_id) : undefined) {
      visited.add(p.id)
      names.unshift(p.name)
    }
    c.path = names.join(" › ")
  }

  const productMap = new Map<string, CatalogProduct>()
  const variantMap = new Map<string, CatalogVariant>()
  for (const p of products as any[]) {
    const variants: CatalogVariant[] = ((p.variants ?? []) as any[]).map((v) => ({
      id: v.id,
      product_id: p.id,
      title: str(v.title),
      sku: str(v.sku),
      manage_inventory: !!v.manage_inventory,
      allow_backorder: !!v.allow_backorder,
      stock: variantStock(v),
    }))
    variants.forEach((v) => variantMap.set(v.id, v))
    productMap.set(p.id, {
      id: p.id,
      title: str(p.title),
      handle: str(p.handle),
      status: str(p.status),
      thumbnail: p.thumbnail ?? null,
      category_ids: ((p.categories ?? []) as any[]).map((c) => c?.id).filter(Boolean),
      variants,
    })
  }
  return { products: productMap, variants: variantMap, categories: catMap }
}

/** The promotions behind the given ids, for the coupon report's code/type/expiry columns. */
export async function loadPromotions(container: MedusaContainer, ids: string[]) {
  if (!ids.length) return new Map<string, any>()
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "promotion",
    fields: [
      "id",
      "code",
      "type",
      "status",
      "is_automatic",
      "created_at",
      "application_method.type",
      "application_method.value",
      "application_method.target_type",
      "campaign.ends_at",
    ],
    filters: { id: ids },
  })
  return new Map((data as any[]).map((p) => [p.id, p]))
}
