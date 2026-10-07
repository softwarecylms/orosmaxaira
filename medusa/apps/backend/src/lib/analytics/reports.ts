import type { MedusaContainer } from "@medusajs/framework/types"
import { INVOICES_MODULE } from "../../modules/invoices"
import type InvoicesModuleService from "../../modules/invoices/service"
import { loadCatalog, loadOrderFacts, loadPromotions, type Catalog, type FactLine, type OrderFact } from "./data"
import {
  bucketKey,
  bucketsFor,
  compareRange,
  intervalsFor,
  INTERVALS,
  PRESETS,
  resolvePeriod,
  type CompareMode,
  type DateRange,
  type Interval,
  type Period,
  type Preset,
} from "./dates"
import type { AnalyticsSettings } from "./settings"

/**
 * The reports behind «Αναλύσεις», modelled on WooCommerce Analytics. Every
 * report answers with the same frame — the range and the one it is compared
 * with, KPI totals for both, the same totals per day/week/month for the chart —
 * plus the rows of its own table.
 *
 * Definitions (as in WooCommerce):
 *  - gross sales  products before discounts
 *  - coupons      product discounts
 *  - returns      refunded product value (a refunded shipping charge lowers shipping)
 *  - net sales    gross − returns − coupons
 *  - total sales  net sales + shipping, i.e. what customers paid and kept paid
 *  - taxes        the VAT included in those amounts (prices include VAT)
 *  - average order value = net sales / orders
 */

export const REPORTS = ["overview", "products", "revenue", "orders", "variations", "categories", "coupons", "taxes"] as const
export type Report = (typeof REPORTS)[number]
export const isReport = (v: unknown): v is Report => REPORTS.includes(v as Report)

export type Totals = Record<string, number>

export type ReportQuery = {
  period?: unknown
  compare?: unknown
  after?: unknown
  before?: unknown
  interval?: unknown
  product_id?: unknown
}

const money = (n: number) => Math.round(n * 100) / 100
const LEADERBOARD_SIZE = 5

/** A line from a product with more than one variant — WooCommerce's "variation". */
const isVariation = (catalog: Catalog, line: FactLine) => {
  const product = line.product_id ? catalog.products.get(line.product_id) : undefined
  if (product) return product.variants.length > 1
  return !!line.variant_title && line.variant_title.toLowerCase() !== "default"
}

// ---------------------------------------------------------------------------
// Totals
// ---------------------------------------------------------------------------

function orderTotals(facts: OrderFact[], catalog: Catalog): Totals {
  const t = {
    orders: facts.length,
    gross_sales: 0,
    refunds: 0,
    coupons: 0,
    net_sales: 0,
    shipping: 0,
    taxes: 0,
    order_tax: 0,
    shipping_tax: 0,
    total_sales: 0,
    items_sold: 0,
    variations_sold: 0,
    new_customers: 0,
    returning_customers: 0,
    avg_order_value: 0,
    avg_items_per_order: 0,
  }
  for (const f of facts) {
    t.gross_sales += f.gross
    t.refunds += f.refunds
    t.coupons += f.coupons
    t.net_sales += f.net
    t.shipping += f.shipping
    t.order_tax += f.order_tax
    t.shipping_tax += f.shipping_tax
    t.total_sales += f.total
    t.items_sold += f.items
    t.variations_sold += f.lines.filter((l) => isVariation(catalog, l)).reduce((s, l) => s + l.quantity, 0)
    if (f.new_customer) t.new_customers++
    else t.returning_customers++
  }
  t.taxes = t.order_tax + t.shipping_tax
  t.avg_order_value = t.orders ? t.net_sales / t.orders : 0
  t.avg_items_per_order = t.orders ? t.items_sold / t.orders : 0
  return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, money(v)]))
}

function lineTotals(facts: OrderFact[], match: (line: FactLine) => boolean): Totals {
  let items_sold = 0
  let net_sales = 0
  let orders = 0
  for (const f of facts) {
    const lines = f.lines.filter(match)
    if (!lines.length) continue
    orders++
    for (const l of lines) {
      items_sold += l.quantity
      net_sales += l.net
    }
  }
  return { items_sold, net_sales: money(net_sales), orders }
}

