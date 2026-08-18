import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { getBlogPosts } from '@/components/blog/blog-data'
import { getBlogCategories, POST_CATEGORIES } from '@/components/blog/blog-categories'
import { getBlogUi } from '@/components/blog/blog-ui'
import { PageHero } from '@/components/shared/page-hero'
import { BlogFilterGrid } from '@/components/blog/blog-filter-grid'
import { hreflangAlternates } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const ui = getBlogUi(locale)
  return {
    title: ui.metaTitle,
    description: ui.metaDescription,
    alternates: hreflangAlternates(locale, '/blog'),
  }
}

export default async function BlogPage() {
  const locale = await getLocale()
  const ui = getBlogUi(locale)

  return (
    <>
      <PageHero
        image="/images/blog/hero.webp"
        imageAlt={ui.heroImageAlt}
        title={ui.heroTitle}
        overlayClassName="bg-black/30"
      />

      <section className="container-wide py-12 md:py-[70px]">
        <BlogFilterGrid
          posts={getBlogPosts(locale)}
          categories={getBlogCategories(locale)}
          postCategories={POST_CATEGORIES}
        />
      </section>
    </>
  )
}
