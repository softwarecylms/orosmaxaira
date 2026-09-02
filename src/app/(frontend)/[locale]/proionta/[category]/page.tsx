import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { ProductsPage } from '@/components/shop/products-page'
import { CATEGORY_BY_SLUG, CATEGORY_SLUGS } from '@/components/shop/shop-content'
import { getShopUi } from '@/components/shop/shop-ui'
import { getCategorySeo } from '@/lib/medusa/category-seo'
import { hreflangAlternates } from '@/lib/seo'

type Params = { params: Promise<{ category: string }> }

/** Pre-render the four category permalinks (/proionta/meli/ etc.). */
export function generateStaticParams() {
  return Object.values(CATEGORY_SLUGS).map((category) => ({ category }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: slug } = await params
  const locale = await getLocale()
  const { meta } = getShopUi(locale)
  const category = CATEGORY_BY_SLUG[slug]
  const alternates = hreflangAlternates(locale, `/proionta/${slug}`)
  if (!category) return { title: meta.titleFallback, alternates }
  // Title + description come from the category's Metadata in the Medusa admin,
  // falling back to `CATEGORY_SEO_*` — see `src/lib/medusa/category-seo.ts`.
  const { title, description } = await getCategorySeo(category, locale)
  return {
    title,
    description,
    alternates,
    openGraph: { title, description, type: 'website' },
  }
}

/** Category-filtered products (live permalink /proionta/<slug>/). */
export default async function ProiontaCategoryPage({ params }: Params) {
  const { category: slug } = await params
  const category = CATEGORY_BY_SLUG[slug]
  if (!category) notFound()
  return <ProductsPage category={category} />
}
