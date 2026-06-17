import Image from 'next/image'
import Link from 'next/link'
import { Section, Container } from '@/components/ui/section'
import type { Post } from '@/payload-types'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { LinkButton } from '@/components/ui/button'
import { mediaSrc, mediaAlt, cn } from '@/lib/utils'

type Block = {
  eyebrow?: string | null
  heading?: string | null
  mode?: 'latest' | 'manual' | null
  posts?: (number | Post)[] | null
  limit?: number | null
}

const categoryTone: Record<string, string> = {
  design: 'bg-[#3a76ff] text-white',
  seo: 'bg-[#ef4444] text-white',
  marketing: 'bg-[#fbbf24] text-foreground',
  development: 'bg-[#a855f7] text-white',
  business: 'bg-accent text-white',
}

const coverBySlug: Record<string, string> = {}

/**
 * Sync renderer. Expects `posts` to already be populated docs.
 * The Puck data hydrator at src/puck/hydrate.ts pre-fills `posts` with
 * either the manual selection or the latest N posts before render.
 */
export function BlogTeaserRender({ block }: { block: Block }) {
  const posts = (block.posts ?? []).filter(
    (p): p is Post => typeof p === 'object' && p !== null,
  )

  return (
    <Section spacing="default" className="bg-background" data-testid="blog-teaser-section">
      <Container className="flex flex-col gap-10">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-[35px]">
            {block.heading ?? 'Latest News From Our Blog'}
          </h2>
        </Reveal>

        {posts.length ? (
          <RevealStagger className="grid gap-5 md:grid-cols-3">
            {posts.map((p) => {
              const src = mediaSrc(p.cover) ?? coverBySlug[p.slug ?? '']
              const cat = p.category ?? 'design'
              return (
                <RevealStaggerItem
                  key={p.id}
                  hoverLift
                  className="group flex flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_18px_40px_-22px_rgba(20,20,20,0.12)]"
                  data-testid={`blog-card-${p.slug}`}
                >
                  <Link href={`/${p.slug}`} className="flex h-full flex-col">
                    <div className="relative aspect-[768/494] overflow-hidden bg-pink">
                      {src ? (
                        <Image
                          src={src}
                          alt={mediaAlt(p.cover, p.title)}
                          fill
                          sizes="(min-width: 768px) 33vw, 100vw"
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
                      <h3 className="font-display text-lg leading-snug md:text-xl">{p.title}</h3>
                      {p.excerpt ? (
                        <p className="text-sm text-muted line-clamp-2">{p.excerpt}</p>
                      ) : null}
                      <span className="mt-auto pt-2 text-sm font-medium text-foreground">Read More</span>
                    </div>
                  </Link>
                </RevealStaggerItem>
              )
            })}
          </RevealStagger>
        ) : (
          <p className="text-sm text-muted">No posts yet.</p>
        )}

        <div className="flex justify-center">
          <Reveal delay={0.1}>
            <LinkButton href="/blog" variant="primary" withIcon className="rounded-[40px]">
              View All
            </LinkButton>
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
