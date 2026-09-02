import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Applies the English house style to `metadata.description_en`:
 *
 *   • typographic quotes — “ ” and ‘ ’, never straight " or '
 *   • a space between a number and its unit — 500 g, 250 ml, 1 kg
 *   • en dash, unspaced, for numeric ranges — 200–250 g, 10–15 minutes
 *
 * The Greek `description` is deliberately left alone: Greek takes « » and its
 * own conventions.
 *
 * Idempotent — the transforms are stable, so re-running changes nothing.
 *   npx medusa exec ./src/scripts/fix-en-house-style.ts
 */

function quotes(t: string): string {
  t = t.replace(/(\p{L})'(\p{L})/gu, "$1’$2")
  t = t.replace(/(\p{L})'(?=[\s.,;:!?)\]]|$)/gu, "$1’")
  t = t.replace(/(^|\s)'(?=\d|\p{L})/gu, "$1‘")
  t = t.replace(/"/g, (_m, i: number, s: string) => {
    const prev = s[i - 1]
    return prev === undefined || /[\s(\[\-—–]/.test(prev) ? "“" : "”"
  })
  t = t.replace(/'/g, (_m, i: number, s: string) => {
    const prev = s[i - 1]
    return prev === undefined || /[\s(\[\-—–]/.test(prev) ? "‘" : "’"
  })
  return t
}

function houseStyle(text: string): string {
  return text.replace(/(<[^>]*>)|([^<]+)/g, (_m, tag: string, txt: string) => {
    if (tag) return tag
    let t = quotes(txt)
    t = t
      .replace(/(\d)\s?(kg|Kg|KG)\b/g, "$1 kg")
      .replace(/(\d)(g|gr)\b/g, "$1 $2")
      .replace(/(\d)(ml|mL|ML)\b/g, "$1 ml")
      .replace(/(\d) gr\b/g, "$1 g")
    return t.replace(/(?<=\d)\s?-\s?(?=\d)/g, "–")
  })
}

export default async function fixEnHouseStyle({ container }: ExecArgs) {
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
    if (typeof metadata.description_en !== "string") continue
    const next = houseStyle(metadata.description_en)
    if (next === metadata.description_en) continue

    await productService.updateProducts(p.id, {
      metadata: { ...metadata, description_en: next },
    })
    changed++
    logger.info(`  restyled ${p.handle}`)
  }

  logger.info(`✓ English house style applied — products updated: ${changed}`)
}
