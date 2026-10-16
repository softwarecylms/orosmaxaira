import { sdk } from "./sdk"

/**
 * Price lists, and the «Τιμή έκπτωσης» (discounted price) built on one of them.
 *
 * A variant's discounted price is its price in ONE sale price list that the
 * variant drawer manages, created on the first discount. Medusa charges the
 * lower of a sale price and the regular price, and reports the regular one as
 * the original — so the cart and checkout need nothing extra, and the storefront
 * shows the regular price struck through. The list is found by a metadata flag,
 * not by its title, which can be renamed under «Λίστες τιμών».
 *
 * Price-list prices sit in the variant's own price set: `variant.prices` from the
 * Admin API includes them without saying so (no `price_list_id`), which is why
 * their ids are looked up here before a variant's prices are shown or written.
 */

export const DISCOUNT_FLAG = "oros_variant_discounts"

export const DISCOUNT_LIST = {
  title: "Τιμές έκπτωσης παραλλαγών",
  description: "Οι τιμές έκπτωσης από το πεδίο «Τιμή έκπτωσης» κάθε παραλλαγής — αλλάζουν από τη φόρμα της παραλλαγής.",
}

export type ListPrice = {
  id: string
  amount: number
  currency_code: string
  variant_id?: string | null
  min_quantity?: number | null
  max_quantity?: number | null
  rules?: Record<string, unknown> | null
}

export type PriceList = {
  id: string
  title: string
  type: string
  status: string
  starts_at: string | null
  ends_at: string | null
  metadata?: Record<string, unknown> | null
  rules?: Record<string, unknown> | null
  prices?: ListPrice[] | null
}

const FIELDS = [
  "id",
  "title",
  "type",
  "status",
  "starts_at",
  "ends_at",
  "metadata",
  "price_list_rules.attribute", // → `rules` (customer groups)
  "price_list_rules.value",
  "prices.id",
  "prices.amount",
  "prices.currency_code",
  "prices.min_quantity",
  "prices.max_quantity",
  "prices.price_set.variant.id", // → `variant_id`
  "prices.price_rules.attribute", // → `rules`
  "prices.price_rules.value",
].join(",")

// ─── a variant's own prices ───────────────────────────────────────────────────

/** A variant price from the Admin API — `rules` needs `+prices.price_rules.attribute,+prices.price_rules.value`. */
export type VariantPrice = {
  id: string
  amount: number
  currency_code: string
  min_quantity?: number | null
  max_quantity?: number | null
  rules?: Record<string, string>
}
type RegionRef = { id: string; currency_code: string }

export const sameCurrency = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

/** No rules, no quantity tier: the currency's own price. */
export const isPlain = (p: VariantPrice) =>
  Object.keys(p.rules ?? {}).length === 0 && p.min_quantity == null && p.max_quantity == null

export const plainPrice = <P extends VariantPrice>(prices: P[], currency: string) =>
  prices.find((p) => sameCurrency(p.currency_code, currency) && isPlain(p))

/** A region price: exactly one rule, `region_id`, and no quantity tier. */
export const isRegionPrice = (p: VariantPrice) => {
  const attrs = Object.keys(p.rules ?? {})
  return attrs.length === 1 && attrs[0] === "region_id" && p.min_quantity == null && p.max_quantity == null
}

/** The region prices in `currency` for a region that sells in it — each beats the plain price in its region. */
export const regionalIn = <P extends VariantPrice>(prices: P[], currency: string, regions: RegionRef[]) =>
  prices.filter(
    (p) =>
      isRegionPrice(p) &&
      sameCurrency(p.currency_code, currency) &&
      regions.some((r) => r.id === p.rules?.region_id && sameCurrency(r.currency_code, currency))
  )

/** What the shop charges in `currency` (before any discount): the region price where there is one, else the plain price. */
export const shopPriceOf = <P extends VariantPrice>(prices: P[], currency: string, regions: RegionRef[] | null) =>
  regionalIn(prices, currency, regions ?? [])[0] ?? plainPrice(prices, currency)

export const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("el-GR", { style: "currency", currency: currency.toUpperCase() }).format(amount)
  } catch {
    return `${amount} ${currency.toUpperCase()}`
  }
}

// ─── price lists ──────────────────────────────────────────────────────────────

/** Every price list, with its prices. */
export async function fetchPriceLists(): Promise<PriceList[]> {
  const lists: PriceList[] = []
  for (let offset = 0; ; ) {
    const r = await sdk.admin.priceList.list({ offset, limit: 500, fields: FIELDS })
    lists.push(...(r.price_lists as unknown as PriceList[]))
    offset += r.price_lists.length
    if (!r.price_lists.length || offset >= r.count) return lists
  }
}

/** Ids of every price-list price — they sit in variants' price sets but aren't the variants' own prices. */
export const priceIdsOf = (lists: PriceList[]) => new Set(lists.flatMap((l) => (l.prices ?? []).map((p) => p.id)))

export const findDiscountList = (lists: PriceList[]) => lists.find((l) => l.metadata?.[DISCOUNT_FLAG] === true) ?? null

/** A variant's discounted price: its plain price (no rules, no quantity tier) in the discount list. */
export const discountOf = (list: PriceList | null, variantId: string, currency: string) =>
  (list?.prices ?? []).find(
    (p) =>
      p.variant_id === variantId &&
      sameCurrency(p.currency_code, currency) &&
      !Object.keys(p.rules ?? {}).length &&
      p.min_quantity == null &&
      p.max_quantity == null
  ) ?? null

const day = (iso: string) => new Date(iso).toLocaleDateString("el-GR")

/** Why the discount list's prices don't reach the shop right now, or null when they do. */
export function discountListProblem(list: PriceList): string | null {
  const name = `Η λίστα τιμών «${list.title}»`
  if (list.type !== "sale") return `${name} δεν είναι πλέον τύπου «Έκπτωση» — ελέγξτε τη στις «Λίστες τιμών».`
  if (list.status !== "active") {
    return `${name} είναι ανενεργή, οπότε οι εκπτώσεις δεν εφαρμόζονται — ενεργοποιήστε τη στις «Λίστες τιμών».`
  }
  if (Object.keys(list.rules ?? {}).length) {
    return `${name} ισχύει μόνο για συγκεκριμένες ομάδες πελατών — οι υπόλοιποι πληρώνουν την κανονική τιμή.`
  }
  const now = Date.now()
  if (list.starts_at && Date.parse(list.starts_at) > now) {
    return `${name} ξεκινά στις ${day(list.starts_at)} — ως τότε ισχύει η κανονική τιμή.`
  }
  if (list.ends_at && Date.parse(list.ends_at) < now) {
    return `${name} έληξε στις ${day(list.ends_at)} — ισχύει η κανονική τιμή.`
  }
  return null
}
