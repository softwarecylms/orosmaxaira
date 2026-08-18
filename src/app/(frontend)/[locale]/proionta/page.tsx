import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { ProductsPage } from '@/components/shop/products-page'
import { getShopUi } from '@/components/shop/shop-ui'
import { hreflangAlternates } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { meta } = getShopUi(locale)
  return {
    title: meta.listingTitle,
    description: meta.listingDescription,
    alternates: hreflangAlternates(locale, '/proionta'),
  }
}

/** Products listing (Figma 209:4095) — live permalink /proionta/. */
export default function ProiontaPage() {
  return <ProductsPage />
}
