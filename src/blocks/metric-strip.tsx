import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Container } from '@/components/ui/section'
import { Counter } from '@/components/motion/counter'
import { RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

type Metric = {
  value: string
  label?: string | null
  delta?: string | null
  trend?: 'up' | 'down' | 'none' | null
}

type Block = {
  eyebrow?: string | null
  heading?: string | null
  metrics?: Metric[] | null
  tone?: 'light' | 'dark' | null
}

/**
 * A compact strip of animated KPIs (value counts up on scroll). Built for
 * "results" / case-study / SEO-report sections — distinct from StatsCards
 * (big illustrated cards). Reuses the existing <Counter> so reduced-motion is
 * already handled.
 */
export function MetricStripRender({ block }: { block: Block }) {
  const metrics = (block.metrics ?? []).filter((m) => m?.value?.trim())
  if (!metrics.length) return null

  const dark = block.tone === 'dark'

  return (
    <section
      className={cn('py-12 md:py-16', dark ? 'bg-surface-dark text-white' : 'bg-background text-foreground')}
      data-testid="metric-strip"
    >
      <Container>
        {block.eyebrow ? (
          <p className={cn('text-center text-[12px] font-bold uppercase tracking-[0.12em]', dark ? 'text-warm-accent' : 'text-accent')}>
            {block.eyebrow}
          </p>
        ) : null}
        {block.heading ? (
          <h2 className="mx-auto mt-2 max-w-2xl text-center font-display text-[26px] leading-[1.25] md:text-[34px]">
            {block.heading}
          </h2>
        ) : null}

        <RevealStagger
          className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-12 md:grid-cols-4"
          stagger={0.1}
        >
          {metrics.map((m, i) => {
            const trend = m.trend ?? 'none'
            return (
              <RevealStaggerItem
                key={i}
                className="flex flex-col items-center px-4 text-center"
                data-testid="metric-cell"
              >
                <Counter
                  value={m.value}
                  className="font-display text-4xl leading-none tracking-tight md:text-5xl"
                />
                {m.delta && trend !== 'none' ? (
                  <span
                    className={cn(
                      'mt-2 inline-flex items-center gap-1 text-[13px] font-semibold tabular-nums',
                      trend === 'up' ? 'text-accent' : dark ? 'text-cream-soft' : 'text-muted',
                    )}
                  >
                    {trend === 'up' ? (
                      <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
                    ) : (
                      <ArrowDownRight className="size-3.5" strokeWidth={2.5} />
                    )}
                    {m.delta}
                  </span>
                ) : null}
                {m.label ? (
                  <p className={cn('mt-2 max-w-[180px] text-[14px] leading-[20px]', dark ? 'text-white/70' : 'text-muted')}>
                    {m.label}
                  </p>
                ) : null}
              </RevealStaggerItem>
            )
          })}
        </RevealStagger>
      </Container>
    </section>
  )
}
