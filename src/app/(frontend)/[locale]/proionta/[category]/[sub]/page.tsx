import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { ProductsPage } from '@/components/shop/products-page'
import {
  CATEGORY_BY_SLUG,
  PARTNER_SUBCATEGORIES,
  categoryPath,
  type ShopCategory,
} from '@/components/shop/shop-content'
import { getShopUi } from '@/components/shop/shop-ui'
import { getCategorySeo } from '@/lib/medusa/category-seo'
import { listShopProducts } from '@/lib/medusa/shop'
import { hreflangAlternates, seoMetadata } from '@/lib/seo'

type Params = {
  params: Promise<{ category: string; sub: string }>
  searchParams: Promise<{ brand?: string | string[] }>
}

/** The partner sub-category at /proionta/<section>/<slug>/, if that is one. */
const subCategory = (section: string, slug: string): ShopCategory | undefined => {
  const category = CATEGORY_BY_SLUG[slug]
  return category && categoryPath(category) === `${section}/${slug}` ? category : undefined
}

export function generateStaticParams() {
  return PARTNER_SUBCATEGORIES.map((c) => {
    const [category, sub] = categoryPath(c).split('/')
    return { category, sub }
  })
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: section, sub } = await params
  const locale = await getLocale()
  const { meta } = getShopUi(locale)
  const category = subCategory(section, sub)
  const path = `/proionta/${section}/${sub}`
  if (!category) return { title: meta.titleFallback, alternates: hreflangAlternates(locale, path) }
  const { title, description } = await getCategorySeo(category, locale)
  return seoMetadata({ locale, path, title, description })
}

/** A partner brands' category (e.g. /proionta/synergazomenes-markes/sprei/). */
export default async function PartnerCategoryPage({ params, searchParams }: Params) {
  const { category: section, sub } = await params
  const category = subCategory(section, sub)
  if (!category) notFound()
  const catalogue = await listShopProducts().catch(() => null)
  if (catalogue && !catalogue.products.some((p) => p.category === category)) notFound()
  const { brand } = await searchParams
  return <ProductsPage category={category} brand={typeof brand === 'string' ? brand : undefined} />
}
