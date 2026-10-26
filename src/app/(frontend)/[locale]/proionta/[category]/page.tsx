import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { ProductsPage } from '@/components/shop/products-page'
import {
  CATEGORY_BY_SLUG,
  SHOP_CATEGORIES,
  categoryPath,
  inCategory,
  type ShopCategory,
} from '@/components/shop/shop-content'
import { getShopUi } from '@/components/shop/shop-ui'
import { getCategorySeo } from '@/lib/medusa/category-seo'
import { listShopProducts } from '@/lib/medusa/shop'
import { hreflangAlternates, seoMetadata } from '@/lib/seo'

type Params = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ brand?: string | string[] }>
}

/** A category whose page is /proionta/<slug>/ — not a partner sub-category (/proionta/<section>/<slug>/). */
const topLevel = (slug: string): ShopCategory | undefined => {
  const category = CATEGORY_BY_SLUG[slug]
  return category && categoryPath(category) === slug ? category : undefined
}

/** Pre-render the category permalinks (/proionta/meli/ etc.). */
export function generateStaticParams() {
  return SHOP_CATEGORIES.map(categoryPath)
    .filter((path) => !path.includes('/'))
    .map((category) => ({ category }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: slug } = await params
  const locale = await getLocale()
  const { meta } = getShopUi(locale)
  const category = topLevel(slug)
  const alternates = hreflangAlternates(locale, `/proionta/${slug}`)
  if (!category) return { title: meta.titleFallback, alternates }
  // Title + description come from the category's Metadata in the Medusa admin,
  // falling back to `CATEGORY_SEO_*` — see `src/lib/medusa/category-seo.ts`.
  const { title, description } = await getCategorySeo(category, locale)
  return seoMetadata({ locale, path: `/proionta/${slug}`, title, description })
}

/** Category-filtered products (live permalink /proionta/<slug>/). The partner
 *  section also takes `?brand=<collection handle>` (the menu's brand links). */
export default async function ProiontaCategoryPage({ params, searchParams }: Params) {
  const { category: slug } = await params
  const category = topLevel(slug)
  if (!category) notFound()
  // A category with nothing listed yet (its products still hidden) has no page.
  const catalogue = await listShopProducts().catch(() => null)
  if (catalogue && !catalogue.products.some((p) => inCategory(p, category))) notFound()
  const { brand } = await searchParams
  return <ProductsPage category={category} brand={typeof brand === 'string' ? brand : undefined} />
}
