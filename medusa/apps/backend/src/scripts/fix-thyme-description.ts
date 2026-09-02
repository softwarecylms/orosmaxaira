import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * One-off copy fix for the thyme honey description.
 *
 * It read as two stitched-together claims — "packed with flavour" next to a FAQ
 * answer saying it is "not as intensely sweet as other honey varieties" — and
 * ended on a price superlative that cannot be substantiated and is not a selling
 * point. Rewritten as one coherent sentence pair that distinguishes flavour from
 * sweetness, in both languages. Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-thyme-description.ts
 */

const REPLACEMENTS: [string, string][] = [
  [
    "Strongly aromatic, Oros Machaira thyme honey is packed with flavour. It is considered to be Cyprus’s best and most expensive honey.",
    "Oros Machaira thyme honey is strongly aromatic, with a deep, savoury character rather than a purely sweet one. Widely regarded as the finest honey Cyprus produces.",
  ],
  [
    "Το Θυμαρίσιο μέλι «Όρος Μαχαιρά» έχει δυνατό άρωμα και γεμάτη γεύση. Θεωρείται το καλύτερο και πιο ακριβό μέλι της Κύπρου.",
    "Το Θυμαρίσιο μέλι «Όρος Μαχαιρά» έχει δυνατό άρωμα και βαθιά, γεμάτη γεύση — περισσότερο χαρακτηριστική παρά έντονα γλυκιά. Θεωρείται από τα καλύτερα μέλια που παράγει η Κύπρος.",
  ],
]

function retarget(value: string): string {
  return REPLACEMENTS.reduce((out, [from, to]) => out.split(from).join(to), value)
}

export default async function fixThymeDescription({ container }: ExecArgs) {
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
      const next = retarget(p.description)
      if (next !== p.description) update.description = next
    }
    if (typeof metadata.description_en === "string") {
      const next = retarget(metadata.description_en)
      if (next !== metadata.description_en) {
        update.metadata = { ...metadata, description_en: next }
      }
    }
    if (!Object.keys(update).length) continue

    await productService.updateProducts(p.id, update)
    changed++
    logger.info(`Rewrote description for ${p.handle}`)
  }

  logger.info(`✓ Thyme honey description rewritten — products updated: ${changed}`)
}