function couponTotals(facts: OrderFact[]): Totals {
  const discounted = facts.filter((f) => f.discounts.length)
  return {
    discounted_orders: discounted.length,
    discount_amount: money(discounted.reduce((s, f) => s + f.discounts.reduce((a, d) => a + d.amount, 0), 0)),
  }
}

// ---------------------------------------------------------------------------
// Table rows
// ---------------------------------------------------------------------------

type Group = { items_sold: number; net_sales: number; orders: Set<string> }
const group = (): Group => ({ items_sold: 0, net_sales: 0, orders: new Set() })
const add = (g: Group, f: OrderFact, l: FactLine) => {
  g.items_sold += l.quantity
  g.net_sales += l.net
  g.orders.add(f.id)
}
const counts = (g: Group) => ({ items_sold: g.items_sold, net_sales: money(g.net_sales), orders: g.orders.size })

function productRows(facts: OrderFact[], catalog: Catalog, match: (l: FactLine) => boolean) {
  const groups = new Map<string, Group & { line: FactLine }>()
  for (const f of facts) {
    for (const l of f.lines.filter(match)) {
      const key = l.product_id ?? `title:${l.product_title}`
      const g = groups.get(key) ?? { ...group(), line: l }
      add(g, f, l)
      groups.set(key, g)
    }
  }
  return [...groups.entries()].map(([key, g]) => {
    const p = g.line.product_id ? catalog.products.get(g.line.product_id) : undefined
    const tracked = p?.variants.filter((v) => v.stock !== null) ?? []
    return {
      id: key,
      product_id: p?.id ?? null,
      title: p?.title || g.line.product_title,
      thumbnail: p?.thumbnail ?? null,
      sku: p ? p.variants.map((v) => v.sku).filter(Boolean).join(", ") : g.line.sku,
      ...counts(g),
      categories: (p?.category_ids ?? []).map((id) => catalog.categories.get(id)?.path).filter(Boolean),
      variations: p && p.variants.length > 1 ? p.variants.length : 0,
      status: p?.status ?? "deleted",
      stock: tracked.length ? tracked.reduce((s, v) => s + (v.stock ?? 0), 0) : null,
    }
  })
}

function variationRows(facts: OrderFact[], catalog: Catalog, match: (l: FactLine) => boolean) {
  const groups = new Map<string, Group & { line: FactLine }>()
  for (const f of facts) {
    for (const l of f.lines.filter(match)) {
      const key = l.variant_id ?? `title:${l.product_title}/${l.variant_title}`
      const g = groups.get(key) ?? { ...group(), line: l }
      add(g, f, l)
      groups.set(key, g)
    }
  }
  return [...groups.entries()].map(([key, g]) => {
    const v = g.line.variant_id ? catalog.variants.get(g.line.variant_id) : undefined
    const p = v ? catalog.products.get(v.product_id) : g.line.product_id ? catalog.products.get(g.line.product_id) : undefined
    return {
      id: key,
      product_id: p?.id ?? null,
      variant_id: v?.id ?? null,
      title: p?.title || g.line.product_title,
      variant_title: v?.title || g.line.variant_title,
      sku: v?.sku || g.line.sku,
      ...counts(g),
      status: p?.status ?? "deleted",
      stock: v ? v.stock : null,
      manage_inventory: v?.manage_inventory ?? false,
    }
  })
}

const UNCATEGORISED = "uncategorised"

function categoryRows(facts: OrderFact[], catalog: Catalog) {
  const groups = new Map<string, Group & { products: Set<string> }>()
  for (const f of facts) {
    for (const l of f.lines) {
      const p = l.product_id ? catalog.products.get(l.product_id) : undefined
      const ids = p?.category_ids.length ? p.category_ids : [UNCATEGORISED]
      for (const id of ids) {
        const g = groups.get(id) ?? { ...group(), products: new Set<string>() }
        add(g, f, l)
        g.products.add(l.product_id ?? l.product_title)
        groups.set(id, g)
      }
    }
  }
  return [...groups.entries()].map(([id, g]) => ({
    id,
    category_id: id === UNCATEGORISED ? null : id,
    name: id === UNCATEGORISED ? "Χωρίς κατηγορία" : catalog.categories.get(id)?.path ?? "Διαγραμμένη κατηγορία",
    ...counts(g),
    products: g.products.size,
  }))
}

