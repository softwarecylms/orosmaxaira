import { sdk } from './client'
import {
  CATEGORY_SLUGS,
  type ShopCategory,
} from '@/components/shop/shop-content'
import {
  defaultCategorySeo,
  type CategorySeo,
} from '@/components/shop/category-seo'

/**
 * SEO title + meta description for a shop category page, editable in the
 * Medusa admin.
 *
 * The Medusa `product_category` model has no SEO fields and no per-locale
 * fields, so — exactly as `name_en` already does for the category label — the
 * values live in the category's **Metadata** panel:
 *
 *   meta_title            Greek <title>
 *   meta_description      Greek meta description
 *   meta_title_en         English <title>
 *   meta_description_en   English meta description
 *
 * An empty or missing key falls back to `defaultCategorySeo()`, so a category
 * always has a real description even if nobody has touched the admin. Editors
 * can therefore override one locale without having to fill in the other.
 */

type CategoryMetadata = Record<string, unknown> | null | undefined

/** Read a metadata key, treating blank strings as "not set". */
function value(meta: CategoryMetadata, key: string): string | undefined {
  const v = (meta as Record<string, unknown> | null | undefined)?.[key]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

/** Fetch a category's metadata by handle. Returns undefined if Medusa is
 *  unreachable or the category does not exist — the caller then uses the
 *  static defaults rather than rendering a page with no description. */
async function categoryMetadata(handle: string): Promise<CategoryMetadata> {
  try {
    const { product_categories: categories } = await sdk.store.category.list({
      handle,
      fields: 'id,handle,metadata',
      limit: 1,
    })
    return categories?.[0]?.metadata as CategoryMetadata
  } catch {
    return undefined
  }
}

export async function getCategorySeo(
  category: ShopCategory,
  locale: string,
): Promise<CategorySeo> {
  const fallback = defaultCategorySeo(category, locale)
  const meta = await categoryMetadata(CATEGORY_SLUGS[category])
  if (!meta) return fallback

  const suffix = locale === 'en' ? '_en' : ''
  return {
    title: value(meta, `meta_title${suffix}`) ?? fallback.title,
    description: value(meta, `meta_description${suffix}`) ?? fallback.description,
  }
}
