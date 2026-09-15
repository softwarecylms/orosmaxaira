import { getLocale } from 'next-intl/server'
import { getBlogPosts } from '@/components/blog/blog-data'
import { loadHomeContent } from '@/lib/content/load'
import { BlogTeaserView } from './blog-teaser-view'

/** Loads the teaser's copy and the three most recent articles, then renders BlogTeaserView. */
export async function BlogTeaser() {
  const locale = await getLocale()
  const { BLOG } = await loadHomeContent(locale)
  const posts = [...getBlogPosts(locale)]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map(({ slug, title, image, excerpt }) => ({ slug, title, image, excerpt }))
  return <BlogTeaserView content={BLOG} posts={posts} />
}
