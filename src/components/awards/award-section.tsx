import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AwardBadge } from './award-badge'
import { AwardCarousel } from './award-carousel'
import type { Award, RichLine } from './awards-content'

/** Render a paragraph that may contain bold and/or link (product) spans. */
function Rich({ line }: { line: RichLine }) {
  if (typeof line === 'string') return <>{line}</>
  return (
    <>
      {line.map((s, i) =>
        s.href ? (
          <Link
            key={i}
            href={s.href}
            className={cn(
              'text-accent underline underline-offset-2 transition-colors hover:text-gold-strong',
              s.bold && 'font-semibold',
            )}
          >
            {s.text}
          </Link>
        ) : s.bold ? (
          <strong key={i} className="font-semibold text-foreground">
            {s.text}
          </strong>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}

/** One award as an alternating 50/50 section: copy on one side, image carousel
 *  on the other (sides swap every other award via `reversed`). Stacks on mobile. */
export function AwardSection({ award, reversed = false }: { award: Award; reversed?: boolean }) {
  const meta = [award.org, award.year].filter(Boolean).join(' · ')
  return (
    <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
      {/* Copy */}
      <div className={cn('flex flex-col gap-5', reversed && 'lg:order-2')}>
        <div className="flex flex-wrap gap-2">
          {award.badges.map((b, i) => (
            <AwardBadge key={i} badge={b} />
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-[26px] font-bold leading-[1.12] text-foreground md:text-[34px]">
            {award.event}
          </h2>
          {meta || award.subject ? (
            <p className="text-[14px] text-muted md:text-[15px]">
              {meta}
              {award.subject ? (
                <>
                  {meta ? ' — ' : ''}
                  <span className="text-foreground">{award.subject}</span>
                </>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 text-[16px] leading-[26px] text-foreground/90">
          <p className="text-[17px] leading-[27px] text-foreground">
            <Rich line={award.lead} />
          </p>
          {award.body?.map((p, i) => (
            <p key={i}>
              <Rich line={p} />
            </p>
          ))}
          {award.highlights?.length ? (
            <ul className="mt-1 flex flex-col gap-2">
              {award.highlights.map((h, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {award.note ? (
            <p className="mt-1 border-l-2 border-accent/40 pl-3 text-[14px] italic leading-[22px] text-muted">
              {award.note}
            </p>
          ) : null}
        </div>
      </div>

      {/* Carousel */}
      {award.images.length ? (
        <div className={cn('w-full', reversed && 'lg:order-1')}>
          <AwardCarousel images={award.images} alt={award.event} />
        </div>
      ) : null}
    </article>
  )
}
