import type { Metadata } from 'next'
import { getAllCategories, getAllPosts } from '@/lib/cms'
import { BlogIndexRender } from '@/blocks/blog-index'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles and updates.',
  alternates: { canonical: '/blog' },
}

export default async function BlogIndex() {
  const [posts, categories] = await Promise.all([getAllPosts(), getAllCategories()])
  return (
    <BlogIndexRender
      heading="Latest News From Our Blog"
      subheading="Latest articles and updates."
      posts={posts}
      categories={categories}
    />
  )
}
