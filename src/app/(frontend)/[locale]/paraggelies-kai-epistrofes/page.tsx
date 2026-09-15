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
  const m = (await loadLegalContent('orders', locale)).seo
  return managedMetadata('paraggelies-kai-epistrofes', {
    locale,
    path: '/paraggelies-kai-epistrofes',
    title: m.title,
    description: m.description,
  })
}

async function OrdersReturnsPageStatic({
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

/** The page as edited in Payload's visual editor; its built-in copy until then. */
export default async function OrdersReturnsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <ManagedPage slug="paraggelies-kai-epistrofes" locale={locale} fallback={<OrdersReturnsPageStatic params={params} />} />
}
