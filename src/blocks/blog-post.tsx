import Image from 'next/image'
import Link from 'next/link'
import type { Post, Category } from '@/payload-types'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { LinkButton } from '@/components/ui/button'
import { mediaSrc, mediaAlt } from '@/lib/utils'
import { LegacyHtml } from '@/components/content/legacy-html'
import { BlogPostingSchema } from '@/components/seo/blog-posting-schema'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'

type Props = {
  post: Post
  relatedPosts?: Post[]
}

function relDocs<T extends { slug?: string | null; name?: string | null; id?: number }>(
  values: unknown,
): T[] {
  if (!Array.isArray(values)) return []
  return values.filter(
    (v): v is T => typeof v === 'object' && v !== null && 'slug' in v,
  ) as T[]
}

export function BlogPostRender({ post, relatedPosts = [] }: Props) {
  const cover = mediaSrc(post.cover)
  const categories = relDocs<Category>(post.categories)
  const primaryCategory = categories[0] ?? null

  const breadcrumbItems = [
    { name: 'Blog', href: '/blog' },
    { name: post.title ?? 'Post', href: `/${post.slug}` },
  ]

  const publishedAt = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <article data-testid="blog-post">
      <BlogPostingSchema post={post} primaryCategory={primaryCategory} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <Section spacing="default" className="bg-background pb-10 md:pb-14">
        <Container className="max-w-[820px]">
          <Reveal>
            <div className="flex flex-col gap-5">
              <Link
                href="/blog"
                data-testid="blog-back-link"
                className="inline-flex items-center gap-1 self-start text-sm text-muted hover:text-foreground"
              >
                ← Back to blog
              </Link>

              <nav
                aria-label="Breadcrumb"
                data-testid="blog-breadcrumb"
                className="flex flex-wrap items-center gap-2 text-sm text-muted"
              >
                {breadcrumbItems.map((item, idx) => (
                  <span key={item.href} className="inline-flex items-center gap-2">
                    {idx > 0 ? <span aria-hidden="true">/</span> : null}
                    {idx === breadcrumbItems.length - 1 ? (
                      <span className="text-foreground">{item.name}</span>
                    ) : (
                      <Link href={item.href} className="hover:text-foreground">
                        {item.name}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>

              {categories.length ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-full bg-accent-soft px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-accent"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              ) : null}

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
                {post.title}
              </h1>

              {post.excerpt ? (
                <p className="text-lg text-muted md:text-[19px] md:leading-[1.55]">
                  {post.excerpt}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                {publishedAt ? <time dateTime={post.publishedAt!}>{publishedAt}</time> : null}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {cover ? (
        <Section spacing="none" className="bg-background pb-10 md:pb-14">
          <Container className="max-w-[1100px]">
            <Reveal>
              <div className="relative aspect-[16/9] overflow-hidden rounded-[30px] bg-pink">
                <Image
                  src={cover}
                  alt={mediaAlt(post.cover, post.title)}
                  fill
                  sizes="(min-width: 1100px) 1100px, 100vw"
                  priority
                  className="object-cover"
                />
              </div>
            </Reveal>
          </Container>
        </Section>
      ) : null}

      <Section spacing="default" className="bg-background pt-0">
        <Container className="max-w-[760px]">
          <Reveal>
            <div className="prose-blog flex flex-col gap-6 text-[17px] leading-[1.7] text-foreground">
              <LegacyHtml
                html={post.legacyContent ?? null}
                richText={post.content ?? null}
                contextTitle={post.title ?? undefined}
              />
            </div>
          </Reveal>


          {relatedPosts.length ? (
            <Reveal delay={0.12}>
              <div
                className="mt-10 border-t border-border pt-8"
                data-testid="related-posts"
              >
                <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  Related articles
                </h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                  {relatedPosts.map((related) => (
                    <li key={related.id}>
                      <Link
                        href={`/${related.slug}`}
                        className="group flex h-full flex-col gap-2 rounded-[20px] border border-border-strong/20 bg-background p-4 transition-colors hover:border-accent/40"
                      >
                        <span className="font-semibold text-foreground group-hover:text-accent">
                          {related.title}
                        </span>
                        {related.excerpt ? (
                          <span className="line-clamp-3 text-sm text-muted">{related.excerpt}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ) : null}

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[30px] bg-surface-dark px-6 py-6 text-white md:px-10 md:py-8">
              <p className="font-display text-[20px] leading-[1.4] md:text-[24px]">
                Need help with your website or SEO?
              </p>
              <LinkButton
                href="/epikoinonia"
                variant="light"
                withIcon
                className="rounded-[40px]"
              >
                Request a callback
              </LinkButton>
            </div>
          </Reveal>
        </Container>
      </Section>
    </article>
  )
}
