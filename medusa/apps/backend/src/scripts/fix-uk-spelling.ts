import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * One-off copy fix: the site is written in British English (flavour, colour,
 * programme, crystallisation), but some product copy scraped from the old store
 * carried US forms. Rewrite them in the English product fields.
 *
 * Scoped deliberately to `metadata.title_en` / `metadata.description_en`:
 * "authorized" is also a payment-status enum value elsewhere in the schema, and
 * the English URL slugs (e.g. natural-moisturizing-face-cream-copy) must keep
 * their spelling or live links break. Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-uk-spelling.ts
 */

// Longer forms first so "flavors" is not left as "flavours" -> "flavourss".
const REPLACEMENTS: [string, string][] = [
  ["Moisturizing", "Moisturising"],
  ["moisturizing", "moisturising"],
  ["Moisturizer", "Moisturiser"],
  ["moisturizer", "moisturiser"],
  ["Flavors", "Flavours"],
  ["flavors", "flavours"],
  ["Flavor", "Flavour"],
  ["flavor", "flavour"],
]

function toBritish(value: string): string {
  return REPLACEMENTS.reduce((out, [from, to]) => out.split(from).join(to), value)
}

export default async function fixUkSpelling({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
  })

  let changed = 0
  for (const p of products) {
    const metadata = (p.metadata ?? {}) as Record<string, unknown>
    const next: Record<string, unknown> = { ...metadata }
    let touched = false

    for (const key of ["title_en", "description_en"]) {
      const value = metadata[key]
      if (typeof value !== "string") continue
      const rewritten = toBritish(value)
      if (rewritten !== value) {
        next[key] = rewritten
        touched = true
      }
    }
    if (!touched) continue

    await productService.updateProducts(p.id, { metadata: next })
    changed++
    logger.info(`Updated ${p.handle}`)
  }

  logger.info(`✓ British spelling applied — products updated: ${changed}`)
}
