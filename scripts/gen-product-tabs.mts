// Emit the per-product tab content (Περιγραφή sections + Διατροφική Αξία rows)
// from the storefront's editorial snapshot, so Medusa can hold it and the admin
// can edit it. Run with:
//
//   npx tsx scripts/gen-product-tabs.mts
//
// Writes medusa/apps/backend/src/scripts/product-tabs.json, which
// seed-product-tabs.ts loads into each product's metadata. That seed only fills
// keys that are MISSING, so it never overwrites an admin edit — it exists to
// give the admin editor the content that is already live, rather than a blank
// form.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  PRODUCT_DETAILS,
  PRODUCT_DETAILS_EN,
  type ShopProductDetail,
} from '../src/components/shop/shop-content.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const outFile = path.resolve(here, '../medusa/apps/backend/src/scripts/product-tabs.json')

type Tabs = {
  sections?: ShopProductDetail['sections']
  sections_en?: ShopProductDetail['sections']
  nutrition?: ShopProductDetail['nutrition']
  nutrition_en?: ShopProductDetail['nutrition']
}

const out: Record<string, Tabs> = {}

for (const handle of new Set([...Object.keys(PRODUCT_DETAILS), ...Object.keys(PRODUCT_DETAILS_EN)])) {
  const el = PRODUCT_DETAILS[handle]
  const en = PRODUCT_DETAILS_EN[handle]

  const tabs: Tabs = {}
  if (el?.sections?.length) tabs.sections = el.sections
  if (en?.sections?.length) tabs.sections_en = en.sections
  if (el?.nutrition?.rows?.length) tabs.nutrition = el.nutrition
  if (en?.nutrition?.rows?.length) tabs.nutrition_en = en.nutrition

  if (Object.keys(tabs).length) out[handle] = tabs
}

writeFileSync(outFile, JSON.stringify(out, null, 1) + '\n', 'utf8')

const n = Object.keys(out).length
const withNutrition = Object.values(out).filter((t) => t.nutrition).length
console.log(`product-tabs.json: ${n} products (${withNutrition} with nutrition) → ${outFile}`)
