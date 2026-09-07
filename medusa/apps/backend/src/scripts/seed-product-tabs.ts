import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import tabsData from "./product-tabs.json"

/**
 * Load the product-page tab content — «Περιγραφή» (sections) and «Διατροφική
 * Αξία» (nutrition) — into each product's `metadata`, so the admin's "Περιεχόμενο
 * καρτελών" editor can change it and the storefront reads it from Medusa.
 *
 * Stored as JSON *strings* (`sections_json`, `sections_en_json`,
 * `nutrition_json`, `nutrition_en_json`) rather than nested objects, so the
 * dashboard's own flat key/value metadata editor cannot mangle them.
 *
 * Only fills keys that are MISSING — an admin edit is never overwritten. Pass
 * FORCE=1 to re-apply the repo snapshot over whatever is stored.
 *
 *   npx tsx scripts/gen-product-tabs.mts   # from the storefront, regenerates the JSON
 *   npx medusa exec ./src/scripts/seed-product-tabs.ts
 *
 * Run against local AND the Railway prod DB (see the deploy notes).
 */

type Section = { heading?: string; body: string }
type Nutrition = { unit: string; rows: { label: string; value: string }[] }
type Tabs = {
  sections?: Section[]
  sections_en?: Section[]
  nutrition?: Nutrition
  nutrition_en?: Nutrition
}

/** metadata key ← key in product-tabs.json */
const KEYS: [string, keyof Tabs][] = [
  ["sections_json", "sections"],
  ["sections_en_json", "sections_en"],
  ["nutrition_json", "nutrition"],
  ["nutrition_en_json", "nutrition_en"],
]

export default async function seedProductTabs({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  const force = process.env.FORCE === "1"
  const tabs = tabsData as Record<string, Tabs>

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
  })

  let changed = 0
  let skipped = 0
  for (const p of products) {
    const entry = tabs[p.handle as string]
    if (!entry) continue

    const metadata = (p.metadata ?? {}) as Record<string, unknown>
    const patch: Record<string, unknown> = {}

    for (const [metaKey, dataKey] of KEYS) {
      const value = entry[dataKey]
      if (!value) continue
      if (!force && typeof metadata[metaKey] === "string" && metadata[metaKey] !== "") {
        skipped++
        continue
      }
      const next = JSON.stringify(value)
      if (metadata[metaKey] === next) continue
      patch[metaKey] = next
    }

    if (!Object.keys(patch).length) continue
    await productService.updateProducts(p.id, { metadata: { ...metadata, ...patch } })
    changed++
    logger.info(`  ${p.handle}: ${Object.keys(patch).join(", ")}`)
  }

  logger.info(
    `✓ Product tab content seeded — products updated: ${changed}` +
      (skipped ? ` (kept ${skipped} existing value(s); FORCE=1 to overwrite)` : "")
  )
}
