// Emit the Medusa product-seed dataset from the storefront's live catalogue
// (src/components/shop/shop-content.ts — the single source of truth, incl. the
// hand-tuned categories + per-size variant prices). Run with:
//
//   npx tsx scripts/gen-medusa-seed.mts
//
// Writes medusa/apps/backend/src/scripts/oros-products.json, which the Medusa
// seed script (seed-oros-products.ts) reads. Prices are emitted as DECIMAL euros
// (Medusa v2 stores major-unit amounts, e.g. 3.5 = €3,50).
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  SHOP_PRODUCTS,
  PRODUCT_DETAILS,
  handleOf,
  type ShopCategory,
} from '../src/components/shop/shop-content.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const outFile = path.resolve(
  here,
  '../medusa/apps/backend/src/scripts/oros-products.json',
)

type SeedVariant = {
  title: string
  size: string | null
  container: string | null
  amount: number // decimal euros
  sku: string
}
type SeedProduct = {
  handle: string
  title: string
  category: ShopCategory
  description: string
  thumbnail: string
  images: string[]
  inStock: boolean
  variants: SeedVariant[]
}

const cents = (n: number) => Math.round(n) / 100

const products: SeedProduct[] = SHOP_PRODUCTS.map((p) => {
  const handle = handleOf(p)
  const detail = PRODUCT_DETAILS[handle] ?? {}
  const sizes = detail.variations?.sizes ?? []

  const gallery =
    sizes.length > 0
      ? [p.image, ...(detail.gallery ?? [])]
      : detail.gallery?.length
        ? detail.gallery
        : [p.image]
  // de-dupe while preserving order
  const images = [...new Set(gallery)].filter(Boolean)

  const variants: SeedVariant[] =
    sizes.length > 0
      ? sizes.map((s, i) => ({
          title: s.container ? `${s.label} · ${s.container}` : s.label,
          size: s.label,
          container: s.container ?? null,
          amount: cents(s.sortPrice),
          sku: `${handle}-v${i + 1}`,
        }))
      : [
          {
            title: 'Default',
            size: null,
            container: null,
            amount: cents(p.sortPrice),
            sku: handle,
          },
        ]

  return {
    handle,
    title: p.title,
    category: p.category,
    description: detail.description ?? '',
    thumbnail: p.image,
    images,
    inStock: p.inStock,
    variants,
  }
})

const CATEGORIES = [...new Set(products.map((p) => p.category))]

writeFileSync(outFile, JSON.stringify({ categories: CATEGORIES, products }, null, 2))
console.error(
  `Wrote ${products.length} products (${products.filter((p) => p.variants.length > 1).length} multi-variant), ` +
    `${CATEGORIES.length} categories → ${path.relative(process.cwd(), outFile)}`,
)
