import { siteUrl } from '@/lib/seo'
import type { Post, Author, Category } from '@/payload-types'
import { mediaSrc } from '@/lib/utils'

type Props = {
  post: Pick<Post, 'title' | 'slug' | 'excerpt' | 'publishedAt' | 'updatedAt' | 'cover'>
  author?: Author | null
  primaryCategory?: Category | null
}

export function BlogPostingSchema({ post, author, primaryCategory }: Props) {
  const base = siteUrl()
  const canonical = `${base}/${post.slug ?? ''}`
  const image =
    mediaSrc(post.cover) ??
    undefined

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt ?? post.publishedAt ?? undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    image: image ? [image.startsWith('http') ? image : `${base}${image}`] : undefined,
    author: author?.name
      ? { '@type': 'Person', name: author.name, url: `${base}/author/${author.slug}` }
      : { '@type': 'Organization', name: 'Your Brand' },
    publisher: {
      '@type': 'Organization',
      name: 'Your Brand',
      url: base,
    },
    ...(primaryCategory?.name
      ? { articleSection: primaryCategory.name }
      : {}),
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
