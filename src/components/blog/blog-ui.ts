/**
 * Component-only UI strings for the blog (index + article pages). Greek is the
 * source of truth; English mirrors it. Read the active locale with next-intl's
 * `getLocale()` (server) / `useLocale()` (client) and pass it to `getBlogUi`.
 *
 * Post/category copy lives in `blog-data.ts` / `blog-categories.ts` — this file
 * only holds chrome (labels, share prompts, empty states, aria-labels, the blog
 * hero + metadata strings). Do NOT edit messages/*.json for these.
 */

export type BlogUi = {
  /** "All" filter chip on the index grid. */
  allChip: string
  /** Card CTA (an arrow is appended in JSX). */
  readMore: string
  /** Shown when a category filter yields no posts. */
  empty: string
  /** Share row label + per-network aria-label. */
  share: string
  shareOn: (network: string) => string
  /** Sidebar blocks on the article page. */
  relatedTitle: string
  contactTitle: string
  contactBody: string
  contactCta: string
  /** Shop CTA shown inside and at the end of an article. */
  shopCtaTitle: string
  shopCtaBody: string
  shopCtaLabel: string
  contactImageAlt: string
  /** Breadcrumb back to the blog index. */
  breadcrumbBlog: string
  /** Fallback <title> for an unknown article. */
  articleFallback: string
  /** Blog index hero + metadata. */
  heroTitle: string
  heroImageAlt: string
  metaTitle: string
  metaDescription: string
}

const EL: BlogUi = {
  allChip: 'Όλα',
  readMore: 'Διαβάστε περισσότερα',
  empty: 'Δεν βρέθηκαν άρθρα σε αυτή την κατηγορία.',
  share: 'Κοινοποίηση',
  shareOn: (network) => `Κοινοποίηση στο ${network}`,
  relatedTitle: 'Σχετικά Άρθρα',
  contactTitle: 'Επικοινωνήστε μαζί μας',
  contactBody:
    'Έχετε απορίες για τα προϊόντα ή τις δραστηριότητές μας; Η ομάδα μας είναι εδώ για εσάς.',
  contactCta: 'Επικοινωνία',
  shopCtaTitle: 'Αγοράστε αγνό κυπριακό μέλι',
  shopCtaBody:
    'Μέλι, υδρόμελο, βασιλικός πολτός και φυσικά καλλυντικά, απευθείας από το μελισσοκομείο μας στον Μαχαιρά.',
  shopCtaLabel: 'Δείτε τα προϊόντα μας',
  contactImageAlt: 'Μέλισσα πάνω σε κίτρινο λουλούδι',
  breadcrumbBlog: 'Blog',
  articleFallback: 'Άρθρο',
  heroTitle: 'Blog',
  heroImageAlt: 'Μελισσοκόμος κρατά πλαίσιο με μέλισσες σε χωράφι',
  metaTitle: 'Blog',
  metaDescription:
    'Νέα, άρθρα και συνταγές από το Όρος Μαχαιρά — για το μέλι, τις μέλισσες, τη διατροφή και τη μελισσοκομία.',
}

const EN: BlogUi = {
  allChip: 'All',
  readMore: 'Read more',
  empty: 'No articles found in this category.',
  share: 'Share',
  shareOn: (network) => `Share on ${network}`,
  relatedTitle: 'Related Articles',
  contactTitle: 'Contact Us',
  contactBody:
    'Have questions about our products or activities? Our team is here for you.',
  contactCta: 'Contact',
  shopCtaTitle: 'Buy pure Cypriot honey',
  shopCtaBody:
    'Honey, mead, royal jelly and natural cosmetics, straight from our apiary at Machaira.',
  shopCtaLabel: 'Shop our products',
  contactImageAlt: 'A bee on a yellow flower',
  breadcrumbBlog: 'Blog',
  articleFallback: 'Article',
  heroTitle: 'Blog',
  heroImageAlt: 'A beekeeper holding a frame of bees in a field',
  metaTitle: 'Blog',
  metaDescription:
    'News, articles and recipes from Oros Machaira — about honey, bees, food and beekeeping.',
}

/** Locale-aware blog UI bundle. el = Greek source of truth, en = English. */
export function getBlogUi(locale: string): BlogUi {
  return locale === 'en' ? EN : EL
}

/**
 * Localized long date. For Greek we keep the post's pre-rendered `fallback`
 * (`dateText`, already in the right genitive form); for English we format the
 * locale-invariant ISO `date` as e.g. "18 January 2026". UTC-based so the day
 * never shifts across time zones.
 */
export function formatBlogDate(
  dateISO: string,
  locale: string,
  fallback?: string,
): string {
  if (locale !== 'en') {
    if (fallback) return fallback
    const [ey, em, ed] = dateISO.split('-').map(Number)
    return new Intl.DateTimeFormat('el-GR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(Date.UTC(ey, (em || 1) - 1, ed || 1))
  }
  const [y, m, d] = dateISO.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(Date.UTC(y, (m || 1) - 1, d || 1))
}
