import type { ShopCategory } from './shop-content'

/**
 * Default SEO for the four shop category pages (`/proionta/<slug>/`).
 *
 * These are FALLBACKS. The live values are read from the Medusa category's
 * `metadata` (`meta_title`, `meta_description`, `meta_title_en`,
 * `meta_description_en`) so they can be edited in the Medusa admin without a
 * deploy — see `getCategorySeo()` in `src/lib/medusa/category-seo.ts`. The
 * seed script `seed-category-seo.ts` writes exactly these strings into the
 * admin so an editor has something concrete to work from.
 *
 * Descriptions are kept in the 140–155 character window Google renders, lead
 * with the category keyword, and name a concrete differentiator (own hives in
 * Melini, ISO certification, delivery). They deliberately carry no health
 * claims — see the compliance pass on Reg. (EC) 1924/2006.
 */
export type CategorySeo = { title: string; description: string }

export const CATEGORY_SEO_EL: Record<ShopCategory, CategorySeo> = {
  Μέλι: {
    title: 'Κυπριακό Μέλι — Θυμαρίσιο & Ανθέων',
    description:
      'Αγνό κυπριακό θυμαρίσιο μέλι και μέλι ανθέων από τα δικά μας μελίσσια στη Μελίνη. Πιστοποίηση ISO, χωρίς πρόσθετα. Αποστολή σε Κύπρο και Ελλάδα.',
  },
  'Προϊόντα Μέλισσας': {
    title: 'Προϊόντα Μέλισσας — Γύρη, Βασιλικός Πολτός',
    description:
      'Φρέσκια γύρη, βασιλικός πολτός, βάμμα πρόπολης, κηρήθρα και αλοιφές μελιού από τα δικά μας μελίσσια στη Μελίνη. Αποστολή σε Κύπρο και Ελλάδα.',
  },
  Καλλυντικά: {
    title: 'Φυσικά Καλλυντικά με Μέλι & Κερί Μέλισσας',
    description:
      'Φυσικές κηραλοιφές και κρέμες προσώπου και σώματος με βιολογικό μέλι, πρόπολη και βασιλικό πολτό από τα μελίσσια μας στη Μελίνη. Αποστολή σε Κύπρο.',
  },
  'Πακέτα Δώρων': {
    title: 'Πακέτα Δώρων με Μέλι & Καλλυντικά',
    description:
      'Έτοιμα σετ δώρου με κυπριακό μέλι και φυσικά καλλυντικά, συσκευασμένα στο μελισσοκομείο μας στη Μελίνη. Ιδανικά για εταιρικά και εορταστικά δώρα.',
  },
}

export const CATEGORY_SEO_EN: Record<ShopCategory, CategorySeo> = {
  Μέλι: {
    title: 'Cypriot Honey — Thyme & Blossom',
    description:
      'Raw Cypriot thyme and blossom honey from our own hives in Melini. ISO-certified, no additives, never blended. Delivered across Cyprus and Greece.',
  },
  'Προϊόντα Μέλισσας': {
    title: 'Bee Products — Pollen, Royal Jelly, Propolis',
    description:
      'Fresh pollen, royal jelly, propolis tincture, honeycomb and honey spreads from our own hives in Melini, Cyprus. Delivered across Cyprus and Greece.',
  },
  Καλλυντικά: {
    title: 'Natural Cosmetics with Honey & Beeswax',
    description:
      'Natural beeswax salves and face and body creams made with organic honey, propolis and royal jelly from our own hives in Melini. Delivered in Cyprus.',
  },
  'Πακέτα Δώρων': {
    title: 'Honey & Cosmetics Gift Sets',
    description:
      'Ready-to-give gift sets of Cypriot honey and natural cosmetics, boxed at our apiary in Melini. Ideal for corporate and festive gifting in Cyprus.',
  },
}

/** Fallback SEO for a category, before the Medusa admin overrides are applied. */
export function defaultCategorySeo(category: ShopCategory, locale: string): CategorySeo {
  return locale === 'en' ? CATEGORY_SEO_EN[category] : CATEGORY_SEO_EL[category]
}
