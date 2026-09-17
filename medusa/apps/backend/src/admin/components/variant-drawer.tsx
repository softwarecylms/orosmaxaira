import type { HttpTypes } from "@medusajs/framework/types"
import { ArrowLeftMini, ArrowRightMini, EllipsisHorizontal, Plus, StarSolid, Trash, XMarkMini } from "@medusajs/icons"
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  DropdownMenu,
  Heading,
  IconButton,
  Input,
  Label,
  Select,
  Switch,
  Text,
  clx,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useBlocker, useLocation, useNavigate } from "react-router-dom"
import { MediaPickerModal, displaySrc } from "./media-picker"
import { sdk } from "../lib/sdk"

/**
 * The variant drawer — one right-hand panel for everything about a variant:
 * title/codes/options, prices per store currency and per region, stock per
 * location, shipping dimensions, the variant's own images (upload, pick from the
 * product's unassigned images, reorder, remove or delete, main image) and the
 * product's categories. The same drawer creates a variant (`variantId: null`).
 *
 * It is opened by the «Παραλλαγές» section (widgets/product-variants.tsx), which
 * replaces the native variants table — a row click, the row's «Επεξεργασία» and
 * «Νέα παραλλαγή» all land here, so no core route is intercepted.
 *
 * Every save sends only what changed, and is built against a fresh read of the
 * variant, because several of these endpoints REPLACE rather than merge:
 *  - `prices` on a variant update replaces the whole price set (matched by id,
 *    de-duplicated by currency + rules first), so the payload always carries every
 *    existing price with its id, currency and rules — an empty input never
 *    deletes a price, and a set that would collapse on de-dup is not edited here.
 *    Price-list (sale) prices live in the same price set but the admin response
 *    hides `price_list_id`, so their ids are looked up and kept out of the
 *    payload (the module never touches them; sending one would fail the save).
 *    Rules other than `region_id` come back lossy (no operator), so those lock
 *    the price inputs.
 *  - `categories` on a product update replaces the set, so only the boxes the
 *    user toggled are applied on top of the product's current categories.
 *  - `manage_inventory: false` unlinks the inventory item and Medusa never
 *    re-links it; turning it back on creates a new item with its stock, or —
 *    only when the user ticks it — re-links a free item with the same SKU. The
 *    link is made BEFORE `manage_inventory: true` is written, so a failure never
 *    leaves a managed variant without stock (which can't be added to a cart).
 *  - `images` on a product update replaces the whole collection (an image left
 *    out is deleted, with its variant links). Brand-new variant pictures («Προσθήκη
 *    εικόνων») must become product images first, so that write re-reads the
 *    product's images right before sending, sends EVERY existing image with its
 *    id in its current order, appends only URLs the product doesn't have yet, and
 *    refuses to send if an existing id would be missing or the read looks
 *    incomplete. A second read then finds the new ids, which are linked to this
 *    variant with `batchVariantImages` (the product page's gallery hides
 *    variant-linked images, so this drawer is where they live).
 * Stock is written as absolute numbers, so a level that moved since the drawer
 * opened stops the save. After any failed save the drawer re-reads and rebases
 * the unsaved edits, so a retry works against what is stored now.
 * Metadata is never sent.
 */

// EVERY entry must start with `*` or `+`: a single plain path makes Medusa drop
// the route's default fields (title, sku, manage_inventory, thumbnail, …), and
// the drawer would show — and save over — blanks. fetchVariant checks for that.
const VARIANT_FIELDS = [
  "*options",
  "*prices",
  "+prices.price_rules.attribute", // without these, region prices come back rules: {}
  "+prices.price_rules.value",
  "+images.id",
  "+images.url",
  "+images.variants.id",
  "*inventory_items",
  "*inventory_items.inventory",
  "*inventory_items.inventory.location_levels",
  "+inventory_items.inventory.variants.id", // to spot items shared between variants
].join(",")

// images.variants.id: to mark pictures that already belong to another variant;
// variants.id: to find the variant a «Νέα παραλλαγή» save just created.
const PRODUCT_FIELDS = "id,title,*options,*options.values,*images,images.variants.id,*categories,variants.id"

// The same read the product page's gallery uses before its images write.
const IMAGE_FIELDS =
  "id,images.id,images.url,images.rank,images.variants.id,-type,-collection,-options,-tags,-variants,-sales_channels"

const IMAGES_UNREADABLE =
  "Οι εικόνες του προϊόντος δεν διαβάστηκαν πλήρως, οπότε οι νέες εικόνες δεν προστέθηκαν (για να μη χαθεί καμία υπάρχουσα)."
const IMAGES_GUARD =
  "Ασφαλιστική διακοπή: η λίστα εικόνων του προϊόντος δεν συμφωνεί με ό,τι διαβάστηκε — δεν στάλθηκε τίποτα. Δοκιμάστε ξανά."

// Stock rows for a variant that has no inventory item yet use this item key.
const NEW_ITEM = "__new__"

const STOCK_CHANGED =
  "Η εγγραφή αποθέματος της παραλλαγής άλλαξε στο μεταξύ. Τα στοιχεία ανανεώθηκαν — ελέγξτε και αποθηκεύστε ξανά."
const STOCK_MOVED =
  "Το απόθεμα άλλαξε στο μεταξύ (π.χ. από παραγγελία ή άλλον διαχειριστή). Οι ποσότητες ανανεώθηκαν — συμπληρώστε ξανά όσες θέλετε να αλλάξετε."
const NOT_FOUND = "Η παραλλαγή δεν βρέθηκε σε αυτό το προϊόν (ίσως διαγράφηκε)."

type Price = {
  id: string
  amount: number
  currency_code: string
  min_quantity?: number | null
  max_quantity?: number | null
  rules?: Record<string, string>
}
type Level = {
  id: string
  location_id: string
  stocked_quantity: number
  reserved_quantity: number
  incoming_quantity?: number
}
type InventoryLink = {
  inventory_item_id: string
  required_quantity?: number
  inventory?: {
    id: string
    sku?: string | null
    title?: string | null
    location_levels?: Level[] | null
    variants?: { id: string }[] | null
  } | null
}
type Image = { id: string; url: string; variants?: { id: string }[] | null }
type Variant = {
  id: string
  title: string
  sku: string | null
  ean: string | null
  upc: string | null
  barcode: string | null
  material: string | null
  hs_code: string | null
  mid_code: string | null
  origin_country: string | null
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  thumbnail: string | null
  manage_inventory: boolean
  allow_backorder: boolean
  prices: Price[]
  options?: { id: string; value: string; option_id?: string | null }[] | null
  images?: Image[] | null
  inventory_items?: InventoryLink[] | null
}
type Product = {
  id: string
  variants?: { id: string }[] | null
  options?: { id: string; title: string; values?: { id: string; value: string }[] }[] | null
  images?: (Image & { rank?: number | null })[] | null
  categories?: { id: string }[] | null
}
type Category = { id: string; name: string; parent_category_id: string | null; rank?: number | null }
type Currency = {
  currency_code: string
  is_default: boolean
  currency?: { symbol_native?: string; name?: string; decimal_digits?: number }
}
type Location = { id: string; name: string }
type Region = { id: string; name: string; currency_code: string }
/** An inventory item with the variant's SKU that no variant uses (e.g. left by a tracking switch-off). */
type Orphan = { id: string; sku: string; title: string | null; levels: Level[] }

type Loaded = {
  /** «Νέα παραλλαγή»: `variant` is a blank template until the first save creates it. */
  isNew: boolean
  variant: Variant
  product: Product
  // null = that list failed to load; only its section is disabled.
  categories: Category[] | null
  currencies: Currency[] | null
  locations: Location[] | null
  sectionErrors: Partial<Record<"categories" | "currencies" | "locations" | "regions", string>>
  /** null = the regions didn't load: region prices are then shown, not edited. */
  regions: Region[] | null
  /** This variant's price-list (sale) prices — shown only; `variant.prices` excludes them. */
  listPrices: Price[]
  orphan: Orphan | null
  /** Set when the price set can't be round-tripped safely — price inputs are then read-only. */
  priceLock: string | null
}

const TEXT_KEYS = ["sku", "ean", "upc", "barcode", "material", "hs_code", "mid_code", "origin_country"] as const
const NUMBER_KEYS = ["weight", "length", "width", "height"] as const
type TextKey = (typeof TEXT_KEYS)[number]
type NumberKey = (typeof NUMBER_KEYS)[number]

type Draft = { title: string } & Record<TextKey, string> &
  Record<NumberKey, string> & {
    options: Record<string, string> // option id → value
    prices: Record<string, string> // currency code → amount text
    regionPrices: Record<string, string> // region id → amount text (the region's currency)
    manage_inventory: boolean
    allow_backorder: boolean
    stock: Record<string, string> // `${itemId}|${locationId}` → quantity text
    relink: boolean // re-link loaded.orphan instead of creating a new item
    imageIds: string[]
    /** Absolute URLs picked in «Προσθήκη εικόνων» that aren't product images yet. */
    newUrls: string[]
    /** This variant's images in display order: image ids and `new:<url>` keys. */
    imageOrder: string[]
    /** Product images to delete outright on save (never the stored file). */
    deleteImageIds: string[]
    thumbnail: string | null
    categoryIds: string[]
  }

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * "22,50" / "22.5" / ",5" / "22," → number; "" → null; anything else → NaN.
 * Guesses are refused rather than saved wrong: inner spaces ("22 50"), more than
 * one separator ("1.200,50"), more than `maxDecimals` decimals (prices), and
 * "1.200" — a thousand to a Greek eye, 1.2 to JS ("0.125" is fine).
 */
function parseDecimal(raw: string, maxDecimals?: number): number | null {
  const s = raw.trim()
  if (!s) return null
  const m = /^(\d*)([.,]?)(\d*)$/.exec(s)
  if (!m || (!m[1] && !m[3])) return NaN
  if (maxDecimals !== undefined && m[3].length > maxDecimals) return NaN
  if (m[2] === "." && m[3].length === 3 && /^[1-9]/.test(m[1])) return NaN
  return Number(`${m[1] || "0"}.${m[3] || "0"}`)
}

function parseCount(raw: string): number | null {
  const s = raw.trim()
  if (!s) return null
  return /^\d+$/.test(s) ? Number(s) : NaN
}

const numText = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n))
const normText = (s: string | null | undefined) => (s ?? "").trim() || null
const stockKey = (itemId: string, locationId: string) => `${itemId}|${locationId}`
const rulesOf = (p: Price): Record<string, string> => p.rules ?? {}

/** The editable price for a currency: no rules, no quantity tier. */
const isPlain = (p: Price) =>
  Object.keys(rulesOf(p)).length === 0 && p.min_quantity == null && p.max_quantity == null

const plainPrice = (prices: Price[], currency: string) =>
  prices.find((p) => p.currency_code.toLowerCase() === currency.toLowerCase() && isPlain(p))

/** A region's price: exactly one rule, `region_id`, and no quantity tier. */
const regionPrice = (prices: Price[], region: Region) =>
  prices.find((p) => {
    const rules = rulesOf(p)
    return (
      Object.keys(rules).length === 1 &&
      rules.region_id === region.id &&
      p.currency_code.toLowerCase() === region.currency_code.toLowerCase() &&
      p.min_quantity == null &&
      p.max_quantity == null
    )
  })