async function couponRows(container: MedusaContainer, facts: OrderFact[]) {
  const groups = new Map<string, { code: string; promotion_id: string | null; amount: number; orders: Set<string> }>()
  for (const f of facts) {
    for (const d of f.discounts) {
      const g = groups.get(d.key) ?? { code: d.code, promotion_id: d.promotion_id, amount: 0, orders: new Set<string>() }
      g.amount += d.amount
      g.orders.add(f.id)
      groups.set(d.key, g)
    }
  }
  const ids = [...groups.values()].map((g) => g.promotion_id).filter((id): id is string => !!id)
  const promotions = await loadPromotions(container, ids)
  return [...groups.entries()].map(([key, g]) => {
    const p = g.promotion_id ? promotions.get(g.promotion_id) : undefined
    return {
      id: key,
      promotion_id: p?.id ?? null,
      code: p?.code || g.code || "—",
      /** The code the orders were placed with, when the promotion has since been renamed. */
      used_code: g.code && p?.code && g.code !== p.code ? g.code : null,
      orders: g.orders.size,
      amount: money(g.amount),
      created_at: p?.created_at ?? null,
      ends_at: p?.campaign?.ends_at ?? null,
      is_automatic: !!p?.is_automatic,
      method: p?.application_method?.type ?? null,
      value: p?.application_method?.value != null ? Number(p.application_method.value) : null,
      target: p?.application_method?.target_type ?? null,
      status: p?.status ?? "deleted",
    }
  })
}

function taxRows(facts: OrderFact[], vatRate: number, t: Totals) {
  if (!facts.length) return []
  return [
    {
      id: "vat",
      name: "ΦΠΑ",
      rate: vatRate,
      taxes: t.taxes,
      order_tax: t.order_tax,
      shipping_tax: t.shipping_tax,
      orders: facts.filter((f) => f.order_tax + f.shipping_tax > 0).length,
    },
  ]
}

function orderRows(facts: OrderFact[]) {
  return facts
    .map((f) => ({
      id: f.id,
      display_id: f.display_id,
      created_at: f.created_at,
      status: f.status,
      customer: f.customer,
      email: f.email,
      new_customer: f.new_customer,
      products: f.lines.map((l) => ({
        title: l.variant_title && l.variant_title.toLowerCase() !== "default" ? `${l.product_title} — ${l.variant_title}` : l.product_title,
        quantity: l.quantity,
      })),
      items_sold: f.items,
      coupons: f.discounts.map((d) => d.code).filter(Boolean),
      net_sales: money(f.net),
      total: money(f.total),
      payment_method: f.payment_method,
    }))
    .reverse()
}

function leaderboards(facts: OrderFact[], catalog: Catalog) {
  const top = <T extends Record<string, unknown>>(rows: T[], key: keyof T) =>
    [...rows].sort((a, b) => Number(b[key]) - Number(a[key])).slice(0, LEADERBOARD_SIZE)

  const customers = new Map<string, { name: string; email: string; orders: number; total: number }>()
  for (const f of facts) {
    const key = f.email || f.customer
    const c = customers.get(key) ?? { name: f.customer, email: f.email, orders: 0, total: 0 }
    c.orders++
    c.total += f.total
    customers.set(key, c)
  }
  const coupons = new Map<string, { code: string; orders: number; amount: number }>()
  for (const f of facts) {
    for (const d of f.discounts) {
      const c = coupons.get(d.key) ?? { code: d.code || "—", orders: 0, amount: 0 }
      c.orders++
      c.amount += d.amount
      coupons.set(d.key, c)
    }
  }
  return {
    products: top(productRows(facts, catalog, () => true), "items_sold"),
    categories: top(categoryRows(facts, catalog), "items_sold"),
    coupons: top([...coupons.values()].map((c) => ({ ...c, amount: money(c.amount) })), "orders"),
    customers: top([...customers.values()].map((c) => ({ ...c, total: money(c.total) })), "total"),
  }
}

