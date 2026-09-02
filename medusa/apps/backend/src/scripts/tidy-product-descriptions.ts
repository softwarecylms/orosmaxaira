import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Tidies the product descriptions held in Medusa, in three passes.
 *
 *  1. Strips raw JSON-LD that was pasted into three English descriptions when
 *     the copy was imported from WooCommerce — it renders as a wall of
 *     `{ "@context": "https://schema.org/" … }` on the product page. The
 *     storefront emits its own Product schema, so none of it is needed.
 *  2. Removes the last two health claims the earlier passes missed, both in the
 *     English copy: the honey/pollen/royal-jelly blend ("super boost its health
 *     credentials", "enhancing immunity") and the eye cream ("erases dark
 *     circles"). Same basis as `fix-health-claims-db-en.ts`.
 *  3. Breaks single-paragraph descriptions into paragraphs of about two
 *     sentences, so the product page is not one dense block. Bullet lists, the
 *     "50 ml ℮ | 1.69 US fl oz" size lines and anything already split are left
 *     untouched.
 *
 * Idempotent — re-running produces the same text.
 *   npx medusa exec ./src/scripts/tidy-product-descriptions.ts
 */

const CLAIMS: [string, string][] = [
  [
    "This mixture is enhanced with all the treasures of the hive to super boost its health credentials. It includes honey, royal jelly and pollen. In combination, these complementary nutritive food substances have a legacy and history of providing mankind with a serious and comprehensive list of nutritional benefits; This is honey’s antioxidant properties mixed with royal jelly- the queen bee’s super food; and bee pollen- an excellent nutritional supplement for enhancing immunity and naturally boosting energy.",
    "This is a blend of the treasures of the hive: honey, royal jelly and pollen — three foods with a long tradition in the human diet. Royal jelly, the food of the queen, and our fresh pollen are combined with our pure honey in a blend with a rich taste and a velvety texture.",
  ],
  [
    "Specially formulated to care for the sensitive eye area, it effectively diminishes wrinkles, eases puffiness, and erases dark circles.",
    "Specially formulated to care for the sensitive eye area, it helps smooth the look of fine lines, eases puffiness and reduces the appearance of dark circles.",
  ],
]

/** Remove a pasted JSON-LD blob and anything after it. */
function stripJsonLd(text: string): string {
  const at = text.search(/\{\s*[“"]@context[”"]/)
  return at === -1 ? text : text.slice(0, at).replace(/\s+$/, "")
}

const SIZE_LINE = /^[\d.,]+\s*(ml|g|gr|kg|L)\b/i
const hasBullet = (b: string) => b.split("\n").some((l) => l.trim().startsWith("- "))

/** Split on . ! ; followed by a capital, ignoring abbreviations like "St.". */
function splitSentences(text: string): string[] {
  const out: string[] = []
  let start = 0
  const re = /([.!;])\s+(?=[A-ZΑ-ΩΆΈΉΊΌΎΏ"“«(])/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const head = text.slice(start, m.index + 1)
    const prevWord = head.trim().split(/\s+/).pop() ?? ""
    if (/^[A-ZΑ-Ω][a-zα-ω]{0,2}\.$/.test(prevWord)) continue
    out.push(head.trim())
    start = m.index + m[0].length
  }
  const tail = text.slice(start).trim()
  if (tail) out.push(tail)
  return out
}

function splitBlock(block: string): string {
  const b = block.trim()
  if (!b || hasBullet(b) || SIZE_LINE.test(b) || b.includes("\n")) return block
  const sentences = splitSentences(b)
  if (sentences.length < 3 || b.length < 240) return block

  const groups: string[][] = []
  for (let i = 0; i < sentences.length; i += 2) groups.push(sentences.slice(i, i + 2))
  if (groups.length > 1 && groups[groups.length - 1].length === 1) {
    groups[groups.length - 2].push(groups.pop()![0])
  }
  return groups.map((g) => g.join(" ")).join("\n\n")
}

function tidy(text: string): string {
  let out = stripJsonLd(text)
  out = CLAIMS.reduce((acc, [from, to]) => acc.split(from).join(to), out)
  return out.split(/\n{2,}/).map(splitBlock).join("\n\n")
}

export default async function tidyProductDescriptions({ container }: ExecArgs) {
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
      const next = tidy(p.description)
      if (next !== p.description) update.description = next
    }
    if (typeof metadata.description_en === "string") {
      const next = tidy(metadata.description_en)
      if (next !== metadata.description_en) {
        update.metadata = { ...metadata, description_en: next }
      }
    }
    if (!Object.keys(update).length) continue

    await productService.updateProducts(p.id, update)
    changed++
    logger.info(`  tidied ${p.handle}`)
  }

  logger.info(`✓ Descriptions tidied — products updated: ${changed}`)
}
