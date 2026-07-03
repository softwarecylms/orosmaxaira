import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

/** Centered section header (eyebrow → display heading → optional sub). Shared
 *  across the informational pages. */
export function SectionHead({
  eyebrow,
  heading,
  sub,
  className,
}: {
  eyebrow: string
  heading: string
  sub?: string
  className?: string
}) {
  return (
    <Reveal className={cn('mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center', className)}>
      <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">{eyebrow}</span>
      <h2 className="font-display text-[28px] font-bold leading-[1.14] text-foreground md:text-[35px]">
        {heading}
      </h2>
      {sub ? <p className="text-[16px] leading-[1.6] text-muted">{sub}</p> : null}
    </Reveal>
  )
}
