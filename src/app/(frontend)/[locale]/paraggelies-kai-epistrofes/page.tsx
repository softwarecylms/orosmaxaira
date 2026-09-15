import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/legal-page'
import { seoMetadata } from '@/lib/seo'
import { loadLegalContent } from '@/lib/content/load'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const m = (await loadLegalContent('orders', locale)).seo
  return seoMetadata({
    locale,
    path: '/paraggelies-kai-epistrofes',
    title: m.title,
    description: m.description,
  })
}

export default async function OrdersReturnsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const c = await loadLegalContent('orders', locale)
  return (
    <LegalPage
      locale={locale}
      title={c.title}
      lastUpdated={c.lastUpdated}
      intro={c.intro}
      sections={c.sections}
    />
  )
}