// ---------------------------------------------------------------------------
// The report
// ---------------------------------------------------------------------------

export async function buildReport(
  container: MedusaContainer,
  report: Report,
  q: ReportQuery,
  settings: AnalyticsSettings
) {
  const period: Period =
    q.period === "custom" || PRESETS.includes(q.period as Preset) ? (q.period as Period) : settings.default_period
  const compare: CompareMode =
    q.compare === "previous_period" || q.compare === "previous_year" ? q.compare : settings.default_compare
  const range: DateRange = resolvePeriod(period, q.after, q.before)
  const previousRange = compareRange(period, range, compare)
  const { allowed, fallback } = intervalsFor(range)
  const interval: Interval =
    INTERVALS.includes(q.interval as Interval) && allowed.includes(q.interval as Interval) ? (q.interval as Interval) : fallback

  const invoices = container.resolve<InvoicesModuleService>(INVOICES_MODULE)
  const { config } = await invoices.getSettings()
  const vatRate = config.show_vat ? Number(config.vat_rate) || 0 : 0
  const opts = { excludedStatuses: settings.excluded_statuses, vatRate }

  const [current, previous, catalog] = await Promise.all([
    loadOrderFacts(container, range, opts),
    loadOrderFacts(container, previousRange, opts),
    loadCatalog(container),
  ])

  const productId = typeof q.product_id === "string" && q.product_id ? q.product_id : null
  const ofProduct = (l: FactLine) => !productId || l.product_id === productId

  const totalsOf: (facts: OrderFact[]) => Totals =
    report === "products" || report === "categories"
      ? (facts) => lineTotals(facts, ofProduct)
      : report === "variations"
        ? (facts) => lineTotals(facts, (l) => ofProduct(l) && isVariation(catalog, l))
        : report === "coupons"
          ? couponTotals
          : (facts) => orderTotals(facts, catalog)

  const buckets = bucketsFor(range, interval)
  const previousBuckets = bucketsFor(previousRange, interval)
  const byBucket = (facts: OrderFact[]) => {
    const map = new Map<string, OrderFact[]>()
    for (const f of facts) {
      const key = bucketKey(f.date, f.hour, interval)
      const list = map.get(key)
      if (list) list.push(f)
      else map.set(key, [f])
    }
    return map
  }
  const currentByBucket = byBucket(current)
  const previousByBucket = byBucket(previous)

  const totals = { current: totalsOf(current), previous: totalsOf(previous) }
  const intervals = buckets.map((b, i) => {
    const pb = previousBuckets[i]
    return {
      key: b.key,
      from: b.from,
      to: b.to,
      current: totalsOf(currentByBucket.get(b.key) ?? []),
      previous_from: pb?.from ?? null,
      previous_to: pb?.to ?? null,
      previous: pb ? totalsOf(previousByBucket.get(pb.key) ?? []) : null,
    }
  })

  let rows: unknown[] = []
  let rowsKind: string = report
  switch (report) {
    case "products":
      if (productId) {
        rows = variationRows(current, catalog, ofProduct)
        rowsKind = "variations"
      } else rows = productRows(current, catalog, () => true)
      break
    case "variations":
      rows = variationRows(current, catalog, (l) => ofProduct(l) && isVariation(catalog, l))
      break
    case "categories":
      rows = categoryRows(current, catalog)
      break
    case "coupons":
      rows = await couponRows(container, current)
      break
    case "taxes":
      rows = taxRows(current, vatRate, totals.current)
      break
    case "orders":
      rows = orderRows(current)
      break
  }

  const products =
    report === "products" || report === "variations"
      ? [...catalog.products.values()]
          .filter((p) => report === "products" || p.variants.length > 1)
          .map((p) => ({ id: p.id, title: p.title }))
          .sort((a, b) => a.title.localeCompare(b.title, "el"))
      : undefined

  return {
    report,
    period,
    compare,
    range,
    compare_range: previousRange,
    interval,
    intervals_allowed: allowed,
    product_id: productId,
    vat_rate: vatRate,
    totals,
    intervals,
    rows,
    rows_kind: rowsKind,
    leaderboards: report === "overview" ? leaderboards(current, catalog) : undefined,
    products,
  }
}
