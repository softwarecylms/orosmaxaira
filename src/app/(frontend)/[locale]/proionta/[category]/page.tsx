import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductsPage } from '@/components/shop/products-page'
import { CATEGORY_BY_SLUG, CATEGORY_SLUGS } from '@/components/shop/shop-content'

type Params = { params: Promise<{ category: string }> }

/** Pre-render the four category permalinks (/proionta/meli/ etc.). */
export function generateStaticParams() {
  return Object.values(CATEGORY_SLUGS).map((category) => ({ category }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: slug } = await params
  const category = CATEGORY_BY_SLUG[slug]
  if (!category) return { title: 'Προϊόντα' }
  return {
    title: category,
    description: `${category} — Όρος Μαχαιρά.`,
  }
}

/** Category-filtered products (live permalink /proionta/<slug>/). */
export default async function ProiontaCategoryPage({ params }: Params) {
  const { category: slug } = await params
  const category = CATEGORY_BY_SLUG[slug]
  if (!category) notFound()
  return <ProductsPage category={category} />
}
