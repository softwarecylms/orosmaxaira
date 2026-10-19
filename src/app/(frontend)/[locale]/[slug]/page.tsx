import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getAllPageSlugs } from '@/lib/cms'
import { getPayloadPage, ManagedPage, managedMetadata } from '@/lib/cms/pages'
import { NOINDEX, hreflangAlternates, seoMetadata } from '@/lib/seo'
import { getBlogArticle, getBlogPosts, getBlogTaxonomy } from '@/lib/blog'
import { ArticleView } from '@/components/blog/article-view'
import { articlePath } from '@/components/blog/article-url'
import { getBlogUi } from '@/components/blog/blog-ui'
import { articleSeoTitle, canonicalArticleSlug } from '@/components/blog/article-seo'
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from '@/components/seo/json-ld'

export const revalidate = 60
export const dynamicParams = true

const RESERVED_TOP_LEVEL_SLUGS = new Set(['admin', 'api', 'editor', '_next'])

/** Articles (Payload → Posts, see src/lib/blog.ts) keep the previous site's root
 *  permalinks — `/<slug>/`, `/en/<slug>/` — so they resolve here rather than
 *  under `/blog/`. Slugs are locale-invariant, so the Greek list covers both. */
export async function generateStaticParams() {
  const [pageSlugs, posts] = await Promise.all([getAllPageSlugs(), getBlogPosts('el')])
  const all = new Set<string>()
  for (const s of pageSlugs) {
    if (s && s !== 'home' && !RESERVED_TOP_LEVEL_SLUGS.has(s)) all.add(s)
  }
  for (const p of posts) {
    if (p.slug && !RESERVED_TOP_LEVEL_SLUGS.has(p.slug)) all.add(p.slug)
  }
  return Array.from(all).map((slug) => ({ slug }))
}

type RouteProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: RouteProps) {
  const { slug } = await params
  const locale = await getLocale()
  const page = await getPayloadPage(slug, locale)
  if (page?.content?.content?.length) {
    return managedMetadata(slug, { locale, path: `/${slug}`, title: page.title }, { always: true })
  }
  const article = await getBlogArticle(slug, locale)
  const alternates = hreflangAlternates(locale, articlePath(canonicalArticleSlug(slug)))
  if (article) {
    return seoMetadata({
      locale,
      alternates,
      title: article.seo?.title || articleSeoTitle(slug, locale, article.title),
      // 15 articles have no excerpt; their opening paragraph stands in.
      description: article.seo?.description || article.excerpt || article.content,
      image: article.seo?.image || article.image,
      type: 'article',
      publishedTime: article.date,
      ...(article.seo?.noindex ? { robots: NOINDEX } : {}),
    })
  }
  return { title: 'Not found' }
}

export default async function CatchAllRoute({ params }: RouteProps) {
  const { slug } = await params
  if (slug === 'home') notFound()
  if (RESERVED_TOP_LEVEL_SLUGS.has(slug)) notFound()

  const locale = await getLocale()
  const page = await getPayloadPage(slug, locale)
  if (page?.content?.content?.length) {
    return <ManagedPage slug={slug} locale={locale} fallback={null} always />
  }

  const article = await getBlogArticle(slug, locale)
  if (article) {
    const [posts, { categories }] = await Promise.all([getBlogPosts(locale), getBlogTaxonomy(locale)])
    const related = posts.filter((p) => p.slug !== slug).slice(0, 3)
    const categoryName = categories.find((c) => c.slug === article.categories?.[0])?.name
    const blogUi = getBlogUi(locale)
    return (
      <>
        <JsonLd
          data={[
            articleJsonLd(locale, { ...article, slug: canonicalArticleSlug(slug) }),
            breadcrumbJsonLd(locale, [
              [locale === 'en' ? 'Home' : 'Αρχική', '/'],
              [blogUi.breadcrumbBlog, '/blog/'],
              [article.title],
            ]),
          ]}
        />
        <ArticleView post={article} related={related} locale={locale} categoryName={categoryName} />
      </>
    )
  }

  notFound()
}
