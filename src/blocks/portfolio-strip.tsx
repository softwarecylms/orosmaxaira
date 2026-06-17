import Image from 'next/image'
import Link from 'next/link'
import { Section, Container } from '@/components/ui/section'
import type { CaseStudy } from '@/payload-types'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { LinkButton } from '@/components/ui/button'
import { mediaSrc, mediaAlt } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Block = {
  eyebrow?: string | null
  heading?: string | null
  items?: (number | CaseStudy)[] | null
  ctaLabel?: string | null
  ctaHref?: string | null
}

const frameStyles: Record<NonNullable<CaseStudy['device']>, string> = {
  mobile: 'aspect-[391/455] rounded-[26px]',
  laptop: 'aspect-[391/455] rounded-[26px]',
  desktop: 'aspect-[391/455] rounded-[26px]',
}

const coverBySlug: Record<string, string> = {}

export function PortfolioStripRender({ block }: { block: Block }) {
  const items = (block.items ?? []).filter(
    (i): i is CaseStudy => typeof i === 'object' && i !== null,
  )
  if (!items.length) return null

  return (
    <Section spacing="default" className="bg-background" data-testid="portfolio-strip-section">
      <Container className="flex flex-col gap-10">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-[35px]">
            {block.heading ?? 'Active Portfolio from our clients'}
          </h2>
        </Reveal>

        <RevealStagger className="grid gap-5 md:grid-cols-3">
          {items.slice(0, 3).map((item) => {
            const src = mediaSrc(item.cover) ?? coverBySlug[item.slug ?? '']
            return (
              <RevealStaggerItem
                key={item.id}
                hoverLift
                className="flex flex-col gap-3"
                data-testid={`portfolio-card-${item.slug}`}
              >
                <Link
                  href={`/case-studies/${item.slug}`}
                  className="group block overflow-hidden rounded-[30px] bg-white p-4 shadow-[0_18px_40px_-22px_rgba(20,20,20,0.12)]"
                >
                  <div
                    className={cn(
                      'relative w-full overflow-hidden bg-pink',
                      frameStyles[item.device ?? 'desktop'],
                    )}
                  >
                    {src ? (
                      <Image
                        src={src}
                        alt={mediaAlt(item.cover, item.title)}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
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
                    <p className="text-[16px] leading-[27.2px] text-foreground/50">{item.client}</p>
                  ) : null}
                </div>
              </RevealStaggerItem>
            )
          })}
        </RevealStagger>

        <div className="flex justify-center">
          <Reveal delay={0.1}>
            <LinkButton
              href={block.ctaHref ?? '/portfolio'}
              variant="primary"
              withIcon
              className="rounded-[40px]"
            >
              {block.ctaLabel ?? 'View All'}
            </LinkButton>
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
