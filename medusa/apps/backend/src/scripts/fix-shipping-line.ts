import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * One-off copy fix: every product description ended with a free-shipping
 * sentence carried over from the old WooCommerce store. The product page already
 * shows shipping as its own badge, so the sentence was duplicated information
 * sitting awkwardly after the volume line ("… 0.13 fl. oz. US FREE shipping …").
 *
 * Removes the sentence from both the Greek `description` and the English
 * `metadata.description_en`, leaving the unit marker intact.
 * Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-shipping-line.ts
 */

const SHIPPING = [
  " FREE shipping on purchases over €70",
  " ΔΩΡΕΑΝ μεταφορικά για αγορές άνω των €70",
]

function strip(value: string): string {
  return SHIPPING.reduce((out, s) => out.split(s).join(""), value).replace(/\s+$/, "")
}

export default async function fixShippingLine({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "description", "metadata"],
  })

  let changed = 0
  for (const p of products) {
    const metadata = (p.metadata ?? {}) as Record<string, unknown>
    const update: Record<string, unknown> = {}

    if (typeof p.description === "string") {
      const next = strip(p.description)
      if (next !== p.description) update.description = next
    }
    if (typeof metadata.description_en === "string") {
      const next = strip(metadata.description_en)
      if (next !== metadata.description_en) {
        update.metadata = { ...metadata, description_en: next }
      }
    }
    if (!Object.keys(update).length) continue

    await productService.updateProducts(p.id, update)
    changed++
    logger.info(`Stripped shipping line from ${p.handle}`)
  }

  logger.info(`✓ Free-shipping sentence removed — products updated: ${changed}`)
}
