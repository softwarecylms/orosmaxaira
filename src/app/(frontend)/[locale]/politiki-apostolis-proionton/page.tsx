import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/legal-page'
import { getLegalContent } from '@/components/legal/legal-content'
import { seoMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const m = getLegalContent('shipping', locale).seo
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
  const c = getLegalContent('shipping', locale)
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
