import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Seeds the SEO fields for the four shop categories into the Medusa admin so an
 * editor can change the storefront's <title> and meta description without a
 * deploy.
 *
 * `product_category` has no SEO and no per-locale fields, so — exactly as
 * `name_en` already does for the category label — the values live in the
 * category's **Metadata** panel (Products → Categories → <category> →
 * Metadata):
 *
 *   meta_title            Greek <title>
 *   meta_description      Greek meta description
 *   meta_title_en         English <title>
 *   meta_description_en   English meta description
 *
 * The storefront reads them in `src/lib/medusa/category-seo.ts` and falls back
 * to `src/components/shop/category-seo.ts` when a key is missing or blank, so
 * clearing a field in the admin restores the built-in default rather than
 * leaving the page with no description.
 *
 * Only writes keys that are absent, so an edit made in the admin is never
 * overwritten. Pass the bare word `force` to reset them to the defaults below
 * (`medusa exec` takes positional args — a leading `--` is eaten by its own
 * option parser).
 *   npx medusa exec ./src/scripts/seed-category-seo.ts
 *   npx medusa exec ./src/scripts/seed-category-seo.ts force
 */

type Seo = {
  meta_title: string
  meta_description: string
  meta_title_en: string
  meta_description_en: string
}

/** Keyed by category handle. Titles carry no brand suffix — the storefront's
 *  `titleTemplate` appends "| Όρος Μαχαιρά" / "| Oros Machaira" already. */
const SEO: Record<string, Seo> = {
  meli: {
    meta_title: "Κυπριακό Μέλι — Θυμαρίσιο & Ανθέων",
    meta_description:
      "Αγνό κυπριακό θυμαρίσιο μέλι και μέλι ανθέων από τα δικά μας μελίσσια στη Μελίνη. Πιστοποίηση ISO, χωρίς πρόσθετα. Αποστολή σε Κύπρο και Ελλάδα.",
    meta_title_en: "Cypriot Honey — Thyme & Blossom",
    meta_description_en:
      "Raw Cypriot thyme and blossom honey from our own hives in Melini. ISO-certified, no additives, never blended. Delivered across Cyprus and Greece.",
  },
  "proionta-melissas": {
    meta_title: "Προϊόντα Μέλισσας — Γύρη, Βασιλικός Πολτός",
    meta_description:
      "Φρέσκια γύρη, βασιλικός πολτός, βάμμα πρόπολης, κηρήθρα και αλοιφές μελιού από τα δικά μας μελίσσια στη Μελίνη. Αποστολή σε Κύπρο και Ελλάδα.",
    meta_title_en: "Bee Products — Pollen, Royal Jelly, Propolis",
    meta_description_en:
      "Fresh pollen, royal jelly, propolis tincture, honeycomb and honey spreads from our own hives in Melini, Cyprus. Delivered across Cyprus and Greece.",
  },
  kallyntika: {
    meta_title: "Φυσικά Καλλυντικά με Μέλι & Κερί Μέλισσας",
    meta_description:
      "Φυσικές κηραλοιφές και κρέμες προσώπου και σώματος με βιολογικό μέλι, πρόπολη και βασιλικό πολτό από τα μελίσσια μας στη Μελίνη. Αποστολή σε Κύπρο.",
    meta_title_en: "Natural Cosmetics with Honey & Beeswax",
    meta_description_en:
      "Natural beeswax salves and face and body creams made with organic honey, propolis and royal jelly from our own hives in Melini. Delivered in Cyprus.",
  },
  "paketa-doron": {
    meta_title: "Πακέτα Δώρων με Μέλι & Καλλυντικά",
    meta_description:
      "Έτοιμα σετ δώρου με κυπριακό μέλι και φυσικά καλλυντικά, συσκευασμένα στο μελισσοκομείο μας στη Μελίνη. Ιδανικά για εταιρικά και εορταστικά δώρα.",
    meta_title_en: "Honey & Cosmetics Gift Sets",
    meta_description_en:
      "Ready-to-give gift sets of Cypriot honey and natural cosmetics, boxed at our apiary in Melini. Ideal for corporate and festive gifting in Cyprus.",
  },
}

export default async function seedCategorySeo({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)
  const force = (args ?? []).includes("force")

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "metadata"],
  })

  let changed = 0
  for (const category of categories) {
    const seo = SEO[category.handle as string]
    if (!seo) continue

    const metadata = (category.metadata ?? {}) as Record<string, unknown>
    const next = { ...metadata }
    let touched = false

    for (const [key, value] of Object.entries(seo)) {
      const current = next[key]
      const isSet = typeof current === "string" && current.trim().length > 0
      if (isSet && !force) continue
      next[key] = value
      touched = true
    }
    if (!touched) {
      logger.info(`  ${category.handle}: already has SEO — left as edited`)
      continue
    }

    await productService.updateProductCategories(category.id, { metadata: next })
    changed++
    logger.info(`  ${category.handle}: SEO ${force ? "reset" : "seeded"}`)
  }

  logger.info(
    `✓ Category SEO — categories updated: ${changed}. Edit under Products → Categories → <category> → Metadata.`,
  )
}
