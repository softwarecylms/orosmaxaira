'use client'

import { useEffect, useState } from 'react'
import { Calendar, Info } from 'lucide-react'

// Glass fields on the gold band — same treatment as the adopt/contact forms.
const inputCls =
  'w-full rounded-[4px] border border-white/30 bg-white/15 px-[15px] py-2.5 text-[16px] leading-[24px] text-white outline-none backdrop-blur transition placeholder:text-white focus:border-white focus:bg-white/25'

/** Activity booking-enquiry form (front-end only; a confirmation state on submit).
 *  Collects contact details plus a preferred day & start time within the activity's
 *  daily window. The client is told this is an enquiry pending our confirmation. */
export function BookingForm({
  activityName,
  startHour = 8,
  endHour = 16,
  stepMinutes = 30,
  seasonStartMonth,
  seasonEndMonth,
  seasonLabel,
}: {
  activityName: string
  /** first / last selectable start time (24h), inclusive. */
  startHour?: number
  endHour?: number
  stepMinutes?: number
  /** Restrict bookable dates to a recurring season (months 1-12), e.g. 4–10. */
  seasonStartMonth?: number
  seasonEndMonth?: number
  seasonLabel?: string
}) {
  const [sent, setSent] = useState(false)
  const [minDate, setMinDate] = useState('')
  const [maxDate, setMaxDate] = useState('')

  // Bookable window. Computed on the client to avoid a hydration mismatch.
  useEffect(() => {
    const now = new Date()
    // Local YYYY-MM-DD (avoids the UTC shift that toISOString() introduces).
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (seasonStartMonth && seasonEndMonth) {
      // Current occurrence of the season, or next year's if it has already passed.
      const year = now.getMonth() + 1 > seasonEndMonth ? now.getFullYear() + 1 : now.getFullYear()
      const start = new Date(year, seasonStartMonth - 1, 1)
      const end = new Date(year, seasonEndMonth, 0) // last day of the end month
      setMinDate(iso(start > now ? start : now))
      setMaxDate(iso(end))
    } else {
      setMinDate(iso(now))
      setMaxDate('')
    }
  }, [seasonStartMonth, seasonEndMonth])

  const slots: string[] = []
  for (let m = startHour * 60; m <= endHour * 60; m += stepMinutes) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }

  if (sent) {
    return (
      <p className="rounded-[8px] border border-white/30 bg-white/15 px-5 py-10 text-center text-[16px] leading-[24px] text-white backdrop-blur">
        Λάβαμε το αίτημά σας για την «{activityName}»! Πρόκειται για αίτημα κράτησης — θα
        επικοινωνήσουμε σύντομα μαζί σας για την επιβεβαίωση. 🐝
      </p>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
      className="flex w-full flex-col gap-4 text-left"
    >
      <input type="hidden" name="activity" value={activityName} />

      <input
        type="text"
        name="name"
        required
        placeholder="Ονοματεπώνυμο"
        aria-label="Ονοματεπώνυμο"
        className={inputCls}
      />
      <input
        type="email"
        name="email"
        required
        placeholder="Email"
        aria-label="Email"
        className={inputCls}
      />
      <input
        type="tel"
        name="phone"
        required
        placeholder="Τηλέφωνο"
        aria-label="Τηλέφωνο"
        className={inputCls}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-white/90">
          Προτιμώμενη ημέρα
          <input
            type="date"
            name="date"
            required
            min={minDate}
            max={maxDate || undefined}
            aria-label="Προτιμώμενη ημέρα"
            className={`${inputCls} [color-scheme:dark]`}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-white/90">
          Ώρα έναρξης
          <select
            name="time"
            required
            defaultValue=""
            aria-label="Ώρα έναρξης"
            className={inputCls}
          >
            <option value="" disabled>
              Επιλέξτε ώρα
            </option>
            {slots.map((t) => (
              <option key={t} value={t} className="text-foreground">
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      {seasonLabel ? (
        <p className="flex items-center gap-2 rounded-[4px] bg-white/15 px-3 py-2 text-[13px] font-semibold text-white backdrop-blur">
          <Calendar className="size-4 shrink-0" aria-hidden="true" />
          {seasonLabel}
        </p>
      ) : null}

      <p className="flex items-start gap-2 text-[13px] font-semibold leading-[1.5] text-white">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Το παρόν αποτελεί αίτημα κράτησης. Θα επικοινωνήσουμε μαζί σας για την επιβεβαίωση της
        διαθεσιμότητας.
      </p>

      <button
        type="submit"
        className="rounded-[4px] bg-white p-[14px] text-[16px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-white"
      >
        Αποστολή αιτήματος
      </button>
    </form>
  )
}
