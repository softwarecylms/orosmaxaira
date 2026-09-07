import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * The Body Cream called itself three different things in English: the title said
 * "Body Cream", the meta said "a moisturising body cream", and the product body
 * — the Medusa `metadata.description_en` — said "body lotion". In English a
 * cream and a lotion are different products, so the body copy now says cream.
 *
 * Greek was already consistent («Ενυδατική κρέμα σώματος»), so only the EN
 * description changes.
 *
 * Targeted rather than re-running translate-oros-products.ts, which rewrites
 * every product's title_en/description_en and would clobber admin edits.
 * Idempotent.
 *
 *   npx medusa exec ./src/scripts/fix-body-cream-copy.ts
 *
 * Run against local AND the Railway prod DB (see the deploy notes).
 */

const HANDLE = "krema-somatos"
const PAIRS: [string, string][] = [["fast-absorbing body lotion", "fast-absorbing body cream"]]

export default async function fixBodyCreamCopy({ container }: ExecArgs) {
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
    const current = metadata.description_en
    if (typeof current !== "string") continue

    const next = PAIRS.reduce((out, [from, to]) => out.split(from).join(to), current)
    if (next === current) continue

    await productService.updateProducts(p.id, { metadata: { ...metadata, description_en: next } })
    changed++
    logger.info(`  ${p.handle}: "body lotion" → "body cream"`)
  }

  logger.info(`✓ Body Cream EN copy fixed — records updated: ${changed}`)
}
