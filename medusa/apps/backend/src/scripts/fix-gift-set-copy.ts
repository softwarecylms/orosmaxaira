import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * One-off formatting fix for the gift-set descriptions.
 *
 * They were stored as one unbroken run of text, so the headline, the two body
 * paragraphs and the "Includes" list all ran together on the page. This restores
 * the paragraph breaks and puts one item per line. The description also repeated
 * the free-shipping line, which the product page already shows as its own badge,
 * so that sentence is dropped.
 *
 * The page renders the description with `whitespace-pre-line`, so the newlines
 * below are what produce the paragraphs. Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-gift-set-copy.ts
 */

const SHIPPING = [
  " FREE shipping on purchases over €70",
  " ΔΩΡΕΑΝ μεταφορικά για αγορές άνω των €70",
]
const PARA_BREAKS = [
  "A complete skincare set",
  "A practical and thoughtful set",
  "Ένα ολοκληρωμένο σετ",
  "Ένα πρακτικό και ουσιαστικό σετ",
  "With natural ingredients",
  "Με φυσικά συστατικά",
]
const INCLUDES = ["Includes:", "Περιλαμβάνει:"]

function reflow(value: string): string {
  let v = value
  for (const s of SHIPPING) v = v.split(s).join("")
  v = v.trim()
  for (const marker of PARA_BREAKS) v = v.split(` ${marker}`).join(`\n\n${marker}`)
  for (const marker of INCLUDES) {
    const at = v.indexOf(marker)
    if (at < 0) continue
    const head = v.slice(0, at).replace(/\s+$/, "")
    // one item per line — each ends with the "US" unit marker
    const tail = v
      .slice(at + marker.length)
      .trim()
      .split(" US ")
      .join(" US\n")
      .split(" . ")
      .join(" ")
    v = `${head}\n\n${marker}\n${tail}`
  }
  return v
}

export default async function fixGiftSetCopy({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "description", "metadata"],
  })

  let changed = 0
  for (const p of products) {
    if (!/gift-set$/.test(String(p.handle))) continue

    const metadata = (p.metadata ?? {}) as Record<string, unknown>
    const update: Record<string, unknown> = {}

    if (typeof p.description === "string") {
      const next = reflow(p.description)
      if (next !== p.description) update.description = next
    }
    if (typeof metadata.description_en === "string") {
      const next = reflow(metadata.description_en)
      if (next !== metadata.description_en) {
        update.metadata = { ...metadata, description_en: next }
      }
    }
    if (!Object.keys(update).length) continue

    await productService.updateProducts(p.id, update)
    changed++
    logger.info(`Reflowed ${p.handle}`)
  }

  logger.info(`✓ Gift-set descriptions reflowed — products updated: ${changed}`)
}
