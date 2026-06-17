import 'server-only'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type {
  Page,
  Post,
  SiteSetting,
  Header,
  Footer,
  TeamMember,
  Job,
  Faq,
  CaseStudy,
  Testimonial,
  ClientLogo,
  Category,
  Tag,
  PortfolioCategory,
  Author,
} from '@/payload-types'

async function cms() {
  return getPayload({ config: configPromise })
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.warn('[cms] query failed, using fallback:', (err as Error).message)
    return fallback
  }
}

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSetting | null> =>
    safe(async () => {
      const payload = await cms()
      return (await payload.findGlobal({
        slug: 'site-settings',
        depth: 2,
      })) as SiteSetting
    }, null),
  ['site-settings'],
  { tags: ['site-settings'], revalidate: 300 },
)

export const getHeader = unstable_cache(
  async (): Promise<Header | null> =>
    safe(async () => {
      const payload = await cms()
      return (await payload.findGlobal({ slug: 'header', depth: 1 })) as Header
    }, null),
  ['header'],
  { tags: ['header'], revalidate: 300 },
)

export const getFooter = unstable_cache(
  async (): Promise<Footer | null> =>
    safe(async () => {
      const payload = await cms()
      return (await payload.findGlobal({ slug: 'footer', depth: 1 })) as Footer
    }, null),
  ['footer-legal-v1'],
  { tags: ['footer'], revalidate: 300 },
)

export async function getPageBySlug(slug: string): Promise<Page | null> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      depth: 3,
      limit: 1,
    })
    return (res.docs[0] as Page) ?? null
  }, null)
}

export async function getAllPageSlugs(): Promise<string[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'pages',
      limit: 500,
      pagination: false,
      depth: 0,
      select: { slug: true },
    })
    return res.docs.map((d) => d.slug as string).filter(Boolean)
  }, [])
}

export async function getAllPagesMeta(): Promise<
  Array<{ slug: string; title: string; description?: string }>
> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'pages',
      limit: 500,
      pagination: false,
      depth: 0,
      select: { slug: true, title: true, seo: true },
    })
    return res.docs
      .map((d) => {
        const doc = d as { slug?: string; title?: string; seo?: { description?: string } }
        return {
          slug: doc.slug ?? '',
          title: doc.title ?? '',
          description: doc.seo?.description ?? undefined,
        }
      })
      .filter((p) => p.slug)
  }, [])
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
      },
      depth: 2,
      limit: 1,
    })
    return (res.docs[0] as Post) ?? null
  }, null)
}

export async function getAllPostSlugs(): Promise<string[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      limit: 500,
      pagination: false,
      depth: 0,
      select: { slug: true },
    })
    return res.docs.map((d) => d.slug as string).filter(Boolean)
  }, [])
}

export async function getAllPosts(limit = 200): Promise<Post[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      limit,
      depth: 1,
      sort: '-publishedAt',
    })
    return res.docs as Post[]
  }, [])
}

export async function getLatestPosts(limit = 3): Promise<Post[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      limit,
      depth: 1,
      sort: '-publishedAt',
    })
    return res.docs as Post[]
  }, [])
}

export async function getRelatedPosts(
  categoryId: number,
  excludeSlug: string,
  limit = 3,
): Promise<Post[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { slug: { not_equals: excludeSlug } },
          { categories: { in: [categoryId] } },
        ],
      },
      limit,
      depth: 1,
      sort: '-publishedAt',
    })
    return res.docs as Post[]
  }, [])
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })
    return (res.docs[0] as CaseStudy) ?? null
  }, null)
}

export async function getAllCaseStudySlugs(): Promise<string[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'case-studies',
      limit: 500,
      pagination: false,
      depth: 0,
      select: { slug: true },
    })
    return res.docs.map((d) => d.slug as string).filter(Boolean)
  }, [])
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      depth: 0,
      limit: 1,
    })
    return (res.docs[0] as Category) ?? null
  }, null)
}

export async function getAllCategories(): Promise<Category[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({ collection: 'categories', limit: 100, depth: 0 })
    return res.docs as Category[]
  }, [])
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'tags',
      where: { slug: { equals: slug } },
      depth: 0,
      limit: 1,
    })
    return (res.docs[0] as Tag) ?? null
  }, null)
}

export async function getAllTags(): Promise<Tag[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({ collection: 'tags', limit: 200, depth: 0 })
    return res.docs as Tag[]
  }, [])
}

export async function getPortfolioCategoryBySlug(
  slug: string,
): Promise<PortfolioCategory | null> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'portfolio-categories',
      where: { slug: { equals: slug } },
      depth: 0,
      limit: 1,
    })
    return (res.docs[0] as PortfolioCategory) ?? null
  }, null)
}

export async function getAllPortfolioCategories(): Promise<PortfolioCategory[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'portfolio-categories',
      limit: 100,
      depth: 0,
    })
    return res.docs as PortfolioCategory[]
  }, [])
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'authors',
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
    })
    return (res.docs[0] as Author) ?? null
  }, null)
}

export async function getAllAuthors(): Promise<Author[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({ collection: 'authors', limit: 100, depth: 1 })
    return res.docs as Author[]
  }, [])
}

export async function getPostsByCategory(categoryId: number): Promise<Post[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { categories: { in: [categoryId] } },
        ],
      },
      limit: 500,
      depth: 1,
      sort: '-publishedAt',
    })
    return res.docs as Post[]
  }, [])
}

export async function getPostsByTag(tagId: number): Promise<Post[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: {
        and: [{ _status: { equals: 'published' } }, { tags: { in: [tagId] } }],
      },
      limit: 500,
      depth: 1,
      sort: '-publishedAt',
    })
    return res.docs as Post[]
  }, [])
}

export async function getPostsByAuthor(authorId: number): Promise<Post[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'posts',
      where: {
        and: [{ _status: { equals: 'published' } }, { author: { equals: authorId } }],
      },
      limit: 500,
      depth: 1,
      sort: '-publishedAt',
    })
    return res.docs as Post[]
  }, [])
}

export async function getCaseStudiesByCategory(categoryId: number): Promise<CaseStudy[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'case-studies',
      where: { portfolioCategories: { in: [categoryId] } },
      limit: 500,
      depth: 1,
      sort: '-createdAt',
    })
    return res.docs as CaseStudy[]
  }, [])
}

export async function getJobs(status: 'open' | 'closed' = 'open'): Promise<Job[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'jobs',
      where: { status: { equals: status } },
      limit: 50,
      depth: 0,
    })
    return res.docs as Job[]
  }, [])
}

export async function getTeam(): Promise<TeamMember[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'team-members',
      limit: 50,
      depth: 1,
      sort: 'order',
    })
    return res.docs as TeamMember[]
  }, [])
}

export async function getFaqs(): Promise<Faq[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'faqs',
      limit: 50,
      depth: 0,
      sort: 'order',
    })
    return res.docs as Faq[]
  }, [])
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({ collection: 'case-studies', limit: 50, depth: 1 })
    return res.docs as CaseStudy[]
  }, [])
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({ collection: 'testimonials', limit: 50, depth: 1 })
    return res.docs as Testimonial[]
  }, [])
}

export async function getClientLogos(): Promise<ClientLogo[]> {
  return safe(async () => {
    const payload = await cms()
    const res = await payload.find({
      collection: 'client-logos',
      limit: 50,
      depth: 1,
      sort: 'order',
    })
    return res.docs as ClientLogo[]
  }, [])
}
