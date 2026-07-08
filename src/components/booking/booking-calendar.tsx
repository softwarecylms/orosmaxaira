'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ'] // Monday-first
const MONTHS = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
]

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

/**
 * Month-grid date picker. Only dates in `availableDates` are selectable; past
 * dates and empty dates are disabled. Month navigation is clamped to the range
 * of available dates so the user can't wander into empty months.
 */
export function BookingCalendar({
  availableDates,
  selected,
  onSelect,
}: {
  availableDates: Set<string>
  selected: string | null
  onSelect: (date: string) => void
}) {
  const sorted = useMemo(() => [...availableDates].sort(), [availableDates])
  const firstAvail = sorted[0]
  const lastAvail = sorted[sorted.length - 1]

  // Start on the month of the selected date, else the first available month.
  const initial = selected ?? firstAvail ?? iso(new Date().getFullYear(), new Date().getMonth(), 1)
  const [cursor, setCursor] = useState({
    year: Number(initial.slice(0, 4)),
    month: Number(initial.slice(5, 7)) - 1,
  })

  const cursorKey = cursor.year * 12 + cursor.month
  const minKey = firstAvail
    ? Number(firstAvail.slice(0, 4)) * 12 + (Number(firstAvail.slice(5, 7)) - 1)
    : cursorKey
  const maxKey = lastAvail
    ? Number(lastAvail.slice(0, 4)) * 12 + (Number(lastAvail.slice(5, 7)) - 1)
    : cursorKey
  const canPrev = cursorKey > minKey
  const canNext = cursorKey < maxKey

  const step = (dir: -1 | 1) => {
    setCursor((c) => {
      const total = c.year * 12 + c.month + dir
      return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 }
    })
  }

  const { year, month } = cursor
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => canPrev && step(-1)}
          disabled={!canPrev}
          aria-label="Προηγούμενος μήνας"
          className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-offwhite disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-[15px] font-semibold text-foreground">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => canNext && step(1)}
          disabled={!canNext}
          aria-label="Επόμενος μήνας"
          className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-offwhite disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-center text-[11px] font-medium text-muted">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`b-${i}`} />
          const ds = iso(year, month, day)
          const available = availableDates.has(ds)
          const isSelected = ds === selected
          return (
            <button
              key={ds}
              type="button"
              disabled={!available}
              onClick={() => onSelect(ds)}
              aria-label={`${day} ${MONTHS[month]} ${year}`}
              aria-pressed={isSelected}
              className={`mx-auto flex size-8 items-center justify-center rounded-full text-[13px] transition-colors ${
                isSelected
                  ? 'bg-accent font-semibold text-white'
                  : available
                    ? 'font-medium text-foreground hover:bg-accent/10'
                    : 'cursor-default text-muted/35'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
