import Image from 'next/image'
import Link from 'next/link'
import type { Post, Category, Tag, Author } from '@/payload-types'
import { Section, Container } from '@/components/ui/section'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { mediaSrc, mediaAlt, cn } from '@/lib/utils'

type Props = {
  heading?: string
  subheading?: string
  posts: Post[]
  activeCategory?: Category | null
  activeTag?: Tag | null
  activeAuthor?: Author | null
  categories?: Category[]
}

const categoryTone: Record<string, string> = {
  design: 'bg-[#3a76ff] text-white',
  seo: 'bg-[#ef4444] text-white',
  marketing: 'bg-[#fbbf24] text-foreground',
  development: 'bg-[#a855f7] text-white',
  business: 'bg-accent text-white',
}

const coverBySlug: Record<string, string> = {}

export function BlogIndexRender({
  heading,
  subheading,
  posts,
  activeCategory,
  activeTag,
  activeAuthor,
  categories = [],
}: Props) {
  const headerLine =
    heading ??
    activeCategory?.name ??
    (activeTag ? `Posts tagged “${activeTag.name}”` : null) ??
    (activeAuthor ? `Posts by ${activeAuthor.name}` : null) ??
    'Latest News From Our Blog'

  return (
    <Section spacing="default" className="bg-background" data-testid="blog-index-section">
      <Container className="flex flex-col gap-10">
        <Reveal>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="eyebrow">Blog</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {headerLine}
            </h1>
            {subheading ? (
              <p className="max-w-2xl text-base text-muted md:text-lg">{subheading}</p>
            ) : null}
          </div>
        </Reveal>

        {categories.length ? (
          <Reveal delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/blog"
                className={
                  !activeCategory && !activeTag && !activeAuthor
                    ? 'rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-background'
                    : 'rounded-full border border-border-strong/30 px-4 py-2 text-[13px] font-medium text-foreground hover:bg-foreground/5'
                }
              >
                All
              </Link>
              {categories.map((c) => {
                const active = activeCategory?.id === c.id
                return (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className={
                      active
                        ? 'rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-background'
                        : 'rounded-full border border-border-strong/30 px-4 py-2 text-[13px] font-medium text-foreground hover:bg-foreground/5'
                    }
                  >
                    {c.name}
                  </Link>
                )
              })}
            </div>
          </Reveal>
        ) : null}

        {posts.length ? (
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => {
              const src = mediaSrc(p.cover) ?? coverBySlug[p.slug ?? '']
              const cat = p.category ?? 'design'
              return (
                <RevealStaggerItem
                  key={p.id}
                  hoverLift
                  className="group flex flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_18px_40px_-22px_rgba(20,20,20,0.12)]"
                  data-testid={`blog-index-card-${p.slug}`}
                >
                  <Link href={`/${p.slug}`} className="flex h-full flex-col">
                    <div className="relative aspect-[768/494] overflow-hidden bg-pink">
                      {src ? (
                        <Image
                          src={src}
                          alt={mediaAlt(p.cover, p.title)}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <span
                          className={cn(
                            'absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider',
                            categoryTone[cat] ?? categoryTone.design,
                          )}
                        >
                          {cat}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
                      <h3 className="font-display text-lg leading-snug md:text-xl">
                        {p.title}
                      </h3>
                      {p.excerpt ? (
                        <p className="line-clamp-2 text-sm text-muted">{p.excerpt}</p>
                      ) : null}
                      <span className="mt-auto pt-2 text-sm font-medium text-foreground">
                        Read More
                      </span>
                    </div>
                  </Link>
                </RevealStaggerItem>
              )
            })}
          </RevealStagger>
        ) : (
          <p className="text-center text-muted">No posts yet — check back soon.</p>
        )}
      </Container>
    </Section>
  )
}
