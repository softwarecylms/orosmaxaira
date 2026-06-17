import Link from 'next/link'
import { Container } from '@/components/ui/section'
import { RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import {
  GaugeStatsGrid,
  GrowthChartImage,
  GrowthTrendBadge,
  GrowthValue,
  PerformanceRings,
  StatsAvatarRow,
} from '@/components/motion/stats-card-motion'
import { mediaSrc, mediaAlt } from '@/lib/utils'

type Card = {
  variant: 'growth' | 'gauge' | 'person'
  value?: string | null
  label?: string | null
  caption?: string | null
  image?: unknown
  link?: { label?: string | null; href?: string | null; newTab?: boolean | null } | null
}

type Block = { cards?: Card[] | null }

function CardLink({
  link,
  size = 'md',
}: {
  link?: Card['link']
  size?: 'sm' | 'md'
}) {
  if (!link?.label || !link?.href) return null
  return (
    <Link
      href={link.href}
      target={link.newTab ? '_blank' : undefined}
      rel={link.newTab ? 'noopener noreferrer' : undefined}
      className="group flex w-full items-center justify-between text-foreground transition-opacity hover:opacity-80"
    >
      <span
        className={
          size === 'sm'
            ? 'text-[13.8px] font-medium leading-[23.1px]'
            : 'text-[15px] font-medium leading-[24.75px]'
        }
      >
        {link.label}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/stats/arrow-up-right-sm.svg"
        alt=""
        width={10}
        height={10}
        className="size-[10px] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </Link>
  )
}

export function StatsCardsRender({ block }: { block: Block }) {
  const cards = (block.cards ?? []).filter(Boolean)
  if (!cards.length) return null

  return (
    <section className="relative pb-10 md:pb-16" data-testid="stats-cards-section">
      <Container>
        <RevealStagger className="grid gap-[23px] md:grid-cols-3" stagger={0.12}>
          {cards.map((c, i) => (
            <RevealStaggerItem
              key={i}
              hoverLift
              className="group flex flex-col rounded-[30px] bg-white p-2.5 shadow-[0_18px_40px_-22px_rgba(20,20,20,0.12)]"
              data-testid={`stats-card-${c.variant}`}
            >
              {c.variant === 'growth' ? (
                <>
                  <div className="relative flex h-[302.66px] flex-col rounded-[22px] bg-peach px-[25px] pb-6 pt-[25px]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <GrowthValue value={c.value ?? '+150%'} />
                        <p className="mt-[5px] text-[15px] leading-[15px] text-foreground">
                          {c.label ?? 'Average Organic Growth'}
                        </p>
                      </div>
                      <GrowthTrendBadge />
                    </div>
                    <GrowthChartImage />
                  </div>
                  <div className="px-5 pb-1 pt-[21px]">
                    <CardLink link={c.link} size="sm" />
                  </div>
                </>
              ) : null}

              {c.variant === 'gauge' ? (
                <>
                  <div className="relative flex h-[300px] flex-col overflow-hidden rounded-[22px] bg-pink px-[25px] pb-[25px] pt-[25px]">
                    <PerformanceRings />
                    <div className="relative z-10">
                      <p className="font-display text-[22px] leading-[33px] text-foreground">
                        {c.label ?? 'Performance'}
                      </p>
                      <GaugeStatsGrid />
                    </div>
                    <StatsAvatarRow />
                  </div>
                  <div className="px-5 pb-1 pt-[21px]">
                    <CardLink link={c.link} />
                  </div>
                </>
              ) : null}

              {c.variant === 'person' ? (
                <>
                  <div className="relative h-[300px] overflow-hidden rounded-[22px] bg-accent-soft">
                    {mediaSrc(c.image) ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mediaSrc(c.image) as string}
                          alt={mediaAlt(c.image, c.label ?? 'Bespoke development')}
                          className="pointer-events-none absolute inset-0 size-full object-cover object-center"
                        />
                      </>
                    ) : null}
                    <div className="relative z-10 flex h-full flex-col px-[25px] pt-[25px]">
                      <p className="font-display max-w-[254px] text-[22px] leading-[33px] text-foreground">
                        {c.label ?? 'Bespoke Development'}
                      </p>
                      {c.caption ? (
                        <p className="mt-[33px] max-w-[197px] text-[14px] font-medium leading-[23.1px] text-[rgba(16,20,23,0.7)]">
                          {c.caption}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="px-5 pb-1 pt-[21px]">
                    <CardLink link={c.link} />
                  </div>
                </>
              ) : null}
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </Container>
    </section>
  )
}
