import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * One-off formatting fix for the product descriptions.
 *
 * The copy scraped from the old store arrived as one unbroken block: the
 * ALL-CAPS headline, the "N% organic ingredients" line, the body and the size
 * spec all ran together, and punctuation had drifted away from the words it
 * belongs to ("κερί μέλισσας , συστατικά").
 *
 * The product page renders descriptions with `whitespace-pre-line`, so the
 * newlines below are what produce the paragraphs. Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-description-layout.ts
 */

/** No space before punctuation; no doubled spaces. */
function tidyPunctuation(value: string): string {
  return value
    .replace(/\s+([,;:!?»])/g, "$1")
    .replace(/([«])\s+/g, "$1")
    .replace(/\s+\.(\s|$)/g, ".$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

/** Break apart the blocks the old scrape ran together. */
function structure(value: string): string {
  let s = tidyPunctuation(value)
  s = s.replace(/\s+(\d+\s*%\s*(?:βιολογικά συστατικά|organic ingredients))\s+/g, "\n\n$1\n\n")
  s = s.replace(/\s+(\d+(?:[.,]\d+)?\s*(?:ml|g|gr|kg)\s+e\s.*)$/i, "\n\n$1")
  s = s.replace(
    /^([^\n]*[Α-ΩΆ-ΏA-Z]{4,}[^\n]*?)\s+((?:[Α-ΩΆ-Ώ][α-ωά-ώ]|[A-Z][a-z])[^\n]*)$/m,
    (m, caps: string, rest: string) => (/[α-ωά-ώa-z]{4,}/.test(caps) ? m : `${caps}\n\n${rest}`),
  )
  return s.replace(/\n{3,}/g, "\n\n").trim()
}

export default async function fixDescriptionLayout({ container }: ExecArgs) {
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
      const next = structure(p.description)
      if (next !== p.description) update.description = next
    }
    if (typeof metadata.description_en === "string") {
      const next = structure(metadata.description_en)
      if (next !== metadata.description_en) {
        update.metadata = { ...metadata, description_en: next }
      }
    }
    if (!Object.keys(update).length) continue

    await productService.updateProducts(p.id, update)
    changed++
    logger.info(`Restructured ${p.handle}`)
  }

  logger.info(`✓ Description layout tidied — products updated: ${changed}`)
}
