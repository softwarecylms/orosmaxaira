import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * One-off copy fix: the product editorial scraped from the old WooCommerce site
 * advertised free shipping over €50, while the storefront (header banner, cart
 * nudge, checkout rule, shipping-policy page) uses €70. Rewrite the stale
 * threshold in the Greek `description` and the English `metadata.description_en`.
 *
 * A phrase replace rather than a re-seed, so any description edited in the admin
 * since seeding keeps its edits. Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-free-shipping-threshold.ts
 */

const REPLACEMENTS: [RegExp, string][] = [
  [/ΔΩΡΕΑΝ μεταφορικά για αγορές άνω των €50/g, "ΔΩΡΕΑΝ μεταφορικά για αγορές άνω των €70"],
  [/FREE shipping on purchases over €50/g, "FREE shipping on purchases over €70"],
]

function retarget(value: string): string {
  return REPLACEMENTS.reduce((out, [from, to]) => out.replace(from, to), value)
}

export default async function fixFreeShippingThreshold({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "description", "metadata"],
  })

  let elCount = 0
  let enCount = 0
  for (const p of products) {
    const description = typeof p.description === "string" ? p.description : ""
    const metadata = (p.metadata ?? {}) as Record<string, unknown>
    const descriptionEn =
      typeof metadata.description_en === "string" ? metadata.description_en : ""

    const nextDescription = retarget(description)
    const nextDescriptionEn = retarget(descriptionEn)
    const elChanged = nextDescription !== description
    const enChanged = nextDescriptionEn !== descriptionEn
    if (!elChanged && !enChanged) continue

    await productService.updateProducts(p.id, {
      ...(elChanged ? { description: nextDescription } : {}),
      ...(enChanged ? { metadata: { ...metadata, description_en: nextDescriptionEn } } : {}),
    })
    if (elChanged) elCount++
    if (enChanged) enCount++
    logger.info(`Updated ${p.handle} (el: ${elChanged}, en: ${enChanged})`)
  }

  logger.info(`✓ Free-shipping threshold fixed — EL: ${elCount}, EN: ${enCount}`)
}
