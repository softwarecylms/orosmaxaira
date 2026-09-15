import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Search-result copy for the products whose own title or description does not
 * work there, plus one English translation that was wrong. Idempotent, and it
 * never overwrites a value someone has already set in the admin.
 *
 *   npx medusa exec ./src/scripts/fix-product-seo.ts
 *
 * - The Easter candle kit's name is 83 characters; Google shows about 60.
 * - Both hand creams share a Greek description, and the raw-honey product's
 *   description is also the opening of two articles — duplicate snippets.
 * - The Valentine's gift box read "Mead" in English, with the plain mead
 *   description, identical to the mead product itself.
 *
 * Metadata keys (editable in the admin → product → Metadata):
 *   meta_title, meta_title_en, meta_description, meta_description_en
 */

/** Set only when the key is empty. */
const SEO: Record<string, Record<string, string>> = {
  "kit-cheiropoiitis-paschalinis-melissolampadas-quot-oros-machaira-quot-special-easter-release-2": {
    meta_title: "Κιτ Πασχαλινής Μελισσολαμπάδας – Special Easter Release",
    meta_title_en: "Handmade Easter Bee-Candle Kit – Special Easter Release",
  },
  "krema-cherion-milk-amp-honey": {
    meta_description:
      "Ενυδατική κρέμα χεριών Milk & Honey με φυσικά συστατικά από την Κύπρο, για απαλά και λεία χέρια. Ιδανική για την τσάντα σας. 50 ml.",
  },
  "krema-cherion-red-grape": {
    meta_description:
      "Κρέμα χεριών Red Grape με βιολογικά συστατικά από την Κύπρο, όπως μέλι, πρόπολη και βούτυρο καριτέ, για ενυδατωμένα χέρια. 50 ml.",
  },
  "avrasto-meli-antheon-oros-machaira": {
    meta_description:
      "Άβραστο (άθερμο) μέλι ανθέων «Όρος Μαχαιρά»: ακατέργαστο, απευθείας από την κηρήθρα, χωρίς θερμική επεξεργασία και φιλτράρισμα.",
    meta_description_en:
      "Oros Machaira raw blossom honey: unheated and unfiltered, straight from the honeycomb, just as the bees make it.",
  },
}

const GIFT_BOX = "ydromelo-valentine-gift-box"
const GIFT_BOX_TITLE_EN = "Mead – Valentine’s Gift Box"
const GIFT_BOX_DESCRIPTION_EN = [
  "Perhaps love doesn’t need much after all. Just the right moment and the right company.",
  "Two people. Mead is one of the oldest drinks in the world.",
  "Since ancient times it has been linked with love and marriage. That bond gave rise to the tradition of the “honeymoon”, when newlyweds drank mead during the first month of their marriage as a symbol of happiness, good fortune and a shared journey.",
  "With this story as our starting point, we created the Valentine’s Gift Box: a package that draws its meaning from a tradition deeply connected with love and union. For Valentine’s Day, our mead comes in a gift box, paired with chocolates.",
  "A sweet reason to give a moment that truly matters. To open the evening and celebrate love, romance and the journey shared within a relationship or a marriage.",
].join("\n\n")

export default async function fixProductSeo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const products = container.resolve(Modules.PRODUCT)

  const handles = [...Object.keys(SEO), GIFT_BOX, "ydromelo"]
  const rows = await products.listProducts({ handle: handles }, { select: ["id", "handle", "metadata"] })
  const byHandle = new Map(rows.map((p) => [p.handle, p]))
  const blank = (v: unknown) => typeof v !== "string" || !v.trim()

  for (const handle of [...Object.keys(SEO), GIFT_BOX]) {
    const product = byHandle.get(handle)
    if (!product) {
      logger.warn(`${handle}: not found — skipped`)
      continue
    }
    const meta = { ...(product.metadata ?? {}) } as Record<string, unknown>
    const changed: string[] = []

    for (const [key, value] of Object.entries(SEO[handle] ?? {})) {
      if (blank(meta[key])) {
        meta[key] = value
        changed.push(key)
      }
    }

    if (handle === GIFT_BOX) {
      // Only replace what is demonstrably the copy-paste: a bare "Mead", or the
      // plain mead product's own English description.
      const meadDescription = byHandle.get("ydromelo")?.metadata?.description_en
      if (blank(meta.title_en) || String(meta.title_en).trim() === "Mead") {
        meta.title_en = GIFT_BOX_TITLE_EN
        changed.push("title_en")
      }
      if (blank(meta.description_en) || meta.description_en === meadDescription) {
        meta.description_en = GIFT_BOX_DESCRIPTION_EN
        changed.push("description_en")
      }
    }

    if (!changed.length) {
      logger.info(`${handle}: already set — nothing to do`)
      continue
    }
    await products.updateProducts(product.id, { metadata: meta })
    logger.info(`✓ ${handle}: ${changed.join(", ")}`)
  }
}
