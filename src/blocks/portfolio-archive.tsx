import Image from 'next/image'
import Link from 'next/link'
import type { CaseStudy, PortfolioCategory } from '@/payload-types'
import { Section, Container } from '@/components/ui/section'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { mediaSrc, mediaAlt } from '@/lib/utils'

type Props = {
  heading?: string
  subheading?: string
  items: CaseStudy[]
  activeCategory?: PortfolioCategory | null
  categories?: PortfolioCategory[]
}

const coverBySlug: Record<string, string> = {}

export function PortfolioArchive({
  heading,
  subheading,
  items,
  activeCategory,
  categories = [],
}: Props) {
  return (
    <Section
      spacing="default"
      className="bg-background"
      data-testid="portfolio-archive-section"
    >
      <Container className="flex flex-col gap-10">
        <Reveal>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="eyebrow">Portfolio</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {heading ?? activeCategory?.name ?? 'Our Portfolio'}
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
                href="/portfolio"
                className={
                  !activeCategory
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
                    href={`/portfolio-category/${c.slug}`}
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

        {items.length ? (
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const src = mediaSrc(item.cover) ?? coverBySlug[item.slug ?? '']
              return (
                <RevealStaggerItem
                  key={item.id}
                  hoverLift
                  className="flex flex-col gap-3"
                  data-testid={`portfolio-archive-card-${item.slug}`}
                >
                  <Link
                    href={`/portfolio/${item.slug}`}
                    className="group block overflow-hidden rounded-[30px] bg-white p-4 shadow-[0_18px_40px_-22px_rgba(20,20,20,0.12)]"
                  >
                    <div className="relative aspect-[391/455] w-full overflow-hidden rounded-[26px] bg-pink">
                      {src ? (
                        <Image
                          src={src}
                          alt={mediaAlt(item.cover, item.title)}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : null}
                    </div>
                  </Link>
                  <div className="flex flex-col gap-0.5 px-1">
                    <p className="font-display text-[20px] leading-[24px] text-foreground">
                      {item.title}
                    </p>
                    {item.client ? (
                      <p className="text-[15px] leading-[27.2px] text-foreground/50">
                        {item.client}
                      </p>
                    ) : null}
                  </div>
                </RevealStaggerItem>
              )
            })}
          </RevealStagger>
        ) : (
          <p className="text-center text-muted">No projects yet — check back soon.</p>
        )}
      </Container>
    </Section>
  )
}