const newKey = (url: string) => `new:${url}`

/** What the pricing module de-duplicates on before matching ids (ids are not part of it). */
const priceHash = (p: {
  currency_code?: string
  rules?: Record<string, string>
  min_quantity?: number | null
  max_quantity?: number | null
}) =>
  JSON.stringify([
    (p.currency_code ?? "").toLowerCase(),
    Object.entries(p.rules ?? {}).sort(([a], [b]) => a.localeCompare(b)),
    p.min_quantity ?? null,
    p.max_quantity ?? null,
  ])

const hasHashCollision = (prices: Parameters<typeof priceHash>[0][]) =>
  new Set(prices.map(priceHash)).size !== prices.length

const PRICE_LOCK =
  "Η παραλλαγή έχει τιμές με κανόνες που επικαλύπτονται (π.χ. κλιμακωτές ή με σύνθετους κανόνες). Για να μη χαθεί καμία, οι τιμές δεν αλλάζουν από εδώ."
const PRICE_LOCK_RULES =
  "Η παραλλαγή έχει τιμές με κανόνες πέρα από την περιοχή, που δεν διαβάζονται πλήρως εδώ. Για να μην αλλοιωθούν, οι τιμές δεν αλλάζουν από εδώ."
const PRICE_LOCK_LISTS =
  "Δεν ήταν δυνατός ο έλεγχος για λίστες τιμών (εκπτώσεις). Για να μη χαθεί καμία τιμή, οι τιμές δεν αλλάζουν από εδώ."

/**
 * Why this variant's own prices can't be round-tripped safely, or null.
 * The admin response keeps one value per rule attribute and no operator; only
 * `region_id` rules (the only kind the dashboard creates) survive that intact.
 */
function priceLockFor(prices: Price[]): string | null {
  if (prices.some((p) => Object.keys(rulesOf(p)).some((attr) => attr !== "region_id"))) return PRICE_LOCK_RULES
  return hasHashCollision(prices) ? PRICE_LOCK : null
}

/** Ids of every price-list price. They sit in variants' price sets but aren't the variants' own prices. */
async function fetchPriceListPriceIds(): Promise<Set<string>> {
  const ids = new Set<string>()
  for (let offset = 0; ; ) {
    const r = await sdk.admin.priceList.list({ offset, limit: 500, fields: "id,prices.id" })
    for (const list of r.price_lists) for (const p of list.prices ?? []) ids.add(p.id)
    offset += r.price_lists.length
    if (!r.price_lists.length || offset >= r.count) return ids
  }
}

const isShared = (link: InventoryLink) => (link.inventory?.variants?.length ?? 0) > 1
/** Shared with other variants, or its inventory item is gone — its stock isn't edited here. */
const isReadOnlyLink = (link: InventoryLink) => !link.inventory || isShared(link)

const assignedImageIds = (v: Variant) =>
  (v.images ?? []).filter((i) => i.variants?.some((x) => x.id === v.id)).map((i) => i.id)

type ProductImage = { id: string; url: string; rank: number; variants: string[] }

/**
 * The product's images in rank order, with their variant links. Throws unless
 * every image came back complete — an images write built on a partial list
 * would delete the images it doesn't know about.
 */
async function fetchProductImages(productId: string): Promise<ProductImage[]> {
  const { product } = await sdk.admin.product.retrieve(productId, { fields: IMAGE_FIELDS })
  const raw = (product as unknown as { images?: unknown } | undefined)?.images
  if (!Array.isArray(raw)) throw new Error(IMAGES_UNREADABLE)
  const images = raw.map((x, index) => {
    const i = x as { id?: unknown; url?: unknown; rank?: unknown; variants?: unknown }
    if (typeof i?.id !== "string" || typeof i.url !== "string" || !Array.isArray(i.variants)) {
      throw new Error(IMAGES_UNREADABLE)
    }
    return {
      id: i.id,
      url: i.url,
      rank: typeof i.rank === "number" ? i.rank : index,
      variants: (i.variants as ({ id: string } | null)[]).flatMap((v) => (v?.id ? [v.id] : [])),
    }
  })
  return images.sort((a, b) => a.rank - b.rank) // stable: equal ranks keep API order
}

/**
 * The complete `images` payload for one save of this drawer: every stored image
 * with its id except the ones being deleted, this variant's pictures as one block
 * in the drawer's order (new URLs without an id), and every other image in its
 * current relative order. The block takes the place of the variant's first stored
 * picture, so general and other variants' images keep their order. Pure — throws
 * rather than produce a list that would drop an image the user didn't delete.
 */
function planImagesWrite(stored: ProductImage[], draft: Pick<Draft, "imageOrder" | "deleteImageIds">) {
  const deleted = draft.deleteImageIds.filter((id) => stored.some((s) => s.id === id))
  const kept = stored.filter((s) => !deleted.includes(s.id))
  const block: { id?: string; url: string }[] = []
  const seen = new Set<string>()
  for (const key of draft.imageOrder) {
    if (key.startsWith("new:")) {
      const url = key.slice(4)
      if (!/^https?:\/\//i.test(url)) continue
      const existing = kept.find((s) => s.url === url) // Medusa matches by id: a known URL reuses its row
      const entry = existing ? { id: existing.id, url: existing.url } : { url }
      const k = entry.id ?? `url:${url}`
      if (!seen.has(k)) {
        seen.add(k)
        block.push(entry)
      }
    } else {
      const img = kept.find((s) => s.id === key)
      if (img && !seen.has(img.id)) {
        seen.add(img.id)
        block.push({ id: img.id, url: img.url })
      }
    }
  }
  const blockIds = new Set(block.flatMap((b) => (b.id ? [b.id] : [])))
  const firstSlot = kept.findIndex((s) => blockIds.has(s.id))
  const rest = kept.filter((s) => !blockIds.has(s.id)).map((s) => ({ id: s.id as string | undefined, url: s.url }))
  const insertAt = firstSlot === -1 ? rest.length : kept.slice(0, firstSlot).filter((s) => !blockIds.has(s.id)).length
  const images = [...rest.slice(0, insertAt), ...block, ...rest.slice(insertAt)]

  const ids = images.flatMap((i) => (i.id ? [i.id] : []))
  if (ids.length !== kept.length || new Set(ids).size !== ids.length || kept.some((k) => !ids.includes(k.id))) {
    throw new Error(IMAGES_GUARD)
  }
  const changed = images.some((i) => !i.id) || ids.join("|") !== stored.map((s) => s.id).join("|")
  return { images, deleted, changed }
}

const errorMessage = (e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e)
  if (/with provided options already exists/i.test(msg)) return "Υπάρχει ήδη παραλλαγή με αυτές τις επιλογές."
  return msg
}

function soft<T>(p: Promise<T>): Promise<{ value: T | null; error: string | null }> {
  return p.then(
    (value) => ({ value, error: null }),
    (e) => ({ value: null, error: errorMessage(e) })
  )
}

async function fetchVariant(productId: string, variantId: string): Promise<Variant> {
  const { variant } = await sdk.admin.product.retrieveVariant(productId, variantId, { fields: VARIANT_FIELDS })
  // The route filters by product too: another product's variant comes back empty.
  if (!variant) throw new Error(NOT_FOUND)
  const v = variant as unknown as Record<string, unknown>
  // A wrong field list silently drops scalars; editing blanks would overwrite real data.
  const complete =
    typeof v?.title === "string" &&
    typeof v.manage_inventory === "boolean" &&
    typeof v.allow_backorder === "boolean" &&
    Array.isArray(v.prices) &&
    [...TEXT_KEYS, ...NUMBER_KEYS, "thumbnail"].every((k) => k in v)
  if (!complete) {
    throw new Error("Τα στοιχεία της παραλλαγής φορτώθηκαν ελλιπή — η επεξεργασία ακυρώθηκε για να μη χαθούν δεδομένα.")
  }
  return variant as unknown as Variant
}

/** The template a «Νέα παραλλαγή» starts from (tracked stock, no backorders — as the core form). */
const blankVariant = (): Variant => ({
  id: "",
  title: "",
  sku: null,
  ean: null,
  upc: null,
  barcode: null,
  material: null,
  hs_code: null,
  mid_code: null,
  origin_country: null,
  weight: null,
  length: null,
  width: null,
  height: null,
  thumbnail: null,
  manage_inventory: true,
  allow_backorder: false,
  prices: [],
  options: [],
  images: [],
  inventory_items: [],
})

async function findOrphan(variant: Variant): Promise<Orphan | null> {
  if ((variant.inventory_items ?? []).length || !variant.sku) return null
  try {
    const { inventory_items } = await sdk.admin.inventoryItem.list({
      sku: variant.sku,
      fields: "id,sku,title,variants.id,*location_levels",
      limit: 10,
    })
    const free = (inventory_items as any[]).filter((i) => i.sku === variant.sku && !(i.variants ?? []).length)
    if (free.length !== 1) return null
    return { id: free[0].id, sku: free[0].sku, title: free[0].title ?? null, levels: free[0].location_levels ?? [] }
  } catch {
    return null // only an offer to re-link — never worth failing the drawer over
  }
}

async function loadAll(productId: string, variantId: string | null): Promise<Loaded> {
  const [fetched, product, categories, currencies, locations, regions, listPriceIds] = await Promise.all([
    variantId ? fetchVariant(productId, variantId) : Promise.resolve(blankVariant()),
    sdk.admin.product.retrieve(productId, { fields: PRODUCT_FIELDS }).then((r) => r.product as unknown as Product),
    soft(
      sdk.admin.productCategory
        .list({ limit: 9999, fields: "id,name,parent_category_id,rank" })
        .then((r) => r.product_categories as unknown as Category[])
    ),
    soft(
      sdk.admin.store.list().then((r) => {
        if (!r.stores[0]) throw new Error("Δεν βρέθηκε κατάστημα.")
        return [...((r.stores[0].supported_currencies ?? []) as unknown as Currency[])].sort(
          (a, b) => Number(b.is_default) - Number(a.is_default)
        )
      })
    ),
    soft(
      sdk.admin.stockLocation
        .list({ limit: 9999, fields: "id,name" })
        .then((r) => r.stock_locations as unknown as Location[])
    ),
    soft(
      sdk.admin.region
        .list({ limit: 9999, fields: "id,name,currency_code" })
        .then((r) => r.regions as unknown as Region[])
    ),
    variantId ? soft(fetchPriceListPriceIds()) : Promise.resolve({ value: new Set<string>(), error: null }),
  ])
  const sectionErrors: Loaded["sectionErrors"] = {}
  if (categories.error) sectionErrors.categories = categories.error
  if (currencies.error) sectionErrors.currencies = currencies.error
  if (locations.error) sectionErrors.locations = locations.error
  if (regions.error) sectionErrors.regions = regions.error

  const listIds = listPriceIds.value
  const variant = listIds ? { ...fetched, prices: fetched.prices.filter((p) => !listIds.has(p.id)) } : fetched
  return {
    isNew: !variantId,
    variant,
    product,
    categories: categories.value,
    currencies: currencies.value,
    locations: locations.value,
    sectionErrors,
    regions: regions.value,
    listPrices: listIds ? fetched.prices.filter((p) => listIds.has(p.id)) : [],
    orphan: variantId ? await findOrphan(variant) : null,
    // Without the price-list ids a sale price would pass for a regular one.
    priceLock: listIds ? priceLockFor(variant.prices) : PRICE_LOCK_LISTS,
  }
}

