import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  getAllAuthors,
  getAllCategories,
  getAuthorBySlug,
  getPostsByAuthor,
} from '@/lib/cms'
import { BlogIndexRender } from '@/blocks/blog-index'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { mediaSrc, mediaAlt } from '@/lib/utils'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const authors = await getAllAuthors()
  return authors
    .map((a) => a.slug)
    .filter((s): s is string => Boolean(s))
    .map((slug) => ({ slug }))
}

type RouteProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) return { title: 'Not found' }
  const seo = (author.seo ?? {}) as { title?: string; description?: string }
  return {
    title: seo.title || `${author.name} — Author`,
    description:
      seo.description || author.bio || `Posts by ${author.name}.`,
    alternates: { canonical: `/author/${slug}` },
  }
}

export default async function AuthorPage({ params }: RouteProps) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) notFound()

  const [posts, categories] = await Promise.all([
    getPostsByAuthor(author.id),
    getAllCategories(),
  ])

  const avatar = mediaSrc(author.avatar)

  return (
    <>
      <Section
        spacing="default"
        className="bg-background pb-0"
        data-testid="author-hero"
      >
        <Container className="max-w-[820px]">
          <Reveal>
            <div className="flex flex-col items-center gap-5 text-center">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={mediaAlt(author.avatar, author.name)}
                  width={120}
                  height={120}
                  className="size-[120px] rounded-full object-cover ring-4 ring-accent-soft"
                />
              ) : (
                <span className="inline-flex size-[120px] items-center justify-center rounded-full bg-pink text-4xl font-bold text-foreground ring-4 ring-accent-soft">
                  {author.name?.charAt(0) ?? 'A'}
                </span>
              )}
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                  {author.name}
                </h1>
                {author.role ? (
                  <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                    {author.role}
                  </p>
                ) : null}
              </div>
              {author.bio ? (
                <p className="max-w-2xl text-base text-muted md:text-lg">{author.bio}</p>
              ) : null}
            </div>
          </Reveal>
        </Container>
      </Section>
      <BlogIndexRender
        heading={`Posts by ${author.name}`}
        posts={posts}
        activeAuthor={author}
        categories={categories}
      />
    </>
  )
}
