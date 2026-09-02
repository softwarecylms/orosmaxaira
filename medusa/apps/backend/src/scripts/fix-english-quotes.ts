import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * One-off copy fix: the English product fields carried Greek/French guillemets
 * («Oros Machaira»), which do not exist in English typography.
 *
 *   - Titles put the brand first, unquoted: "Thyme Honey «Oros Machaira»"
 *     becomes "Oros Machaira Thyme Honey".
 *   - The brand in running text simply loses the marks.
 *   - Anything still quoted is a real quotation and gets typographic “ ”.
 *
 * Only `metadata.title_en` / `metadata.description_en` are touched — the Greek
 * `title`/`description` columns keep « », which is correct in Greek.
 * Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-english-quotes.ts
 */

const BRAND = "«Oros Machaira»"

/** Product-name corrections: singular first noun ("Hand Cream", not "Hands Cream"),
 *  English adjective order, "&" in titles, and no medicinal-sounding claims. */
const TITLE_FIXES: [string, string][] = [
  ["Milk & Honey Hands Cream (50ml, Organic)", "Milk & Honey Hand Cream"],
  ["Beeswax Balm for Chest & Muscles Rub", "Beeswax Chest & Muscle Rub"],
  ["Face Beeswax Ointment for Pimples & Insect Bites", "Beeswax Face Balm — Blemishes & Bites"],
  ["Face Beeswax Balm", "Beeswax Face Balm"],
  ["Mixture of honey, royal jelly and bee pollen", "Honey, Royal Jelly & Pollen Blend"],
  ["Honey with Carob and Hazelnuts", "Honey with Carob & Hazelnuts"],
  ["Natural hands cream (Red Grape)", "Natural Hands Cream (Red Grape)"],
]

function fixTitle(value: string): string {
  if (!value.includes(BRAND)) return value
  const rest = value.replace(BRAND, "").replace(/\s{2,}/g, " ").trim()
  return `Oros Machaira ${rest}`
}

function fixProse(value: string): string {
  return TITLE_FIXES.reduce((out, [from, to]) => out.split(from).join(to), value)
    .split(BRAND)
    .join("Oros Machaira")
    // one possessive form across the site: Cyprus’s, never Cyprus’
    .replace(/Cyprus’(?!s)/g, "Cyprus’s")
    .replace(/«([^»]+)»/g, (_m, inner: string) => `“${inner}”`)
}

export default async function fixEnglishQuotes({ container }: ExecArgs) {
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

    const title = metadata.title_en
    if (typeof title === "string") {
      const nextTitle = fixProse(fixTitle(title))
      if (nextTitle !== title) {
        next.title_en = nextTitle
        touched = true
      }
    }

    const description = metadata.description_en
    if (typeof description === "string") {
      const nextDescription = fixProse(description)
      if (nextDescription !== description) {
        next.description_en = nextDescription
        touched = true
      }
    }
    if (!touched) continue

    await productService.updateProducts(p.id, { metadata: next })
    changed++
    logger.info(`Updated ${p.handle}: ${next.title_en ?? "(title unchanged)"}`)
  }

  logger.info(`✓ English quotation marks fixed — products updated: ${changed}`)
}