function initialDraft({ variant, product, currencies, locations, regions, orphan }: Loaded): Draft {
  const options: Record<string, string> = {}
  for (const o of product.options ?? []) {
    const value = variant.options?.find((v) => v.option_id === o.id)?.value
    if (value) options[o.id] = value
  }
  const prices: Record<string, string> = {}
  for (const c of currencies ?? []) {
    prices[c.currency_code] = numText(plainPrice(variant.prices, c.currency_code)?.amount)
  }
  const regionPrices: Record<string, string> = {}
  for (const r of regions ?? []) regionPrices[r.id] = numText(regionPrice(variant.prices, r)?.amount)
  const rank = new Map((product.images ?? []).map((i, n) => [i.id, i.rank ?? n]))
  const imageIds = assignedImageIds(variant)
  const stock: Record<string, string> = {}
  const links = variant.inventory_items ?? []
  for (const loc of locations ?? []) {
    for (const link of links) {
      const level = link.inventory?.location_levels?.find((l) => l.location_id === loc.id)
      stock[stockKey(link.inventory_item_id, loc.id)] = numText(level?.stocked_quantity)
    }
    if (!links.length) {
      stock[stockKey(NEW_ITEM, loc.id)] = ""
      if (orphan) {
        stock[stockKey(orphan.id, loc.id)] = numText(orphan.levels.find((l) => l.location_id === loc.id)?.stocked_quantity)
      }
    }
  }

  return {
    title: variant.title,
    ...(Object.fromEntries(TEXT_KEYS.map((k) => [k, variant[k] ?? ""])) as Record<TextKey, string>),
    ...(Object.fromEntries(NUMBER_KEYS.map((k) => [k, numText(variant[k])])) as Record<NumberKey, string>),
    options,
    prices,
    regionPrices,
    manage_inventory: variant.manage_inventory,
    allow_backorder: variant.allow_backorder,
    stock,
    relink: false,
    imageIds,
    newUrls: [],
    imageOrder: [...imageIds].sort((a, b) => (rank.get(a) ?? 0) - (rank.get(b) ?? 0)),
    deleteImageIds: [],
    thumbnail: variant.thumbnail,
    categoryIds: (product.categories ?? []).map((c) => c.id),
  }
}

/** The inventory items whose stock rows are editable right now. */
function editableItemIds(loaded: Loaded, draft: Draft): string[] {
  const links = loaded.variant.inventory_items ?? []
  if (links.length) return links.filter((l) => !isReadOnlyLink(l)).map((l) => l.inventory_item_id)
  return [draft.relink && loaded.orphan ? loaded.orphan.id : NEW_ITEM]
}

/**
 * The thumbnail the save will leave. A main image whose picture leaves the
 * variant is cleared (Medusa does that on remove), and so is one picked in this
 * session whose picture was then unticked. Re-ticking it brings it back.
 */
function thumbnailAfter(draft: Draft, base: Draft, images: Image[]): string | null {
  const t = draft.thumbnail
  if (!t) return null
  if (draft.newUrls.includes(t)) return t // a picture being added in this save
  const same = images.filter((i) => i.url === t && !draft.deleteImageIds.includes(i.id))
  // Its only picture is being deleted: nothing left to show.
  if (!same.length && images.some((i) => i.url === t)) return null
  if (!same.length || same.some((i) => draft.imageIds.includes(i.id))) return t
  return same.some((i) => base.imageIds.includes(i.id)) || t !== base.thumbnail ? null : t
}

/** For "is there anything to save?": order of ticks doesn't matter, nor a thumbnail that will clear anyway. */
const snapshot = (d: Draft, base: Draft, images: Image[]) =>
  JSON.stringify({
    ...d,
    thumbnail: thumbnailAfter(d, base, images),
    imageIds: [...d.imageIds].sort(),
    deleteImageIds: [...d.deleteImageIds].sort(),
    categoryIds: [...d.categoryIds].sort(),
  })

/**
 * After a failed save, rebuild the draft on a fresh read: a value that changed in
 * storage (saved just now, or by someone else) wins; the user's other unsaved
 * edits stay. Ticks are re-applied as toggles on top of the stored set.
 */
function rebase(draft: Draft, oldBase: Draft, prev: Loaded, next: Loaded, nextBase: Draft): Draft {
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
  const pick = <T,>(d: T, o: T, n: T): T => (!same(n, o) || same(d, o) ? n : d)
  const record = (d: Record<string, string>, o: Record<string, string>, n: Record<string, string>) =>
    Object.fromEntries(Object.keys(n).map((k) => [k, pick(d[k], o[k], n[k])]))
  const toggles = (d: string[], o: string[], n: string[]) => [
    ...n.filter((id) => d.includes(id) || !o.includes(id)),
    ...d.filter((id) => !o.includes(id) && !n.includes(id)),
  ]

  const out = { ...nextBase }
  for (const k of ["title", ...TEXT_KEYS, ...NUMBER_KEYS, "manage_inventory", "allow_backorder"] as const) {
    ;(out as Record<string, unknown>)[k] = pick(draft[k], oldBase[k], nextBase[k])
  }
  out.options = record(draft.options, oldBase.options, nextBase.options)
  out.prices = record(draft.prices, oldBase.prices, nextBase.prices)
  out.regionPrices = record(draft.regionPrices, oldBase.regionPrices, nextBase.regionPrices)
  out.stock = record(draft.stock, oldBase.stock, nextBase.stock)
  out.relink =
    draft.relink && !!next.orphan && next.orphan.id === prev.orphan?.id && !(next.variant.inventory_items ?? []).length
  out.imageIds = toggles(draft.imageIds, oldBase.imageIds, nextBase.imageIds)
  // A picked URL the failed save already added to the product is now an image:
  // keep it as a tick on that image, so a retry links it instead of adding it again.
  const prevIds = new Set((prev.product.images ?? []).map((i) => i.id))
  out.newUrls = []
  for (const url of draft.newUrls) {
    const matches = (next.product.images ?? []).filter((i) => i.url === url)
    if (!matches.length) {
      if (!out.newUrls.includes(url)) out.newUrls.push(url)
    } else if (!matches.some((m) => out.imageIds.includes(m.id))) {
      out.imageIds.push((matches.find((m) => !prevIds.has(m.id)) ?? matches[0]).id)
    }
  }
  const nextIds = new Set((next.product.images ?? []).map((i) => i.id))
  out.deleteImageIds = draft.deleteImageIds.filter((id) => nextIds.has(id))
  // The user's order where it still applies, then anything stored that it doesn't know.
  const wanted = new Set([...out.imageIds, ...out.newUrls.map(newKey)])
  const keyed = draft.imageOrder.flatMap((k) => {
    if (k.startsWith("new:")) {
      const url = k.slice(4)
      if (out.newUrls.includes(url)) return [k]
      const img = (next.product.images ?? []).find((i) => i.url === url && out.imageIds.includes(i.id))
      return img ? [img.id] : []
    }
    return wanted.has(k) ? [k] : []
  })
  out.imageOrder = [...new Set([...keyed, ...[...wanted].filter((k) => !keyed.includes(k))])]
  out.categoryIds = toggles(draft.categoryIds, oldBase.categoryIds, nextBase.categoryIds)
  // Keep a thumbnail the user picked; otherwise take what is stored (the batch may have cleared it).
  out.thumbnail = draft.thumbnail !== oldBase.thumbnail ? draft.thumbnail : nextBase.thumbnail
  return out
}

function loadedLevel(loaded: Loaded, itemId: string, locationId: string): Level | undefined {
  const levels =
    loaded.orphan?.id === itemId
      ? loaded.orphan.levels
      : (loaded.variant.inventory_items ?? []).find((l) => l.inventory_item_id === itemId)?.inventory?.location_levels
  return levels?.find((l) => l.location_id === locationId)
}

const decimalsOf = (c: Currency) => c.currency?.decimal_digits ?? 2

const regionDecimals = (loaded: Loaded, r: Region) => {
  const c = (loaded.currencies ?? []).find((x) => x.currency_code.toLowerCase() === r.currency_code.toLowerCase())
  return c ? decimalsOf(c) : 2
}

/** Live validation — keyed so each field can show its own message. Untouched fields are never judged. */
function validate(draft: Draft, base: Draft, loaded: Loaded): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!draft.title.trim()) errors.title = "Ο τίτλος είναι υποχρεωτικός."

  const optionsChanged = (loaded.product.options ?? []).some((o) => draft.options[o.id] !== base.options[o.id])
  // A new variant needs a value for every option; an edit only once one changes.
  if (optionsChanged || loaded.isNew) {
    for (const o of loaded.product.options ?? []) {
      if (!draft.options[o.id]) errors[`option:${o.id}`] = "Επιλέξτε τιμή."
    }
  }

  for (const c of loaded.currencies ?? []) {
    const raw = draft.prices[c.currency_code] ?? ""
    if (raw.trim() === (base.prices[c.currency_code] ?? "").trim()) continue
    if (Number.isNaN(parseDecimal(raw, decimalsOf(c)))) {
      errors[`price:${c.currency_code}`] = `Μη έγκυρο ποσό — έως ${decimalsOf(c)} δεκαδικά, χωρίς χιλιάδες (π.χ. 1200,50).`
    }
  }

  for (const r of loaded.regions ?? []) {
    const raw = draft.regionPrices[r.id] ?? ""
    if (raw.trim() === (base.regionPrices[r.id] ?? "").trim()) continue
    const decimals = regionDecimals(loaded, r)
    if (Number.isNaN(parseDecimal(raw, decimals))) {
      errors[`region:${r.id}`] = `Μη έγκυρο ποσό — έως ${decimals} δεκαδικά, χωρίς χιλιάδες (π.χ. 1200,50).`
    }
  }

  for (const k of NUMBER_KEYS) {
    if (draft[k].trim() !== base[k].trim() && Number.isNaN(parseDecimal(draft[k]))) {
      errors[k] = "Μη έγκυρος αριθμός — δεκαδικά με κόμμα, χωρίς διαχωριστικό χιλιάδων (π.χ. 1200 ή 0,25)."
    }
  }

  if (draft.manage_inventory && loaded.locations) {
    const itemIds = editableItemIds(loaded, draft)
    let hasLevel = false
    for (const itemId of itemIds) {
      for (const loc of loaded.locations) {
        const key = stockKey(itemId, loc.id)
        const raw = draft.stock[key] ?? ""
        const level = loadedLevel(loaded, itemId, loc.id)
        if (level || raw.trim() !== "") hasLevel = true
        if (raw === (base.stock[key] ?? "")) continue
        const n = parseCount(raw)
        if (Number.isNaN(n)) errors[`stock:${key}`] = "Ακέραιος αριθμός ≥ 0."
        else if (n !== null && level && n < level.reserved_quantity) {
          errors[`stock:${key}`] = `Όχι λιγότερα από τα δεσμευμένα (${level.reserved_quantity}).`
        }
      }
    }
    // An item is about to be created or re-linked: without a level anywhere the
    // variant can't be sold (add-to-cart fails unless backorders are allowed).
    const links = loaded.variant.inventory_items ?? []
    const attaching =
      !links.length &&
      (!base.manage_inventory || draft.relink || Object.entries(draft.stock).some(([k, v]) => k.startsWith(`${NEW_ITEM}|`) && v.trim()))
    if ((attaching || loaded.isNew) && loaded.locations.length && !hasLevel) {
      errors["stock:required"] = "Συμπληρώστε ποσότητα (έστω 0) σε τουλάχιστον μία αποθήκη."
    }
  }
  return errors
}

