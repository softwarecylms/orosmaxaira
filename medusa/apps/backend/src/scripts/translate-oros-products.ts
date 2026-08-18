import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import enData from "./oros-products.en.json"

/**
 * Populate ENGLISH translations into Medusa product/variant/category `metadata`
 * (Medusa v2 has no native product i18n). The storefront reads these under /en.
 * Idempotent: merges only the *_en keys, never touches EL fields, prices or stock.
 *   npx medusa exec ./src/scripts/translate-oros-products.ts
 *
 * EN product titles/descriptions come from oros-products.en.json (sourced from the
 * live /en WooCommerce store, with hand-translation where absent).
 */

const CATEGORY_EN: Record<string, string> = {
  Μέλι: "Honey",
  "Προϊόντα Μέλισσας": "Bee Products",
  Καλλυντικά: "Natural Cosmetics",
  "Πακέτα Δώρων": "Gift Sets",
}

// Container / packaging words that appear in Greek variant titles.
const WORD_EN: Record<string, string> = {
  Γυάλινο: "Glass",
  Πλαστικό: "Plastic",
  "Γυάλινο βαζάκι": "Glass jar",
  "Πλαστικό μπουκάλι": "Plastic bottle",
  Βαζάκι: "Jar",
  Μπουκάλι: "Bottle",
  Τεμάχιο: "Piece",
  Συσκευασία: "Package",
  Μέγεθος: "Size",
}

/** Translate a Greek variant title like "500g · Γυάλινο" → "500g · Glass". */
function translateVariantTitle(title: string): string {
  let out = title
  // longest keys first so "Γυάλινο βαζάκι" wins over "Γυάλινο"
  for (const [el, en] of Object.entries(WORD_EN).sort((a, b) => b[0].length - a[0].length)) {
    out = out.split(el).join(en)
  }
  return out
}

type EnEntry = { title_en: string; description_en: string }

export default async function translateOrosProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  const en = enData as Record<string, EnEntry>

  // --- Categories ---
  const { data: cats } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "metadata"],
  })
  let catCount = 0
  for (const c of cats) {
    const nameEn = CATEGORY_EN[c.name as string]
    if (!nameEn) continue
    await productService.updateProductCategories(c.id, {
      metadata: { ...(c.metadata ?? {}), name_en: nameEn },
    })
    catCount++
  }
  logger.info(`✓ Categories translated: ${catCount}`)

  // --- Products + variants ---
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title", "metadata", "variants.id", "variants.title", "variants.metadata"],
  })

  let prodCount = 0
  let varCount = 0
  let missing = 0
  for (const p of products) {
    const entry = en[p.handle as string]
    if (!entry) {
      if ((p.title as string)?.startsWith("Medusa ")) continue // demo leftovers, if any
      logger.warn(`No EN entry for handle: ${p.handle}`)
      missing++
      continue
    }
    await productService.updateProducts(p.id, {
      metadata: {
        ...(p.metadata ?? {}),
        title_en: entry.title_en,
        description_en: entry.description_en,
      },
    })
    prodCount++

    for (const v of (p.variants ?? []) as { id: string; title: string; metadata?: Record<string, unknown> }[]) {
      const titleEn = translateVariantTitle(v.title ?? "")
      if (titleEn === v.title) continue // nothing to translate (e.g. "500g")
      await productService.updateProductVariants(v.id, {
        metadata: { ...(v.metadata ?? {}), title_en: titleEn },
      })
      varCount++
    }
  }

  logger.info(`✓ Products translated: ${prodCount} (variants: ${varCount}, missing EN: ${missing})`)
}
