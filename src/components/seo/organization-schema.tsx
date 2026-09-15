import { siteUrl } from '@/lib/seo'
import { getHomeContent } from '@/components/home/home-content'
import { JsonLd, ORGANIZATION_ID } from './json-ld'

/**
 * The farm as an Organization, and the site as its WebSite — on every page, in
 * the page's language. Every other schema (products, articles) points at this
 * Organization by `@id` rather than repeating it.
 *
 * Built from the same content the footer shows. It used to read Payload's site
 * settings, which have never been filled in, so it announced "Your Brand".
 */
export function OrganizationSchema({ locale }: { locale: string }) {
  const base = siteUrl()
  const en = locale === 'en'
  const { CONTACT, FOOTER } = getHomeContent(locale)
  const name = en ? 'Oros Machaira' : 'Όρος Μαχαιρά'

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': ORGANIZATION_ID(),
            name,
            alternateName: [en ? 'Όρος Μαχαιρά' : 'Oros Machaira', 'Oros Maxaira'],
            legalName: en ? 'M.F. Oros Maxaira Ltd' : 'Μ.Φ. Όρος Μαχαιρά Λτδ',
            url: `${base}/`,
            logo: { '@type': 'ImageObject', url: `${base}/images/og/logo.png`, width: 600, height: 214 },
            image: `${base}/images/og/oros-machaira.jpg`,
            email: CONTACT.email,
            telephone: CONTACT.phone,
            address: {
              '@type': 'PostalAddress',
              addressLocality: en ? 'Melini' : 'Μελίνη',
              postalCode: '7716',
              addressRegion: en ? 'Larnaca' : 'Λάρνακα',
              addressCountry: 'CY',
            },
            sameAs: (FOOTER.social as { href: string }[]).map((s) => s.href),
          },
          {
            '@type': 'WebSite',
            '@id': `${base}/#website`,
            url: `${base}/`,
            name,
            inLanguage: en ? 'en' : 'el',
            publisher: { '@id': ORGANIZATION_ID() },
          },
        ],
      }}
    />
  )
}
