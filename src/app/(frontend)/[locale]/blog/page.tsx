import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { getBlogPosts, getBlogTaxonomy } from '@/lib/blog'
import { getBlogUi } from '@/components/blog/blog-ui'
import { PageHero } from '@/components/shared/page-hero'
import { BlogFilterGrid } from '@/components/blog/blog-filter-grid'
import { seoMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const ui = getBlogUi(locale)
  return seoMetadata({
    locale,
    path: '/blog',
    title: ui.metaTitle,
    description: ui.metaDescription,
  })
}

export default async function BlogPage() {
  const locale = await getLocale()
  const ui = getBlogUi(locale)
  const [posts, { categories, postCategories }] = await Promise.all([getBlogPosts(locale), getBlogTaxonomy(locale)])

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
          posts={posts}
          categories={categories}
          postCategories={postCategories}
        />
      </section>
    </>
  )
}
