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
  const m = (await loadLegalContent('privacy', locale)).seo
  return seoMetadata({
    locale,
    path: '/privacy-amp-cookie-policy',
    title: m.title,
    description: m.description,
  })
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const c = await loadLegalContent('privacy', locale)
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