/** Categories as an indented list: parents first, children under them. */
function categoryTree(categories: Category[]): { category: Category; depth: number }[] {
  const ids = new Set(categories.map((c) => c.id))
  const byParent = new Map<string | null, Category[]>()
  for (const c of categories) {
    const parent = c.parent_category_id && ids.has(c.parent_category_id) ? c.parent_category_id : null
    byParent.set(parent, [...(byParent.get(parent) ?? []), c])
  }
  const out: { category: Category; depth: number }[] = []
  const walk = (parent: string | null, depth: number) => {
    const children = [...(byParent.get(parent) ?? [])].sort(
      (a, b) => (a.rank ?? 0) - (b.rank ?? 0) || a.name.localeCompare(b.name, "el")
    )
    for (const c of children) {
      out.push({ category: c, depth })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}

// ─── UI bits ──────────────────────────────────────────────────────────────────

const Section = ({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) => (
  <section className="flex flex-col gap-y-4">
    <div className="flex flex-col gap-y-1">
      <Heading level="h3">{title}</Heading>
      {hint && (
        <Text size="small" className="text-ui-fg-subtle">
          {hint}
        </Text>
      )}
    </div>
    {children}
  </section>
)

const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <div className="flex flex-col gap-y-1.5">
    <Label size="small" weight="plus">
      {label}
    </Label>
    {children}
    {error && (
      <Text size="xsmall" className="text-ui-fg-error">
        {error}
      </Text>
    )}
  </div>
)

const Note = ({ children, error }: { children: ReactNode; error?: boolean }) => (
  <Text size="small" className={error ? "text-ui-fg-error" : "text-ui-fg-subtle"}>
    {children}
  </Text>
)

/**
 * Mounted only while the drawer is open (the router honours a single blocker,
 * and the core route forms register their own). Any navigation — browser Back
 * included — closes the drawer, after «Απόρριψη αλλαγών;» when there are edits.
 */
const NavigationGuard = ({ dirty, saving, onLeave }: { dirty: boolean; saving: boolean; onLeave: () => void }) => {
  const location = useLocation()
  const openedAt = useRef(location.key)
  const prompt = usePrompt()
  const blocker = useBlocker(dirty || saving)

  useEffect(() => {
    if (location.key !== openedAt.current) onLeave()
  }, [location.key])

  useEffect(() => {
    if (blocker.state !== "blocked") return
    const { proceed, reset } = blocker
    if (saving) {
      reset() // never leave half-way through a save
      return
    }
    let live = true
    prompt({
      title: "Απόρριψη αλλαγών;",
      description: "Οι αλλαγές σε αυτή την παραλλαγή δεν έχουν αποθηκευτεί.",
      confirmText: "Απόρριψη",
      cancelText: "Συνέχεια επεξεργασίας",
    }).then((ok) => {
      if (live) (ok ? proceed : reset)()
    })
    return () => {
      live = false
    }
  }, [blocker.state])

  return null
}

// ─── editor ───────────────────────────────────────────────────────────────────

type EditorProps = { productId: string; variantId: string | null; open: boolean; onClose: () => void }

const VariantEditor = ({ productId, variantId, open, onClose }: EditorProps) => {
  const queryClient = useQueryClient()
  const prompt = usePrompt()
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [base, setBase] = useState<Draft | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  // A «Νέα παραλλαγή» gets its id on the first save; a retry then edits it instead of creating another.
  const [currentId, setCurrentId] = useState<string | null>(variantId)

  useEffect(() => {
    let cancelled = false
    loadAll(productId, variantId)
      .then((data) => {
        if (cancelled) return
        const d = initialDraft(data)
        setLoaded(data)
        setBase(d)
        setDraft(d)
      })
      .catch((e) => !cancelled && setLoadError(errorMessage(e)))
    return () => {
      cancelled = true
    }
  }, [productId, variantId])

  const errors = useMemo(
    () => (draft && base && loaded ? validate(draft, base, loaded) : {}),
    [draft, base, loaded]
  )
  const productImages = loaded?.product.images ?? []
  const dirty =
    !!draft && !!base && snapshot(draft, base, productImages) !== snapshot(base, base, productImages)
  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d))

  const requestClose = async () => {
    if (saving) return
    if (dirty) {
      const ok = await prompt({
        title: "Απόρριψη αλλαγών;",
        description: "Οι αλλαγές σε αυτή την παραλλαγή δεν έχουν αποθηκευτεί.",
        confirmText: "Απόρριψη",
        cancelText: "Συνέχεια επεξεργασίας",
      })
      if (!ok) return
    }
    onClose()
  }

  const save = async () => {
    if (!loaded || !draft || !base) return
    const firstError = Object.values(errors)[0]
    if (firstError) {
      toast.error(`Ελέγξτε τα πεδία: ${firstError}`)
      return
    }
    if (!loaded.isNew && base.manage_inventory && !draft.manage_inventory) {
      const ok = await prompt({
        title: "Διακοπή διαχείρισης αποθέματος;",
        description:
          "Η εγγραφή αποθέματος θα αποσυνδεθεί από την παραλλαγή και οι ποσότητες δεν θα μετρώνται πλέον. Αν την ενεργοποιήσετε ξανά, θα χρειαστεί να την επανασυνδέσετε ή να δημιουργήσετε νέα.",
        confirmText: "Συνέχεια",
        cancelText: "Άκυρο",
      })
      if (!ok) return
    }

    setSaving(true)
    const done: string[] = []
    const warnings: string[] = []
    let step = "Ανάγνωση παραλλαγής"
    let id = currentId
    const creating = loaded.isNew && !id
    try {
      const priceChanges = loaded.priceLock
        ? []
        : (loaded.currencies ?? [])
            .map((c) => ({ c, raw: draft.prices[c.currency_code] ?? "" }))
            .filter(({ c, raw }) => raw.trim() !== "" && raw.trim() !== (base.prices[c.currency_code] ?? "").trim())
            .map(({ c, raw }) => ({ code: c.currency_code, amount: parseDecimal(raw, decimalsOf(c)) as number }))
            .filter(({ code, amount }) => amount !== parseDecimal(base.prices[code] ?? ""))
      const regionChanges =
        loaded.priceLock || !loaded.regions
          ? []
          : loaded.regions
              .map((r) => ({ region: r, raw: draft.regionPrices[r.id] ?? "" }))
              .filter(({ region, raw }) => raw.trim() !== "" && raw.trim() !== (base.regionPrices[region.id] ?? "").trim())
              .map(({ region, raw }) => ({ region, amount: parseDecimal(raw, regionDecimals(loaded, region)) as number }))
              .filter(({ region, amount }) => amount !== parseDecimal(base.regionPrices[region.id] ?? ""))

      // ── 0. «Νέα παραλλαγή»: create it (Medusa creates and links its inventory item), then its stock ──
      if (creating) {
        step = "Δημιουργία παραλλαγής"
        const body: Record<string, unknown> = {
          title: draft.title.trim(),
          manage_inventory: draft.manage_inventory,
          allow_backorder: draft.allow_backorder,
        }
        for (const k of TEXT_KEYS) {
          const v = k === "origin_country" ? normText(draft[k])?.toLowerCase() ?? null : normText(draft[k])
          if (v) body[k] = v
        }
        for (const k of NUMBER_KEYS) {
          const n = parseDecimal(draft[k])
          if (n !== null) body[k] = n
        }
        const productOptions = loaded.product.options ?? []
        if (productOptions.length) {
          body.options = Object.fromEntries(productOptions.map((o) => [o.title, draft.options[o.id]]))
        }
        body.prices = [
          ...priceChanges.map(({ code, amount }) => ({ currency_code: code, amount })),
          ...regionChanges.map(({ region, amount }) => ({
            currency_code: region.currency_code,
            amount,
            rules: { region_id: region.id },
          })),
        ]
        const before = new Set((loaded.product.variants ?? []).map((v) => v.id))
        const { product } = await sdk.admin.product.createVariant(
          productId,
          body as unknown as HttpTypes.AdminCreateProductVariant,
          { fields: "id,variants.id" }
        )
        const created = ((product as unknown as Product).variants ?? []).filter((v) => !before.has(v.id))
        if (created.length !== 1) {
          throw new Error("Η παραλλαγή δημιουργήθηκε, αλλά δεν εντοπίστηκε — ανοίξτε την από τη λίστα για να ολοκληρώσετε.")
        }
        id = created[0].id
        setCurrentId(id)
        done.push(step)

        if (draft.manage_inventory && loaded.locations?.length) {
          step = "Απόθεμα"
          const made = await fetchVariant(productId, id)
          const itemId = (made.inventory_items ?? [])[0]?.inventory_item_id
          const create = itemId
            ? loaded.locations.flatMap((loc) => {
                const q = parseCount(draft.stock[stockKey(NEW_ITEM, loc.id)] ?? "")
                return q !== null && !Number.isNaN(q)
                  ? [{ inventory_item_id: itemId, location_id: loc.id, stocked_quantity: q }]
                  : []
              })
            : []
          if (create.length) {
            await sdk.admin.inventoryItem.batchInventoryItemsLocationLevels({ create })
            done.push(step)
          }
        }
      }
      const variantId = id as string

      // A fresh read: prices, stock levels, images and categories are applied
      // against what is stored *now*, not what the drawer loaded.
      step = "Ανάγνωση παραλλαγής"
      const [fresh, freshProduct, freshListIds] = await Promise.all([
        fetchVariant(productId, variantId),
        sdk.admin.product.retrieve(productId, { fields: "id,*categories" }).then((r) => r.product as unknown as Product),
        !creating && (priceChanges.length || regionChanges.length) ? fetchPriceListPriceIds() : Promise.resolve(null),
      ])

      if (!creating) {
        // ── variant fields + prices (written after the inventory link, below) ──
        const body: Record<string, unknown> = {}
        if (draft.title.trim() !== base.title.trim()) body.title = draft.title.trim()
        for (const k of TEXT_KEYS) {
          if (draft[k] === base[k]) continue // untouched: never re-send a stored value
          const next = k === "origin_country" ? normText(draft[k])?.toLowerCase() ?? null : normText(draft[k])
          // "" → null: sku/ean/upc/barcode have unique indexes that "" would hit.
          if (next !== normText(base[k])) body[k] = next
        }
        for (const k of NUMBER_KEYS) {
          if (draft[k].trim() !== base[k].trim()) body[k] = parseDecimal(draft[k])
        }
        if (draft.manage_inventory !== base.manage_inventory) body.manage_inventory = draft.manage_inventory
        if (draft.allow_backorder !== base.allow_backorder) body.allow_backorder = draft.allow_backorder

        const productOptions = loaded.product.options ?? []
        if (productOptions.some((o) => draft.options[o.id] !== base.options[o.id])) {
          // Medusa wants every option, by title, with an existing value.
          body.options = Object.fromEntries(productOptions.map((o) => [o.title, draft.options[o.id]]))
        }

        if ((priceChanges.length || regionChanges.length) && freshListIds) {
          // Sale prices share the price set but are never touched by this update —
          // and an id the module doesn't count as the variant's own would fail it.
          const own = fresh.prices.filter((p) => !freshListIds.has(p.id))
          const lock = priceLockFor(own)
          if (lock) throw new Error(lock)
          // The full set, each price with id + currency + rules: anything left out,
          // or sent without its rules, would be deleted by the pricing module.
          const prices: HttpTypes.AdminUpdateProductVariantPrice[] = own.map((p) => {
            const rules = rulesOf(p)
            return {
              id: p.id,
              currency_code: p.currency_code,
              amount: Number(p.amount),
              ...(Object.keys(rules).length ? { rules } : {}),
              ...(p.min_quantity != null ? { min_quantity: p.min_quantity } : {}),
              ...(p.max_quantity != null ? { max_quantity: p.max_quantity } : {}),
            } as HttpTypes.AdminUpdateProductVariantPrice
          })
          for (const { code, amount } of priceChanges) {
            const existing = plainPrice(own, code)
            const entry = existing && prices.find((p) => p.id === existing.id)
            if (entry) entry.amount = amount
            else prices.push({ currency_code: code, amount })
          }
          for (const { region, amount } of regionChanges) {
            const existing = regionPrice(own, region)
            const entry = existing && prices.find((p) => p.id === existing.id)
            if (entry) entry.amount = amount
            else {
              prices.push({
                currency_code: region.currency_code,
                amount,
                rules: { region_id: region.id },
              } as HttpTypes.AdminUpdateProductVariantPrice)
            }
          }
          // Two entries the module would see as one = one of them gets deleted.
          if (hasHashCollision(prices as Parameters<typeof priceHash>[0][])) throw new Error(PRICE_LOCK)
          body.prices = prices
        }

        // ── stock: check every level write before anything is written ──
        const baseLinks = loaded.variant.inventory_items ?? []
        const freshLinks = fresh.inventory_items ?? []
        const turnedOn = draft.manage_inventory && !base.manage_inventory
        const stockChanges = draft.manage_inventory
          ? editableItemIds(loaded, draft).flatMap((itemId) =>
              (loaded.locations ?? []).flatMap((loc) => {
                const key = stockKey(itemId, loc.id)
                const raw = draft.stock[key] ?? ""
                const quantity = parseCount(raw)
                return raw.trim() !== "" && quantity !== null && quantity !== parseCount(base.stock[key] ?? "")
                  ? [{ itemId, locationId: loc.id, quantity }]
                  : []
              })
            )
          : []

        let attach: "relink" | "new" | null = null
        if (draft.manage_inventory && !baseLinks.length && loaded.locations) {
          if (draft.relink && loaded.orphan) attach = "relink"
          else if (turnedOn || stockChanges.length) attach = "new"
        }

        const levelsFor = new Map<string, Level[]>() // item id → current levels to diff against
        let newItemSku: string | null = null
        if (baseLinks.length) {
          for (const c of stockChanges) {
            const link = freshLinks.find((l) => l.inventory_item_id === c.itemId)
            if (!link || isReadOnlyLink(link)) throw new Error(STOCK_CHANGED)
            levelsFor.set(c.itemId, link.inventory?.location_levels ?? [])
          }
        } else if (attach) {
          if (freshLinks.length) throw new Error(STOCK_CHANGED)
          if (attach === "relink") {
            const orphan = loaded.orphan!
            const { inventory_item } = await sdk.admin.inventoryItem.retrieve(orphan.id, {
              fields: "id,sku,variants.id,*location_levels",
            })
            const item = inventory_item as any
            if ((item.variants ?? []).length || item.sku !== orphan.sku) throw new Error(STOCK_CHANGED)
            levelsFor.set(orphan.id, item.location_levels ?? [])
          } else {
            newItemSku = normText(draft.sku)
            if (newItemSku) {
              // Inventory SKUs are unique: don't collide with an existing item.
              const { inventory_items } = await sdk.admin.inventoryItem.list({ sku: newItemSku, fields: "id", limit: 1 })
              if (inventory_items.length) newItemSku = null
            }
          }
        }
        for (const c of stockChanges) {
          if (c.itemId === NEW_ITEM) continue
          const now = levelsFor.get(c.itemId)?.find((l) => l.location_id === c.locationId)
          // Quantities are absolute: writing over a level that moved since the
          // drawer opened (an order, another admin) would undo that change.
          const was = loadedLevel(loaded, c.itemId, c.locationId)
          if ((now?.stocked_quantity ?? null) !== (was?.stocked_quantity ?? null)) throw new Error(STOCK_MOVED)
          if (now && c.quantity < now.reserved_quantity) {
            throw new Error(`Το απόθεμα δεν μπορεί να είναι λιγότερο από τα δεσμευμένα (${now.reserved_quantity}).`)
          }
        }

        // ── 1. inventory item + link, BEFORE manage_inventory: true is written ──
        // A link on a variant that isn't managed yet is harmless if what follows
        // fails; a managed variant without one can't be added to a cart.
        if (attach) {
          step = "Σύνδεση αποθέματος"
          let itemId = loaded.orphan?.id as string
          if (attach === "new") {
            const location_levels = stockChanges
              .filter((c) => c.itemId === NEW_ITEM)
              .map((c) => ({ location_id: c.locationId, stocked_quantity: c.quantity }))
            const { inventory_item } = await sdk.admin.inventoryItem.create(
              {
                title: draft.title.trim(),
                sku: newItemSku,
                requires_shipping: true,
                ...(location_levels.length ? { location_levels } : {}),
              },
              { fields: "id" }
            )
            itemId = inventory_item.id
          }
          try {
            await sdk.admin.product.batchVariantInventoryItems(productId, {
              create: [{ variant_id: variantId, inventory_item_id: itemId, required_quantity: 1 }],
            })
          } catch (e) {
            // Don't leave a stray item (and its levels) behind for the next attempt.
            if (attach === "new") await sdk.admin.inventoryItem.delete(itemId).catch(() => undefined)
            throw e
          }
          done.push(step)
        }

        // ── 2. variant fields + prices ──
        if (Object.keys(body).length) {
          step = body.prices ? "Βασικά στοιχεία & τιμές" : "Βασικά στοιχεία"
          await sdk.admin.product.updateVariant(
            productId,
            variantId,
            body as HttpTypes.AdminUpdateProductVariant,
            { fields: "id" }
          )
          done.push(step)
        }

        // ── 3. stock levels ──
        step = "Απόθεμα"
        const create: HttpTypes.AdminBatchCreateInventoryItemsLocationLevels[] = []
        const update: HttpTypes.AdminBatchUpdateInventoryItemsLocationLevels[] = []
        for (const c of stockChanges) {
          if (c.itemId === NEW_ITEM) continue // written together with the new item
          const level = levelsFor.get(c.itemId)?.find((l) => l.location_id === c.locationId)
          const row = { inventory_item_id: c.itemId, location_id: c.locationId, stocked_quantity: c.quantity }
          if (!level) create.push(row)
          else if (level.stocked_quantity !== c.quantity) update.push(row)
        }
        if (create.length || update.length) {
          // No `delete` and no `force`: this drawer never removes a stock level.
          await sdk.admin.inventoryItem.batchInventoryItemsLocationLevels({
            ...(create.length ? { create } : {}),
            ...(update.length ? { update } : {}),
          })
          done.push(step)
        }
      }

      // ── 4a. product images: new pictures, deletions and this variant's order in ONE write ──
      const productImages = loaded.product.images ?? []
      const newImageIds: string[] = []
      const imagesTouched =
        draft.newUrls.length > 0 ||
        draft.deleteImageIds.length > 0 ||
        draft.imageOrder.join("|") !== base.imageOrder.join("|")
      if (imagesTouched) {
        step = "Εικόνες προϊόντος"
        const stored = await fetchProductImages(productId)
        const storedIds = new Set(stored.map((i) => i.id))
        // The variant read above sees every general image and this variant's own:
        // a product read missing one of them is not trusted to write over.
        if ((fresh.images ?? []).some((i) => !storedIds.has(i.id))) throw new Error(IMAGES_GUARD)
        const plan = planImagesWrite(stored, draft)
        let after = stored
        if (plan.changed) {
          await sdk.admin.product.update(productId, { images: plan.images }, { fields: "id" })
          done.push(step)
          // Re-read for the new rows' ids — and to check nothing else moved.
          after = await fetchProductImages(productId)
          const lost = stored.filter((st) => {
            if (plan.deleted.includes(st.id)) return false
            const now = after.find((x) => x.id === st.id)
            return !now || st.variants.some((v) => !now.variants.includes(v))
          })
          if (lost.length) {
            warnings.push(
              `Προσοχή: ${lost.length} υπάρχουσα(-ες) εικόνα(-ες) ή σύνδεσή(-ές) τους με παραλλαγές δεν βρέθηκαν μετά την αποθήκευση — ελέγξτε τις εικόνες του προϊόντος.`
            )
          }
        }
        for (const url of draft.newUrls) {
          if (!/^https?:\/\//i.test(url)) continue
          const matches = after.filter((i) => i.url === url)
          if (!matches.length) throw new Error(`Η νέα εικόνα δεν βρέθηκε στο προϊόν μετά την αποθήκευση (${url}).`)
          if (matches.some((m) => m.variants.includes(variantId))) continue // already this variant's
          const imageId = (matches.find((m) => !storedIds.has(m.id)) ?? matches[0]).id
          if (!newImageIds.includes(imageId)) newImageIds.push(imageId)
        }
      }

      // ── 4b. variant ↔ image links, then thumbnail (the batch nulls a removed thumbnail itself) ──
      step = "Εικόνες παραλλαγής"
      const freshAssigned = new Set(assignedImageIds(fresh))
      const deleting = new Set(draft.deleteImageIds)
      const add = [
        ...draft.imageIds.filter((x) => !base.imageIds.includes(x) && !freshAssigned.has(x) && !deleting.has(x)),
        ...newImageIds,
      ].filter((x, n, all) => all.indexOf(x) === n)
      // A deleted picture takes its links with it: nothing to unlink.
      const remove = base.imageIds.filter((x) => !draft.imageIds.includes(x) && freshAssigned.has(x) && !deleting.has(x))
      if (add.length || remove.length) {
        await sdk.admin.product.batchVariantImages(productId, variantId, {
          ...(add.length ? { add } : {}),
          ...(remove.length ? { remove } : {}),
        })
      }
      const thumbnail = thumbnailAfter(draft, base, productImages)
      // Only an explicit pick, or a clear the batch didn't already do, is written.
      const clearedByBatch =
        thumbnail === null && productImages.some((i) => i.url === fresh.thumbnail && remove.includes(i.id))
      if (thumbnail !== (creating ? null : base.thumbnail) && !clearedByBatch) {
        await sdk.admin.product.updateVariant(productId, variantId, { thumbnail }, { fields: "id" })
      }
      if (add.length || remove.length || thumbnail !== base.thumbnail) done.push(step)

      // ── 5. categories (whole product) — only the user's toggles, on top of now ──
      step = "Κατηγορίες"
      const current = (freshProduct.categories ?? []).map((c) => c.id)
      const added = draft.categoryIds.filter((x) => !base.categoryIds.includes(x))
      const removed = base.categoryIds.filter((x) => !draft.categoryIds.includes(x))
      const nextCategories = [...current.filter((x) => !removed.includes(x)), ...added.filter((x) => !current.includes(x))]
      if (nextCategories.length !== current.length || nextCategories.some((x) => !current.includes(x))) {
        await sdk.admin.product.update(
          productId,
          { categories: nextCategories.map((x) => ({ id: x })) },
          { fields: "id" }
        )
        done.push(step)
      }

      toast.success(
        creating ? "Η παραλλαγή δημιουργήθηκε." : done.length ? "Η παραλλαγή αποθηκεύτηκε." : "Δεν υπήρχαν αλλαγές για αποθήκευση."
      )
      if (warnings.length) toast.warning(warnings.join(" "))
      onClose()
    } catch (e) {
      const saved = done.length ? ` Αποθηκεύτηκαν ήδη: ${done.join(", ")}.` : ""
      // Re-read so a retry is built on what is stored now — including the parts
      // that did save (a created variant is edited from here on) — keeping the user's other edits.
      let refreshed = false
      try {
        const next = await loadAll(productId, id)
        const nextBase = initialDraft(next)
        setDraft((d) => (d ? rebase(d, base, loaded, next, nextBase) : d))
        setBase(nextBase)
        setLoaded(next)
        refreshed = true
      } catch {
        // keep the current view
      }
      const retry = done.length && !refreshed ? " Κλείστε και ανοίξτε ξανά την παραλλαγή πριν δοκιμάσετε πάλι." : ""
      toast.error(`${step}: ${errorMessage(e)}${saved}${retry}`)
      if (warnings.length) toast.warning(warnings.join(" "))
    } finally {
      await Promise.all(
        [["products"], ["product_variants"], ["product_variant"], ["inventory_items"], ["product_categories"]].map(
          (queryKey) => queryClient.invalidateQueries({ queryKey })
        )
      )
      setSaving(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={(next) => !next && requestClose()}>
      {open && <NavigationGuard dirty={dirty} saving={saving} onLeave={onClose} />}
      <Drawer.Content className="sm:max-w-[640px]">
        <Drawer.Header>
          <Drawer.Title asChild>
            <Heading>{variantId ? "Επεξεργασία παραλλαγής" : "Νέα παραλλαγή"}</Heading>
          </Drawer.Title>
          <Drawer.Description className="text-ui-fg-subtle">
            {!loaded
              ? "Φόρτωση…"
              : loaded.isNew
                ? "Συμπληρώστε τα στοιχεία της νέας παραλλαγής και αποθηκεύστε."
                : [loaded.variant.title, loaded.variant.sku].filter(Boolean).join(" · ")}
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Body className="flex min-h-0 flex-col gap-y-8 overflow-y-auto">
          {loadError ? (
            <div className="flex flex-col items-start gap-y-3">
              <Text className="text-ui-fg-error">
                {loadError === NOT_FOUND ? NOT_FOUND : `Η παραλλαγή δεν φορτώθηκε: ${loadError}`}
              </Text>
              {loadError !== NOT_FOUND && variantId && (
                // The table's "Edit" leads here now, so keep a way to the core form.
                // The variant page's own edit route isn't intercepted; leaving closes this drawer.
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => navigate(`/products/${productId}/variants/${variantId}/edit`)}
                >
                  Άνοιγμα κλασικής φόρμας
                </Button>
              )}
            </div>
          ) : !loaded || !draft || !base ? (
            <div className="flex flex-col gap-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-ui-bg-component h-10 animate-pulse rounded-md" />
              ))}
            </div>
          ) : (
            <EditorFields loaded={loaded} draft={draft} base={base} errors={errors} set={set} />
          )}
        </Drawer.Body>

        <Drawer.Footer>
          <Button size="small" variant="secondary" onClick={requestClose} disabled={saving}>
            Άκυρο
          </Button>
          <Button size="small" onClick={save} isLoading={saving} disabled={!loaded || !!loadError}>
            {loaded?.isNew && !currentId ? "Δημιουργία" : "Αποθήκευση"}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

type FieldsProps = {
  loaded: Loaded
  draft: Draft
  base: Draft
  errors: Record<string, string>
  set: (patch: Partial<Draft>) => void
}

const EditorFields = ({ loaded, draft, base, errors, set }: FieldsProps) => {
  const { variant, product, currencies, locations, regions, orphan, sectionErrors, listPrices } = loaded
  const links = variant.inventory_items ?? []
  const images = [...(product.images ?? [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  const tree = useMemo(() => categoryTree(loaded.categories ?? []), [loaded.categories])
  const regionName = (rid: string) => (regions ?? []).find((r) => r.id === rid)?.name ?? rid
  // Everything the inputs above don't edit: kept as-is on save, listed for reference.
  const otherPrices = variant.prices.filter((p) => {
    if (isPlain(p)) return !(currencies ?? []).some((c) => c.currency_code.toLowerCase() === p.currency_code.toLowerCase())
    return !(regions ?? []).some((r) => regionPrice([p], r))
  })
  const thumbnail = thumbnailAfter(draft, base, images)

  const readOnlyPrices = (title: string, prices: Price[]) => (
    <div className="flex flex-col gap-y-2">
      <Text size="xsmall" weight="plus" className="text-ui-fg-subtle">
        {title}
      </Text>
      <div className="divide-y rounded-md border">
        {prices.map((p) => {
          const parts = Object.entries(rulesOf(p)).map(([attr, value]) =>
            attr === "region_id" ? `Περιοχή: ${regionName(value)}` : `${attr}: ${value}`
          )
          if (p.min_quantity != null || p.max_quantity != null) {
            parts.push(`Ποσότητα ${p.min_quantity ?? 1}–${p.max_quantity ?? "∞"}`)
          }
          return (
            <div key={p.id} className="flex items-center justify-between px-3 py-2">
              <Text size="small">{parts.join(" · ") || "Χωρίς κανόνα"}</Text>
              <Text size="small" weight="plus">
                {p.amount} {p.currency_code.toUpperCase()}
              </Text>
            </div>
          )
        })}
      </div>
    </div>
  )

  const text = (key: TextKey | "title", label: string) => (
    <Field label={label} error={errors[key]}>
      <Input
        size="small"
        value={draft[key]}
        aria-invalid={!!errors[key]}
        onChange={(e) => set({ [key]: e.target.value } as Partial<Draft>)}
      />
    </Field>
  )

  const toggle = (list: string[], id: string, on: boolean) =>
    on ? (list.includes(id) ? list : [...list, id]) : list.filter((x) => x !== id)

  // ── variant images: this variant's pictures in order, then the product's unassigned ones ──
  const prompt = usePrompt()
  const [pickerOpen, setPickerOpen] = useState(false)
  const imageById = new Map(images.map((i) => [i.id, i]))
  type Tile = { key: string; url: string; id: string | null }
  const tiles: Tile[] = draft.imageOrder.flatMap((key): Tile[] => {
    if (key.startsWith("new:")) {
      const url = key.slice(4)
      return draft.newUrls.includes(url) ? [{ key, url, id: null }] : []
    }
    const img = imageById.get(key)
    return img && draft.imageIds.includes(key) && !draft.deleteImageIds.includes(key) ? [{ key, url: img.url, id: key }] : []
  })
  const usedElsewhere = (img: Image) => (img.variants ?? []).some((v) => v.id !== variant.id)
  /** The product's general pictures (no variant) this variant can take, including ones it is leaving. */
  const unassigned = images.filter(
    (i) => !draft.imageIds.includes(i.id) && !draft.deleteImageIds.includes(i.id) && !usedElsewhere(i)
  )
  const pendingDelete = images.filter((i) => draft.deleteImageIds.includes(i.id))

  const addExisting = (imageId: string) =>
    draft.imageIds.includes(imageId)
      ? undefined
      : set({ imageIds: [...draft.imageIds, imageId], imageOrder: [...draft.imageOrder, imageId] })

  const removeFromVariant = (tile: Tile) =>
    tile.id
      ? set({
          imageIds: draft.imageIds.filter((x) => x !== tile.id),
          imageOrder: draft.imageOrder.filter((k) => k !== tile.key),
        })
      : set({
          newUrls: draft.newUrls.filter((u) => u !== tile.url),
          imageOrder: draft.imageOrder.filter((k) => k !== tile.key),
          // Picked as main in this session: like removing it, the variant is left without one.
          ...(draft.thumbnail === tile.url && base.thumbnail !== tile.url ? { thumbnail: null } : {}),
        })

  const deleteCompletely = async (tile: Tile) => {
    if (!tile.id) return removeFromVariant(tile)
    const others = (imageById.get(tile.id)?.variants ?? []).filter((v) => v.id !== variant.id).length
    const ok = await prompt({
      title: "Οριστική διαγραφή εικόνας;",
      description:
        (others
          ? `Η εικόνα ανήκει και σε ${others} ακόμη παραλλαγή(-ές). `
          : "") +
        "Με την αποθήκευση θα αφαιρεθεί από το προϊόν και από κάθε παραλλαγή. Το αρχείο δεν σβήνεται από τη βιβλιοθήκη πολυμέσων.",
      confirmText: "Διαγραφή με την αποθήκευση",
      cancelText: "Άκυρο",
    })
    if (!ok) return
    set({
      deleteImageIds: [...draft.deleteImageIds, tile.id],
      imageIds: draft.imageIds.filter((x) => x !== tile.id),
      imageOrder: draft.imageOrder.filter((k) => k !== tile.key),
    })
  }

  const undoDelete = (imageId: string) =>
    set({
      deleteImageIds: draft.deleteImageIds.filter((x) => x !== imageId),
      // It was this variant's: put it back at the end of the order.
      ...(base.imageIds.includes(imageId) && !draft.imageIds.includes(imageId)
        ? { imageIds: [...draft.imageIds, imageId], imageOrder: [...draft.imageOrder, imageId] }
        : {}),
    })

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= tiles.length) return
    const keys = tiles.map((t) => t.key)
    ;[keys[index], keys[target]] = [keys[target], keys[index]]
    set({ imageOrder: [...keys, ...draft.imageOrder.filter((k) => !keys.includes(k))] })
  }

  /** Library/upload picks: a URL the product already has as a general picture is reused; the rest are added on save. */
  const addPicked = (urls: string[]) => {
    const imageIds = [...draft.imageIds]
    const newUrls = [...draft.newUrls]
    const imageOrder = [...draft.imageOrder]
    for (const url of urls) {
      const same = images.filter((i) => i.url === url && !draft.deleteImageIds.includes(i.id))
      if (same.length) {
        const mine = same.find((i) => imageIds.includes(i.id))
        const free = same.find((i) => !usedElsewhere(i))
        if (!mine && free) {
          imageIds.push(free.id)
          imageOrder.push(free.id)
        }
      } else if (!newUrls.includes(url)) {
        newUrls.push(url)
        imageOrder.push(newKey(url))
      }
    }
    set({ imageIds, newUrls, imageOrder })
  }

  const stockRow = (itemId: string, loc: Location, level: Level | undefined, readOnly = false) => {
    const key = stockKey(itemId, loc.id)
    const typed = readOnly ? null : parseCount(draft.stock[key] ?? "")
    const stocked = typed === null || Number.isNaN(typed) ? level?.stocked_quantity ?? 0 : typed
    const reserved = level?.reserved_quantity ?? 0
    return (
      <div key={key} className="grid grid-cols-[1fr_120px_80px_80px] items-center gap-x-3">
        <Text size="small">{loc.name}</Text>
        {readOnly ? (
          <Text size="small">{level ? level.stocked_quantity : "—"}</Text>
        ) : (
          <Input
            size="small"
            inputMode="numeric"
            placeholder={level ? undefined : "—"}
            value={draft.stock[key] ?? ""}
            aria-invalid={!!errors[`stock:${key}`]}
            onChange={(e) => set({ stock: { ...draft.stock, [key]: e.target.value } })}
          />
        )}
        <Text size="small" className="text-ui-fg-subtle text-right">
          {reserved}
        </Text>
        <Text size="small" className="text-right">
          {stocked - reserved}
        </Text>
        {errors[`stock:${key}`] && (
          <Text size="xsmall" className="text-ui-fg-error col-span-4">
            {errors[`stock:${key}`]}
          </Text>
        )}
      </div>
    )
  }

  const stockHeader = (
    <div className="text-ui-fg-muted grid grid-cols-[1fr_120px_80px_80px] gap-x-3">
      <Text size="xsmall">Αποθήκη</Text>
      <Text size="xsmall">Σε απόθεμα</Text>
      <Text size="xsmall" className="text-right">
        Δεσμευμένα
      </Text>
      <Text size="xsmall" className="text-right">
        Διαθέσιμα
      </Text>
    </div>
  )

  const requiredError = errors["stock:required"] && (
    <Text size="xsmall" className="text-ui-fg-error">
      {errors["stock:required"]}
    </Text>
  )

  const renderStock = () => {
    if (!draft.manage_inventory) {
      return (
        <Note>
          {base.manage_inventory
            ? "Με την αποθήκευση η εγγραφή αποθέματος αποσυνδέεται από την παραλλαγή και οι ποσότητες δεν θα μετρώνται."
            : "Το απόθεμα δεν παρακολουθείται για αυτή την παραλλαγή — πωλείται χωρίς όριο ποσότητας."}
        </Note>
      )
    }
    if (!locations) return <Note error>Δεν φορτώθηκαν οι αποθήκες: {sectionErrors.locations}</Note>
    if (!locations.length) return <Note>Δεν υπάρχουν αποθήκες. Προσθέστε μία από Ρυθμίσεις → Τοποθεσίες.</Note>

    if (!links.length) {
      const itemId = draft.relink && orphan ? orphan.id : NEW_ITEM
      const orphanTotal = (orphan?.levels ?? []).reduce((sum, l) => sum + l.stocked_quantity, 0)
      return (
        <div className="flex flex-col gap-y-3">
          <Note>
            {loaded.isNew
              ? "Συμπληρώστε την ποσότητα ανά αποθήκη (έστω 0)."
              : base.manage_inventory
                ? "Η παραλλαγή δεν έχει εγγραφή αποθέματος. Συμπληρώστε ποσότητα για να δημιουργηθεί."
                : "Με την αποθήκευση θα δημιουργηθεί εγγραφή αποθέματος με τις ποσότητες που θα συμπληρώσετε."}
          </Note>
          {orphan && (
            <label className="flex cursor-pointer items-start gap-x-2">
              <Checkbox className="mt-0.5" checked={draft.relink} onCheckedChange={(c) => set({ relink: c === true })} />
              <div className="flex flex-col">
                <Text size="small" weight="plus">
                  Επανασύνδεση με υπάρχουσα εγγραφή αποθέματος
                </Text>
                <Note>
                  Βρέθηκε ασύνδετη εγγραφή με το ίδιο SKU ({orphan.sku}), {orphanTotal} τεμ. σε απόθεμα. Επιλέξτε τη
                  μόνο αν ανήκει σε αυτή την παραλλαγή.
                </Note>
              </div>
            </label>
          )}
          {stockHeader}
          {locations.map((loc) => stockRow(itemId, loc, loadedLevel(loaded, itemId, loc.id)))}
          {requiredError}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-y-4">
        {links.map((link) => {
          const shared = isShared(link)
          const missing = !link.inventory
          return (
            <div key={link.inventory_item_id} className="flex flex-col gap-y-2">
              {(links.length > 1 || shared || missing || (link.required_quantity ?? 1) > 1) && (
                <Text size="small" weight="plus">
                  {link.inventory?.title || link.inventory?.sku || link.inventory_item_id}
                  {(link.required_quantity ?? 1) > 1 && ` · ${link.required_quantity} τεμ. ανά παραλλαγή`}
                </Text>
              )}
              {missing && (
                <Note>Η εγγραφή αποθέματος δεν βρέθηκε (ίσως διαγράφηκε), οπότε δεν αλλάζει από εδώ.</Note>
              )}
              {shared && (
                <Note>
                  Η εγγραφή αυτή μοιράζεται με {(link.inventory?.variants?.length ?? 1) - 1} ακόμη παραλλαγή(-ές), οπότε
                  δεν αλλάζει από εδώ — αλλάξτε την από τη σελίδα «Αποθέματα».
                </Note>
              )}
              {stockHeader}
              {locations.map((loc) =>
                stockRow(
                  link.inventory_item_id,
                  loc,
                  link.inventory?.location_levels?.find((l) => l.location_id === loc.id),
                  shared || missing
                )
              )}
            </div>
          )
        })}
        <Note>Αποθήκη χωρίς ποσότητα («—»): συμπληρώστε αριθμό για να προστεθεί.</Note>
        {requiredError}
      </div>
    )
  }

  return (
    <>
      {/* 1 ── Βασικά στοιχεία */}
      <Section title="Βασικά στοιχεία">
        {text("title", "Τίτλος *")}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {text("sku", "SKU")}
          {text("material", "Υλικό")}
          {text("ean", "EAN")}
          {text("upc", "UPC")}
          {text("barcode", "Barcode")}
        </div>
        {normText(draft.sku) !== normText(base.sku) &&
          links.some((l) => l.inventory?.sku && l.inventory.sku !== normText(draft.sku)) && (
            <Note>
              Το SKU της εγγραφής αποθέματος («{links.find((l) => l.inventory?.sku)?.inventory?.sku}») δεν αλλάζει από
              εδώ — αλλάζει από τη σελίδα «Αποθέματα».
            </Note>
          )}
        {!!product.options?.length && (
          <div className="flex flex-col gap-y-3">
            <Label size="small" weight="plus">
              Επιλογές
            </Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {product.options.map((o) => (
                <Field key={o.id} label={o.title} error={errors[`option:${o.id}`]}>
                  <Select
                    size="small"
                    value={draft.options[o.id] ?? ""}
                    onValueChange={(value) => set({ options: { ...draft.options, [o.id]: value } })}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Επιλέξτε…" />
                    </Select.Trigger>
                    <Select.Content>
                      {(o.values ?? []).map((v) => (
                        <Select.Item key={v.id} value={v.value}>
                          {v.value}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Field>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* 2 ── Τιμές */}
      <Section title="Τιμές" hint="Οι τιμές περιλαμβάνουν ΦΠΑ. Ένα κενό πεδίο αφήνει την υπάρχουσα τιμή ως έχει.">
        {!currencies ? (
          <Note error>Δεν φορτώθηκαν τα νομίσματα του καταστήματος: {sectionErrors.currencies}</Note>
        ) : (
          <>
            {loaded.priceLock && <Note error>{loaded.priceLock}</Note>}
            {currencies.length === 0 && <Note>Το κατάστημα δεν έχει νομίσματα.</Note>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {currencies.map((c) => {
                const code = c.currency_code
                const symbol = c.currency?.symbol_native ?? code.toUpperCase()
                return (
                  <div key={code} className={clx(c.is_default && "sm:col-span-2")}>
                    <Field
                      label={`${c.currency?.name ?? code.toUpperCase()} (${code.toUpperCase()})`}
                      error={errors[`price:${code}`]}
                    >
                      <div className="flex items-center gap-x-2">
                        <Text size={c.is_default ? "large" : "small"} weight="plus" className="w-6 text-center">
                          {symbol}
                        </Text>
                        <Input
                          size={c.is_default ? "base" : "small"}
                          inputMode="decimal"
                          placeholder={base.prices[code] ? base.prices[code] : "Χωρίς τιμή"}
                          value={draft.prices[code] ?? ""}
                          disabled={!!loaded.priceLock}
                          aria-invalid={!!errors[`price:${code}`]}
                          className={clx(c.is_default && "font-medium")}
                          onChange={(e) => set({ prices: { ...draft.prices, [code]: e.target.value } })}
                        />
                      </div>
                    </Field>
                  </div>
                )
              })}
            </div>
            {regions === null ? (
              <Note error>Δεν φορτώθηκαν οι περιοχές: {sectionErrors.regions}</Note>
            ) : (
              regions.length > 0 && (
                <div className="flex flex-col gap-y-2">
                  <Text size="xsmall" weight="plus" className="text-ui-fg-subtle">
                    Τιμές ανά περιοχή — κενό: ισχύει η τιμή του νομίσματος
                  </Text>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {regions.map((r) => (
                      <Field
                        key={r.id}
                        label={`${r.name} (${r.currency_code.toUpperCase()})`}
                        error={errors[`region:${r.id}`]}
                      >
                        <Input
                          size="small"
                          inputMode="decimal"
                          placeholder={base.regionPrices[r.id] ? base.regionPrices[r.id] : "Χωρίς τιμή περιοχής"}
                          value={draft.regionPrices[r.id] ?? ""}
                          disabled={!!loaded.priceLock}
                          aria-invalid={!!errors[`region:${r.id}`]}
                          onChange={(e) => set({ regionPrices: { ...draft.regionPrices, [r.id]: e.target.value } })}
                        />
                      </Field>
                    ))}
                  </div>
                </div>
              )
            )}
            {otherPrices.length > 0 &&
              readOnlyPrices("Άλλες τιμές — δεν αλλάζουν από εδώ και διατηρούνται κατά την αποθήκευση", otherPrices)}
            {listPrices.length > 0 &&
              readOnlyPrices("Τιμές λιστών τιμών (εκπτώσεις) — αλλάζουν από τις «Λίστες τιμών»", listPrices)}
          </>
        )}
      </Section>

      {/* 3 ── Απόθεμα */}
      <Section title="Απόθεμα">
        <div className="flex flex-col gap-y-3">
          <div className="flex items-center justify-between gap-x-4">
            <Label size="small" weight="plus" htmlFor="vqe-manage">
              Διαχείριση αποθέματος
            </Label>
            <Switch
              id="vqe-manage"
              checked={draft.manage_inventory}
              // Turning tracking on needs the warehouses to put stock in.
              disabled={!locations && !base.manage_inventory}
              onCheckedChange={(v) => set({ manage_inventory: v })}
            />
          </div>
          <div className="flex items-center justify-between gap-x-4">
            <Label size="small" weight="plus" htmlFor="vqe-backorder">
              Επιτρέπονται παραγγελίες χωρίς απόθεμα
            </Label>
            <Switch
              id="vqe-backorder"
              checked={draft.allow_backorder}
              onCheckedChange={(v) => set({ allow_backorder: v })}
            />
          </div>
        </div>
        {renderStock()}
      </Section>

      {/* 4 ── Εικόνες παραλλαγής */}
      <Section
        title="Εικόνες παραλλαγής"
        hint="Οι φωτογραφίες αυτής της παραλλαγής, με τη σειρά που εμφανίζονται στο κατάστημα. Ανεβάστε νέες ή προσθέστε από τις εικόνες του προϊόντος που δεν ανήκουν σε άλλη παραλλαγή. Όλα αποθηκεύονται με την «Αποθήκευση»."
      >
        <div className="flex items-center justify-between gap-x-3">
          <Text size="small" weight="plus">
            {tiles.length === 0
              ? "Καμία εικόνα στην παραλλαγή"
              : tiles.length === 1
                ? "1 εικόνα στην παραλλαγή"
                : `${tiles.length} εικόνες στην παραλλαγή`}
          </Text>
          <Button size="small" variant="secondary" type="button" onClick={() => setPickerOpen(true)}>
            <Plus />
            Προσθήκη εικόνων
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tiles.map((tile, index) => {
            const isThumb = thumbnail === tile.url
            return (
              <div
                key={tile.key}
                className={clx(
                  "flex flex-col overflow-hidden rounded-lg border",
                  isThumb ? "border-ui-border-interactive" : "border-ui-border-base"
                )}
              >
                <div className="bg-ui-bg-subtle relative aspect-square">
                  <img
                    src={displaySrc(tile.url)}
                    alt=""
                    title={tile.url}
                    loading="lazy"
                    className="size-full object-cover"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.opacity = "0.15"
                    }}
                  />
                  <span className="absolute left-2 top-2 flex flex-col items-start gap-1">
                    {isThumb && (
                      <Badge size="2xsmall" color="blue">
                        Κύρια
                      </Badge>
                    )}
                    {!tile.id && (
                      <Badge size="2xsmall" color="green">
                        Νέα
                      </Badge>
                    )}
                  </span>
                  <span className="absolute right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenu.Trigger asChild>
                        <IconButton size="2xsmall" type="button" aria-label="Ενέργειες εικόνας">
                          <EllipsisHorizontal />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content align="end">
                        <DropdownMenu.Item onClick={() => set({ thumbnail: isThumb ? null : tile.url })}>
                          <StarSolid className="text-ui-fg-subtle" />
                          {isThumb ? "Να μην είναι κύρια" : "Ορισμός ως κύρια"}
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item onClick={() => removeFromVariant(tile)}>
                          <XMarkMini className="text-ui-fg-subtle" />
                          {tile.id ? "Αφαίρεση από την παραλλαγή" : "Να μην προστεθεί"}
                        </DropdownMenu.Item>
                        {tile.id && (
                          <DropdownMenu.Item onClick={() => deleteCompletely(tile)} className="text-ui-fg-error">
                            <Trash />
                            Οριστική διαγραφή εικόνας
                          </DropdownMenu.Item>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </span>
                </div>
                <div className="flex items-center gap-x-1 p-2">
                  <IconButton
                    size="small"
                    type="button"
                    variant="transparent"
                    aria-label="Μετακίνηση αριστερά"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowLeftMini />
                  </IconButton>
                  <Button
                    size="small"
                    type="button"
                    variant={isThumb ? "primary" : "secondary"}
                    className="flex-1"
                    onClick={() => set({ thumbnail: isThumb ? null : tile.url })}
                  >
                    {isThumb ? <StarSolid /> : null}
                    {isThumb ? "Κύρια" : "Κύρια;"}
                  </Button>
                  <IconButton
                    size="small"
                    type="button"
                    variant="transparent"
                    aria-label="Μετακίνηση δεξιά"
                    disabled={index === tiles.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowRightMini />
                  </IconButton>
                </div>
              </div>
            )
          })}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="border-ui-border-strong bg-ui-bg-field text-ui-fg-muted hover:border-ui-border-interactive hover:text-ui-fg-base flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed transition-colors"
          >
            <Plus />
            <span className="text-xs">Μεταφόρτωση ή βιβλιοθήκη</span>
          </button>
        </div>

        {draft.newUrls.length > 0 && (
          <Note>
            {draft.newUrls.length === 1
              ? "Η νέα εικόνα θα προστεθεί σε αυτή την παραλλαγή με την αποθήκευση."
              : `Οι ${draft.newUrls.length} νέες εικόνες θα προστεθούν σε αυτή την παραλλαγή με την αποθήκευση.`}
          </Note>
        )}
        {thumbnail && !draft.newUrls.includes(thumbnail) && !images.some((i) => i.url === thumbnail) && (
          <div className="flex items-center justify-between gap-x-3">
            <Note>Η τρέχουσα κύρια εικόνα δεν είναι από τις εικόνες του προϊόντος.</Note>
            <Button size="small" variant="transparent" type="button" onClick={() => set({ thumbnail: null })}>
              Αφαίρεση
            </Button>
          </div>
        )}

        {pendingDelete.length > 0 && (
          <div className="border-ui-border-error flex flex-col gap-y-2 rounded-lg border border-dashed p-3">
            <Text size="small" weight="plus" className="text-ui-fg-error">
              Θα διαγραφούν οριστικά από το προϊόν με την αποθήκευση
            </Text>
            <div className="flex flex-wrap gap-2">
              {pendingDelete.map((img) => (
                <div key={img.id} className="flex items-center gap-x-2 rounded-md border p-1 pr-2">
                  <img src={displaySrc(img.url)} alt="" className="size-8 rounded object-cover" />
                  <Button size="small" variant="transparent" type="button" onClick={() => undoDelete(img.id)}>
                    Αναίρεση
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {unassigned.length > 0 && (
          <div className="flex flex-col gap-y-3">
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">
                Εικόνες του προϊόντος χωρίς παραλλαγή
              </Text>
              <Note>Πατήστε μια εικόνα για να την προσθέσετε σε αυτή την παραλλαγή.</Note>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {unassigned.map((img) => {
                const leaving = base.imageIds.includes(img.id)
                // Picked as main, but the picture leaves the variant: the save clears it.
                const clearing = draft.thumbnail === img.url && thumbnail !== img.url
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => addExisting(img.id)}
                    className={clx(
                      "flex flex-col overflow-hidden rounded-lg border text-left",
                      leaving ? "border-ui-border-error" : "border-ui-border-base hover:border-ui-border-interactive"
                    )}
                  >
                    <span className="bg-ui-bg-subtle relative block aspect-square">
                      <img
                        src={displaySrc(img.url)}
                        alt=""
                        title={img.url}
                        loading="lazy"
                        className="size-full object-cover"
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).style.opacity = "0.15"
                        }}
                      />
                      {leaving && (
                        <span className="absolute left-1.5 top-1.5">
                          <Badge size="2xsmall" color="red">
                            Αφαιρείται
                          </Badge>
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-x-1 p-2">
                      <Plus className="text-ui-fg-subtle" />
                      <Text size="xsmall">{leaving ? "Επαναφορά" : "Στην παραλλαγή"}</Text>
                    </span>
                    {clearing && (
                      <Text size="xsmall" className="text-ui-fg-subtle px-2 pb-2">
                        Δεν θα είναι πλέον κύρια.
                      </Text>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <MediaPickerModal
          open={pickerOpen}
          title="Προσθήκη εικόνων παραλλαγής"
          multiple
          onClose={() => setPickerOpen(false)}
          productImages={unassigned.map((i) => ({ id: i.id, url: i.url }))}
          disabledUrls={[
            ...tiles.map((t) => t.url),
            // A picture that belongs to another variant is not shared from here.
            ...images.filter((i) => usedElsewhere(i) && !draft.imageIds.includes(i.id)).map((i) => i.url),
          ]}
          onPick={(urls) => {
            setPickerOpen(false)
            addPicked(urls)
          }}
        />
      </Section>

      {/* 5 ── Κατηγορίες προϊόντος */}
      <Section title="Κατηγορίες προϊόντος" hint="Ισχύει για όλο το προϊόν, όχι μόνο την παραλλαγή.">
        {!loaded.categories ? (
          <Note error>Δεν φορτώθηκαν οι κατηγορίες: {sectionErrors.categories}</Note>
        ) : tree.length === 0 ? (
          <Note>Δεν υπάρχουν κατηγορίες.</Note>
        ) : (
          <div className="flex flex-col gap-y-2">
            {tree.map(({ category, depth }) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-x-2"
                style={{ paddingLeft: depth * 20 }}
              >
                <Checkbox
                  checked={draft.categoryIds.includes(category.id)}
                  onCheckedChange={(c) =>
                    set({ categoryIds: toggle(draft.categoryIds, category.id, c === true) })
                  }
                />
                <Text size="small">{category.name}</Text>
              </label>
            ))}
          </div>
        )}
      </Section>

      {/* 6 ── Διαστάσεις & τελωνείο (collapsed) */}
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
          <Heading level="h3">Διαστάσεις & τελωνείο</Heading>
          <Text size="small" className="text-ui-fg-subtle group-open:hidden">
            Εμφάνιση
          </Text>
          <Text size="small" className="text-ui-fg-subtle hidden group-open:inline">
            Απόκρυψη
          </Text>
        </summary>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              ["weight", "Βάρος"],
              ["length", "Μήκος"],
              ["width", "Πλάτος"],
              ["height", "Ύψος"],
            ] as [NumberKey, string][]
          ).map(([key, label]) => (
            <Field key={key} label={label} error={errors[key]}>
              <Input
                size="small"
                inputMode="decimal"
                value={draft[key]}
                aria-invalid={!!errors[key]}
                onChange={(e) => set({ [key]: e.target.value } as Partial<Draft>)}
              />
            </Field>
          ))}
          {text("hs_code", "HS code")}
          {text("mid_code", "MID code")}
          {text("origin_country", "Χώρα προέλευσης (κωδικός, π.χ. gr)")}
        </div>
      </details>
    </>
  )
}

// ─── public component ─────────────────────────────────────────────────────────

/**
 * Mounted only while open, keyed per variant, so every opening starts from a
 * fresh read. `variantId: null` opens the drawer in «Νέα παραλλαγή» mode.
 */
export const VariantDrawer = ({
  productId,
  variantId,
  open,
  onClose,
}: {
  productId: string
  variantId: string | null
  open: boolean
  onClose: () => void
}) =>
  open ? (
    <VariantEditor key={variantId ?? "new"} productId={productId} variantId={variantId} open onClose={onClose} />
  ) : null
