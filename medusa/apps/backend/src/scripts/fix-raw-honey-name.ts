import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * "Raw (Unheated) Blossom Honey" → "Raw Blossom Honey".
 *
 * In English "raw" already means unheated, so the parenthetical was a redundant
 * carry-over from the Greek «Άβραστο (άθερμο)» — where the two words do differ
 * (unboiled / unheated), so the Greek title keeps its clarifier.
 *
 * Targeted on purpose: translate-oros-products.ts would also push this title,
 * but it rewrites `title_en` AND `description_en` for all 31 products from
 * oros-products.en.json and would clobber any admin edits. Idempotent.
 *
 *   npx medusa exec ./src/scripts/fix-raw-honey-name.ts
 *
 * Run against local AND the Railway prod DB (see the deploy notes).
 */

const HANDLE = "avrasto-meli-antheon-oros-machaira"
const TITLE_EN = "Oros Machaira Raw Blossom Honey"

export default async function fixRawHoneyName({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
    filters: { handle: HANDLE },
  })

  if (!products.length) {
    logger.warn(`No product with handle '${HANDLE}' — nothing to do.`)
    return
  }

  let changed = 0
  for (const p of products) {
    const metadata = (p.metadata ?? {}) as Record<string, unknown>
    if (metadata.title_en === TITLE_EN) continue

    logger.info(`  ${metadata.title_en} → ${TITLE_EN}`)
    await productService.updateProducts(p.id, {
      metadata: { ...metadata, title_en: TITLE_EN },
    })
    changed++
  }

  logger.info(`✓ Raw honey EN name fixed — records updated: ${changed}`)
}
