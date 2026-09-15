import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { PageHero } from '@/components/shared/page-hero'
import { CertificatesList } from '@/components/sections/certificates'
import { seoMetadata } from '@/lib/seo'
import { breadcrumbJsonLd } from '@/components/seo/json-ld'
import { loadCertificatesContent } from '@/lib/content/load'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { meta } = await loadCertificatesContent(locale)
  return seoMetadata({
    locale,
    path: '/pistopioiseis',
    title: meta.title,
    description: meta.description,
  })
}

/** Πιστοποιήσεις showcase — title banner + one full-width section per certificate
 *  (alternating 50/50 layout, live PDF preview, download links). Mirrors the
 *  Awards page structure. */
export default async function CertificatesPage() {
  const locale = await getLocale()
  const en = locale === 'en'
  const { hero, certificates, downloadLabel } = await loadCertificatesContent(locale)

  const jsonLd = breadcrumbJsonLd(locale, [
    [en ? 'Home' : 'Αρχική', '/'],
    [en ? 'Certifications' : 'Πιστοποιήσεις', '/pistopioiseis/'],
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div data-edit="hero">
        <PageHero
          image={hero.image}
          imageAlt={hero.imageAlt}
          title={hero.title}
          description={hero.description}
        />
      </div>

      <CertificatesList content={{ certificates, downloadLabel }} locale={locale} />
    </>
  )
}
