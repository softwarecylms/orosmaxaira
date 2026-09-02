import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * One-off formatting fix: turn the spec-style lines in product descriptions into
 * real list items.
 *
 *   - the headline claim plus its "N% organic ingredients" line become a
 *     two-item list at the top of the description;
 *   - the items under "Includes:" / «Περιλαμβάνει:» become list items.
 *
 * Also repairs a side effect of the earlier layout pass, which pushed the last
 * "Includes" item's volume ("4 ml e | 0.13 fl. oz. US") onto its own line.
 *
 * `- ` is the marker; the storefront's DescriptionBody renders such blocks as a
 * real <ul> rather than dashes inside a paragraph. Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-description-bullets.ts
 */

const INCLUDES = /^(Includes:|Περιλαμβάνει:)/
const PERCENT = /^\d+%\s*(βιολογικά συστατικά|organic ingredients)$/
const SIZE = /^\d+(?:[.,]\d+)?\s*(?:ml|g|gr|kg)\s+e\b/i

function bulletise(desc: string): string {
  let blocks = desc.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)

  const inc = blocks.findIndex((b) => INCLUDES.test(b))
  if (inc >= 0 && blocks.length - 1 > inc && SIZE.test(blocks[blocks.length - 1])) {
    const size = blocks.pop() as string
    const lines = blocks[inc].split("\n")
    lines[lines.length - 1] = `${lines[lines.length - 1]} ${size}`.replace(/\s{2,}/g, " ")
    blocks[inc] = lines.join("\n")
  }

  if (blocks.length >= 2 && PERCENT.test(blocks[1])) {
    blocks = [`- ${blocks[0]}\n- ${blocks[1]}`, ...blocks.slice(2)]
  }

  return blocks
    .map((b) => {
      if (!INCLUDES.test(b)) return b
      const [head, ...items] = b.split("\n")
      if (!items.length) return b
      return [head, ...items.map((i) => (i.startsWith("- ") ? i : `- ${i.trim()}`))].join("\n")
    })
    .join("\n\n")
}

export default async function fixDescriptionBullets({ container }: ExecArgs) {
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
      const next = bulletise(p.description)
      if (next !== p.description) update.description = next
    }
    if (typeof metadata.description_en === "string") {
      const next = bulletise(metadata.description_en)
      if (next !== metadata.description_en) {
        update.metadata = { ...metadata, description_en: next }
      }
    }
    if (!Object.keys(update).length) continue

    await productService.updateProducts(p.id, update)
    changed++
    logger.info(`Bulletised ${p.handle}`)
  }

  logger.info(`✓ Description lists applied — products updated: ${changed}`)
}
