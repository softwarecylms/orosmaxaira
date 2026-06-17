import { siteUrl } from '@/lib/seo'

export type BreadcrumbItem = {
  name: string
  href: string
}

type Props = {
  items: BreadcrumbItem[]
}

export function BreadcrumbSchema({ items }: Props) {
  if (!items.length) return null

  const base = siteUrl()

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href.startsWith('http') ? item.href : `${base}${item.href}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
