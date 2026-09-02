import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Two fixes to the English beeswax (`melissokeri`) description:
 *
 *  1. Drops "Delivery is carried out through ACS or Akis Express." — couriers
 *     belong in the shipping policy, not in a product description.
 *  2. Drops "Beeswax has been used as an antiseptic, and studies show that in
 *     the past it was used to treat wounds." — a medicinal claim, prohibited by
 *     Art. 7(3) of Reg. (EU) 1169/2011 and by the cosmetics regime. It survived
 *     the earlier health-claims pass because this product's copy lives only in
 *     `oros-products.en.json`, which that pass did not cover.
 *
 * Idempotent — plain string removal, so re-running is a no-op.
 *   npx medusa exec ./src/scripts/fix-beeswax-copy.ts
 */

const DROP = [
  " Delivery is carried out through ACS or Akis Express.",
  " Beeswax has been used as an antiseptic, and studies show that in the past it was used to treat wounds.",
]

function strip(value: string): string {
  return DROP.reduce((out, s) => out.split(s).join(""), value).replace(/\s+$/, "")
}

export default async function fixBeeswaxCopy({ container }: ExecArgs) {
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
    logger.info(`  cleaned ${p.handle}`)
  }

  logger.info(`✓ Courier line and beeswax medicinal claim removed — products updated: ${changed}`)
}
