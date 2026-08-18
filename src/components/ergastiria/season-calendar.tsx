'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { ArrowRight, CalendarClock, CalendarRange } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { monthNameAccusative, monthRangeLabel } from '@/lib/data/workshops'
import { cn } from '@/lib/utils'
import { getErgastiriaUi } from './ergastiria-ui'

/** Minimal shape the calendar needs — supplied by the hub (Medusa or static). */
export type CalWorkshop = { slug: string; title: string; seasonLabel: string; months: number[] }

/**
 * Seasonal timeline for the Εργαστήρια hub: one card per scheduled workshop in
 * season order, the one running *now* marked «Τώρα», and the by-appointment
 * workshops surfaced separately. Data is passed in (so it reflects admin edits).
 * "Now" is resolved after mount to avoid a hydration mismatch.
 */
export function SeasonCalendar({ workshops }: { workshops: CalWorkshop[] }) {
  const locale = useLocale()
  const ui = getErgastiriaUi(locale)
  const [currentMonth, setCurrentMonth] = useState<number | null>(null)
  useEffect(() => setCurrentMonth(new Date().getMonth() + 1), [])

  const scheduled = workshops.filter((w) => w.months.length > 0)
  const onRequest = workshops.filter((w) => w.months.length === 0)
  const current =
    currentMonth != null ? scheduled.find((w) => w.months.includes(currentMonth)) ?? null : null

  return (
    <div className="flex flex-col gap-7">
      {currentMonth ? (
        <p className="text-[15px] leading-[1.7] text-muted">
          {ui.weAreInPre}
          <strong className="font-semibold text-foreground">
            {monthNameAccusative(currentMonth, locale)}
          </strong>
          {current ? (
            <>
              {ui.runningPre}
              <Link
                href={`/drastiriotites/ergastiria/${current.slug}`}
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                {current.title}
              </Link>
              {ui.runningPost}
            </>
          ) : (
            <>{ui.noWorkshopSuffix}</>
          )}
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {scheduled.map((w) => {
          const isCurrent = current?.slug === w.slug
          return (
            <li key={w.slug} className="flex">
              <Link
                href={`/drastiriotites/ergastiria/${w.slug}`}
                aria-label={ui.cardAria(w.seasonLabel, monthRangeLabel(w.months, locale), w.title)}
                className={cn(
                  'group flex h-full w-full flex-col gap-3 rounded-[18px] border p-5 transition-colors',
                  isCurrent
                    ? 'border-accent bg-accent text-white shadow-card'
                    : 'border-border bg-white hover:border-accent',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-[12px] font-semibold uppercase tracking-[0.1em]',
                      isCurrent ? 'text-cream' : 'text-gold-strong',
                    )}
                  >
                    {w.seasonLabel}
                  </span>
                  {isCurrent ? (
                    <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                      Τώρα
                    </span>
                  ) : null}
                </div>

                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-[12.5px] font-medium',
                    isCurrent ? 'text-white/90' : 'text-muted',
                  )}
                >
                  <CalendarRange
                    className={cn('size-3.5 shrink-0', isCurrent ? 'text-cream' : 'text-accent')}
                    aria-hidden="true"
                  />
                  {monthRangeLabel(w.months, locale)}
                </span>

                <h3
                  className={cn(
                    'font-display text-[18px] font-bold leading-[1.25]',
                    isCurrent ? 'text-white' : 'text-foreground',
                  )}
                >
                  {w.title}
                </h3>

                <span
                  className={cn(
                    'mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-semibold',
                    isCurrent ? 'text-white' : 'text-accent',
                  )}
                >
                  {ui.viewWorkshop}
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {onRequest.length > 0 ? (
        <div className="flex flex-col gap-3.5 rounded-[18px] border border-dashed border-border bg-white/60 p-5">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">
            <CalendarClock className="size-3.5 text-accent" aria-hidden="true" />
            {ui.byAppointmentAllYear}
          </span>
          <ul className="flex flex-wrap gap-2.5">
            {onRequest.map((w) => (
              <li key={w.slug}>
                <Link
                  href={`/drastiriotites/ergastiria/${w.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-[13.5px] font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {w.title}
                  <ArrowRight
                    className="size-3.5 text-accent transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
