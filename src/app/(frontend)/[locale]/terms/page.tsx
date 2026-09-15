import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/legal-page'
import { loadLegalContent } from '@/lib/content/load'
import { ManagedPage, managedMetadata } from '@/lib/cms/pages'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const m = (await loadLegalContent('terms', locale)).seo
  return managedMetadata('terms', {
    locale,
    path: '/terms',
    title: m.title,
    description: m.description,
  })
}

async function TermsPageStatic({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const c = await loadLegalContent('terms', locale)
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

/** The page as edited in Payload's visual editor; its built-in copy until then. */
export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <ManagedPage slug="terms" locale={locale} fallback={<TermsPageStatic params={params} />} />
}
