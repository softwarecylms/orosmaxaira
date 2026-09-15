/**
 * Search-result overrides for articles. The page keeps its full headline; only
 * the <title> and share title change.
 */

/**
 * Titles Google would cut off (it shows about 60 characters), shortened without
 * changing what the article promises. Both languages, keyed by slug.
 */
export const ARTICLE_SEO_TITLES: Record<string, { el?: string; en?: string }> = {
  'anaviosi-tis-kypriakis-aytochthonis-melissas-kainotomos-synergasia-gia-tin-diatirisi-kai-taytopoiisi-tis-fylis': {
    el: 'Αναβίωση της Κυπριακής Αυτόχθονης Μέλισσας',
    en: 'Reviving the Native Cypriot Honey Bee',
  },
  'i-m-f-oros-maxaira-ltd-enischyei-ti-viosimotita-tis-me-exeidikeymeni-ypostirixi-kai-sygchrimatodotisi-tis-ee': {
    el: 'Η Όρος Μαχαιρά Ενισχύει τη Βιωσιμότητά της με Στήριξη της ΕΕ',
    en: 'Oros Machaira Advances Sustainability with EU Support',
  },
  'dipli-diakrisi-gia-to-oros-machaira-sta-cyprus-tourism-awards-2024': {
    el: 'Διπλή Διάκριση στα Cyprus Tourism Awards 2024',
    en: 'Double Distinction at the Cyprus Tourism Awards 2024',
  },
  'melissochoria-kipros': {
    el: 'Μελισσοχώρια της Ορεινής Λάρνακας: Μια Γλυκιά Απόδραση',
    en: 'Honey Villages of the Larnaca Highlands: A Sweet Getaway',
  },
  'yiothetiste-mia-kypseli': {
    el: 'Υιοθετήστε μια Κυψέλη: Ομαδική Δράση για τις Μέλισσες',
    en: 'Adopt a Beehive: A Team Activity for the Bees',
  },
  'fysika-proionta-ygieini-diatrofi-aloifes': {
    el: '4 Φυσικές Αλοιφές «Όρος Μαχαιρά» για Υγιεινή Διατροφή',
    en: '4 Oros Machaira Spreads for a Healthy Diet',
  },
  'gemistes-glykopatates-me-meli-gia-mia-glykia-dosi-agapis-sto-deipno-ton-eroteymenon': {
    el: 'Γεμιστές Γλυκοπατάτες με Μέλι για Δείπνο Αγάπης',
    en: 'Stuffed Sweet Potatoes with Honey for a Romantic Dinner',
  },
  'i-melissa-anakirychthike-to-pio-simantiko-emvio-on-ston-planiti': {
    en: 'The Bee Declared the Most Important Living Being on Earth',
  },
  'to-meli-oros-machaira-pistopoiimeno-me-to-sima-poiotitas-ton-organomenon-synolon-ton-melissokomon': {
    el: 'Το Μέλι «Όρος Μαχαιρά» με το Σήμα Ποιότητας Μελισσοκόμων',
    en: 'Oros Machaira Honey Earns the Beekeepers’ Quality Mark',
  },
  'kaysi-lipoys-kai-ayxisi-myikis-mazas-taytochrona-katanalonontas-meli-kai-gyri': {
    el: 'Καύση Λίπους και Μυϊκή Μάζα με Μέλι και Γύρη',
    en: 'Burn Fat and Build Muscle with Honey and Pollen',
  },
  'meli-to-thaymatoyrgo-4-ofeli-toy-stin-ygeia-kai-tin-omorfia-sas': {
    en: 'Honey the Miraculous: 4 Benefits for Health and Beauty',
  },
}

/**
 * Near-identical articles the old site published twice (81–98% the same
 * words). Both stay online, but the copy names the original — the older URL —
 * as its canonical, and only the original is in the sitemap, so search engines
 * rank one page instead of splitting it between two.
 */
export const ARTICLE_DUPLICATE_OF: Record<string, string> = {
  'chtapodi-sti-ladokolla-me-skordo-meli-kai-valsamiko-2': 'chtapodi-sti-ladokolla-me-skordo-meli-kai-valsamiko',
  'kotopoylo-me-meli-kai-lemoni-2': 'kotopoylo-me-meli-kai-lemoni',
  'garides-me-meli-kai-myrodika-2': 'garides-me-meli-kai-myrodika',
  '7-ofeli-toy-melioy-gia-tin-epidermida-2': '7-ofeli-toy-melioy-gia-tin-epidermida',
  'ti-einai-to-avrasto-meli': 'to-avrasto-meli',
}

/** The slug search engines should treat as this article's address. */
export const canonicalArticleSlug = (slug: string) => ARTICLE_DUPLICATE_OF[slug] ?? slug

export function articleSeoTitle(slug: string, locale: string, title: string): string {
  const o = ARTICLE_SEO_TITLES[slug]
  return (locale === 'en' ? o?.en : o?.el) ?? title
}
