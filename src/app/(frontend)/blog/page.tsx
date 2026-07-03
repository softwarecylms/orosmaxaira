import type { Metadata } from 'next'
import { BLOG_POSTS } from '@/components/blog/blog-data'
import { BLOG_CATEGORIES, POST_CATEGORIES } from '@/components/blog/blog-categories'
import { PageHero } from '@/components/shared/page-hero'
import { BlogFilterGrid } from '@/components/blog/blog-filter-grid'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Νέα, άρθρα και συνταγές από το Όρος Μαχαιρά — για το μέλι, τις μέλισσες, την υγεία και τη μελισσοκομία.',
  alternates: { canonical: '/blog' },
}

export default function BlogPage() {
  return (
    <>
      <PageHero
        image="/images/blog/hero.webp"
        imageAlt="Μελισσοκόμος κρατά πλαίσιο με μέλισσες σε χωράφι"
        title="Blog"
        overlayClassName="bg-black/30"
      />

      <section className="container-wide py-12 md:py-[70px]">
        <BlogFilterGrid
          posts={BLOG_POSTS}
          categories={BLOG_CATEGORIES}
          postCategories={POST_CATEGORIES}
        />
      </section>
    </>
  )
}
