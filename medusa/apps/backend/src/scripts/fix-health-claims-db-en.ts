import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Second pass on the English product descriptions held in Medusa.
 *
 * `fix-health-claims.ts` was written against the wording in
 * `src/components/shop/product-details.generated.en.ts`. The copy stored in the
 * database (and in `oros-products.en.json`, which seeds it) is an *earlier,
 * differently worded* translation of the same products, so those replacements
 * did not match and five products kept their claims — visible on the English
 * product pages, which read `metadata.description_en`.
 *
 * Same legal basis as the first pass: Reg. (EC) 1924/2006 for unauthorised
 * health claims, Art. 7(3) of Reg. (EU) 1169/2011 for disease claims, and
 * Reg. (EC) 1223/2009 for cosmetics that must not read as medicines.
 *
 * Idempotent — plain string replacement, so re-running is a no-op.
 *   npx medusa exec ./src/scripts/fix-health-claims-db-en.ts
 */

const PAIRS: [string, string][] = [
  // Propolis tincture — antiseptic "miracle", immune system, flu, and a direct
  // comparison with medicines.
  [
    "Propolis tincture is an alcohol solution made of alcohol and propolis and is nothing short of a natural antiseptic miracle. Taking propolis tincture daily in small doses can help bolster the immune system in its fight against bacteria, fungi and viruses, including the flu. In contrast to medicines that affect both beneficial and harmful bacteria, propolis tincture only affects bacteria that are harmful to our health and in general is not impacted by various bacterial mutations.",
    "Propolis tincture is an alcohol solution made of alcohol and propolis. Propolis is the resinous substance bees use to seal and protect their hive, and people have used it since antiquity.",
  ],
  // Royal jelly — libido, longevity, "combating threats to health".
  [
    "Royal jelly has been used since antiquity because it provides energy, stimulates the libido and is a key factor in longevity. It is exceptionally effective in combating numerous external threats to human health and well-being.",
    "Royal jelly has been used by people since antiquity.",
  ],
  // Chest/muscle balm — a cosmetic reading as a decongestant and an analgesic.
  [
    "Ease into relief with our Beeswax Balm, your go-to companion for colds and muscle discomfort. Crafted for dual action, this therapeutic balm helps clear congestion for deeper breathing and doubles as a soothing remedy for muscle and joint pain. Apply with gentle rubs on the chest or sore areas to unleash the comforting power of nature and find respite from the aches of the day.",
    "A beeswax balm with a bright, invigorating aroma of essential oils. Massage it gently into the chest, neck or shoulders; the organic beeswax leaves a soft, protective layer on the skin.",
  ],
  // "Therapeutic" on two cosmetics, plus a burns claim.
  ["Pure therapeutic wax salve with organic beeswax", "Pure, soothing wax salve with organic beeswax"],
  ["Regenerative, therapeutic wax salve with pure organic beeswax", "Rich, nourishing wax salve with pure organic beeswax"],
  [
    "Ideal for cracked skin, hands, feet and elbows Brings relief for light burns and irritated skin",
    "Ideal for cracked skin, hands, feet and elbows",
  ],
]

function scrub(value: string): string {
  return PAIRS.reduce((out, [from, to]) => out.split(from).join(to), value)
}

export default async function fixHealthClaimsDbEn({ container }: ExecArgs) {
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
      const next = scrub(p.description)
      if (next !== p.description) update.description = next
    }
    if (typeof metadata.description_en === "string") {
      const next = scrub(metadata.description_en)
      if (next !== metadata.description_en) {
        update.metadata = { ...metadata, description_en: next }
      }
    }
    if (!Object.keys(update).length) continue

    await productService.updateProducts(p.id, update)
    changed++
    logger.info(`  health claims removed → ${p.handle}`)
  }

  logger.info(`✓ English DB descriptions cleaned — products updated: ${changed}`)
}
