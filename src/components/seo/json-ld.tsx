import { metaDescription, siteUrl } from '@/lib/seo'
import { localeHref } from '@/i18n/navigation'
import type { BlogPost } from '@/components/blog/blog-data'
import type { ShopProduct, ShopProductDetail } from '@/components/shop/shop-content'

/**
 * Structured data (schema.org JSON-LD) builders. Every URL is absolute on the
 * public origin, in the page's language, with the site's trailing slash — the
 * same URL the canonical tag carries.
 */

type Json = Record<string, unknown>

/** One <script type="application/ld+json">; `<` is escaped so content can never
 *  close the tag early. */
export function JsonLd({ data }: { data: Json | Json[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

export const ORGANIZATION_ID = () => `${siteUrl()}/#organization`

/** Locale-prefixed absolute URL for a Greek path ('/proionta/' → …/en/proionta/). */
export function pageUrl(locale: string, path: string): string {
  const withSlash = path.endsWith('/') ? path : `${path}/`
  return `${siteUrl()}${localeHref(locale, withSlash)}`
}

/** Root-relative or absolute image → absolute. */
export function absoluteImage(src: string): string {
  return /^https?:\/\//.test(src) ? src : `${siteUrl()}${src.startsWith('/') ? src : `/${src}`}`
}

/** Items are [name, Greek path]; the last (the page itself) may omit its path. */
export function breadcrumbJsonLd(locale: string, items: [string, string?][]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      ...(path ? { item: pageUrl(locale, path) } : {}),
    })),
  }
}

const brand = (locale: string) => (locale === 'en' ? 'Oros Machaira' : 'Όρος Μαχαιρά')

/** Product with its price(s) and availability — what search results show as a
 *  product snippet. Prices are the storefront's cents, stated in euros. */
export function productJsonLd({
  locale,
  url,
  title,
  product,
  detail,
}: {
  locale: string
  url: string
  title: string
  product: ShopProduct
  detail: ShopProductDetail
}): Json {
  const images = [...new Set([...(detail.gallery ?? []), product.image].filter(Boolean))].map(absoluteImage)
  const [low, high] = product.priceRange ?? [product.sortPrice, product.sortPrice]
  const euro = (cents: number) => (cents / 100).toFixed(2)
  const availability = `https://schema.org/${product.inStock ? 'InStock' : 'OutOfStock'}`
  const description = metaDescription(
    detail.description || (detail.sections ?? []).map((s) => s.body).join(' '),
    5000,
  )
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: title,
    url,
    image: images,
    ...(description ? { description } : {}),
    brand: { '@type': 'Brand', name: brand(locale) },
    category: product.category,
    offers:
      low === high
        ? {
            '@type': 'Offer',
            url,
            price: euro(low),
            priceCurrency: 'EUR',
            availability,
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@id': ORGANIZATION_ID() },
          }
        : {
            '@type': 'AggregateOffer',
            url,
            lowPrice: euro(low),
            highPrice: euro(high),
            priceCurrency: 'EUR',
            availability,
            seller: { '@id': ORGANIZATION_ID() },
          },
  }
}

/** An article, published by the farm. */
export function articleJsonLd(locale: string, post: BlogPost): Json {
  const url = pageUrl(locale, `/${post.slug}/`)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: metaDescription(post.excerpt || post.content),
    ...(post.image ? { image: [absoluteImage(post.image)] } : {}),
    ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
    inLanguage: locale === 'en' ? 'en' : 'el',
    author: { '@id': ORGANIZATION_ID() },
    publisher: { '@id': ORGANIZATION_ID() },
  }
}
