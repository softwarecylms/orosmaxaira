'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { monthName, workshopForMonth } from '@/lib/data/workshops'
import { cn } from '@/lib/utils'

/**
 * A 12-month strip showing which workshop runs when. The workshop of each month
 * is derived from the data module, so it stays in sync automatically. The
 * current month is highlighted (computed after mount to avoid a build-time /
 * hydration mismatch); months with no scheduled workshop read "κατόπιν ραντεβού".
 */
export function SeasonCalendar() {
  const [currentMonth, setCurrentMonth] = useState<number | null>(null)
  useEffect(() => setCurrentMonth(new Date().getMonth() + 1), [])

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }, (_, i) => {
        const month = i + 1
        const w = workshopForMonth(month)
        const isCurrent = currentMonth === month

        const cardCls = cn(
          'group flex h-full flex-col gap-1.5 rounded-[14px] border p-4 transition-colors',
          isCurrent
            ? 'border-accent bg-accent text-white shadow-card'
            : w
              ? 'border-border bg-white hover:border-accent'
              : 'border-dashed border-border bg-offwhite',
        )

        const inner = (
          <>
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'text-[12px] font-semibold uppercase tracking-[0.08em]',
                  isCurrent ? 'text-cream' : 'text-accent',
                )}
              >
                {monthName(month)}
              </span>
              {isCurrent ? (
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                  Τώρα
                </span>
              ) : null}
            </div>
            <span
              className={cn(
                'text-[14px] font-semibold leading-snug',
                isCurrent ? 'text-white' : w ? 'text-foreground' : 'text-muted',
              )}
            >
              {w ? w.title : 'Κατόπιν ραντεβού'}
            </span>
            {w ? (
              <span
                className={cn(
                  'mt-auto inline-flex items-center gap-1 pt-1 text-[12.5px] font-semibold',
                  isCurrent ? 'text-white' : 'text-accent',
                )}
              >
                Δείτε
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            ) : null}
          </>
        )

        return (
          <li key={month} className="flex">
            {w ? (
              <Link
                href={`/drastiriotites/ergastiria/${w.slug}`}
                className={cardCls}
                aria-label={`${monthName(month)} — ${w.title}`}
              >
                {inner}
              </Link>
            ) : (
              <div className={cardCls}>{inner}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
