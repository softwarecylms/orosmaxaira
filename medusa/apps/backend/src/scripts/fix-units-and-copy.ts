import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * One-off fix for unit notation and a few English wordings.
 *
 * The estimated-sign ℮ (U+212E) had been scraped as a plain "e", the two units
 * ran together without a separator, and the imperial form was written British-
 * style ("fl. oz. US") instead of "US fl oz":
 *   "100 ml e 3.38 fl. oz. US"  ->  "100 ml ℮ | 3.38 US fl oz"
 *
 * Also: "meaningful" was a calque of «ουσιαστικό» (= effective), "With … with"
 * repeated, and "without any greasy feeling" read awkwardly.
 * Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-units-and-copy.ts
 */

const COPY: [string, string][] = [
  ["covering everyday care needs in a simple and meaningful way.", "covering everyday care needs simply and effectively."],
  ["With natural ingredients enriched with valuable elements from the hive", "Made with natural ingredients and prized ingredients from the hive"],
  ["With natural ingredients, enriched with valuable elements from the hive", "Made with natural ingredients and prized ingredients from the hive"],
  ["without any greasy feeling", "with no greasy residue"],
  ["moisturizing and protective", "moisturising and protective"],
]

function fix(value: string): string {
  let v = value.replace(
    /\*\*(\d+(?:[.,]\d+)?)\s*(ml|g|gr|kg)\s*e\*\*\s*\n\s*\*\*(\d+(?:[.,]\d+)?)\s*fl\.?\s*oz\.?\s*US\*\*/gi,
    (_m, n: string, u: string, oz: string) => `**${n} ${u} ℮ | ${oz} US fl oz**`,
  )
  v = v.replace(
    /(\d+(?:[.,]\d+)?)\s*(ml|g|gr|kg)\s*e\s*\|?\s*(\d+(?:[.,]\d+)?)\s*fl\.?\s*oz\.?\s*US/gi,
    (_m, n: string, u: string, oz: string) => `${n} ${u} ℮ | ${oz} US fl oz`,
  )
  return COPY.reduce((out, [a, b]) => out.split(a).join(b), v)
}

export default async function fixUnitsAndCopy({ container }: ExecArgs) {
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
      const next = fix(p.description)
      if (next !== p.description) update.description = next
    }
    if (typeof metadata.description_en === "string") {
      const next = fix(metadata.description_en)
      if (next !== metadata.description_en) {
        update.metadata = { ...metadata, description_en: next }
      }
    }
    if (!Object.keys(update).length) continue

    await productService.updateProducts(p.id, update)
    changed++
    logger.info(`Units/copy fixed: ${p.handle}`)
  }

  logger.info(`✓ Units and copy tidied — products updated: ${changed}`)
}
