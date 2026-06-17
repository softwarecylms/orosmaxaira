import type { SiteSetting } from '@/payload-types'
import { siteUrl } from '@/lib/seo'

export function OrganizationSchema({ settings }: { settings: SiteSetting | null | undefined }) {
  const url = siteUrl()
  const name = settings?.siteName ?? 'Your Brand'
  const contact = settings?.contact as
    | { email?: string; phone?: string; address?: string }
    | undefined

  const social = settings?.social as Record<string, string | undefined> | undefined
  const sameAs = [social?.facebook, social?.instagram, social?.linkedin, social?.youtube, social?.tiktok].filter(
    Boolean,
  )

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${url}#organization`,
        name,
        url,
        ...(contact?.email ? { email: contact.email } : {}),
        ...(contact?.phone ? { telephone: contact.phone } : {}),
        ...(sameAs.length ? { sameAs } : {}),
        ...(contact?.address
          ? {
              address: {
                '@type': 'PostalAddress',
                streetAddress: contact.address,
                addressCountry: 'CY',
              },
            }
          : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        url,
        name,
        publisher: { '@id': `${url}#organization` },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
