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
  const m = (await loadLegalContent('shipping', locale)).seo
  return seoMetadata({
    locale,
    path: '/politiki-apostolis-proionton',
    title: m.title,
    description: m.description,
  })
}

export default async function ShippingPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const c = await loadLegalContent('shipping', locale)
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
