'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { Calendar, Info } from 'lucide-react'
import { getBookingUi } from './booking-ui'

// Two skins: 'accent' = glass fields on the gold band (the CTA sections);
// 'light' = dark-on-white fields (inside a white modal / card).
const STYLES = {
  accent: {
    input:
      'w-full rounded-[4px] border border-white/30 bg-white/15 px-[15px] py-2.5 text-[16px] leading-[24px] text-white outline-none backdrop-blur transition placeholder:text-white focus:border-white focus:bg-white/25',
    dateExtra: ' [color-scheme:dark]',
    label: 'flex flex-col gap-1.5 text-[13px] font-medium text-white/90',
    season: 'flex items-center gap-2 rounded-[4px] bg-white/15 px-3 py-2 text-[13px] font-semibold text-white backdrop-blur',
    seasonIcon: '',
    note: 'flex items-start gap-2 text-[13px] font-semibold leading-[1.5] text-white',
    noteIcon: '',
    button:
      'rounded-[4px] bg-white p-[14px] text-[16px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-white',
    sent: 'rounded-[8px] border border-white/30 bg-white/15 px-5 py-10 text-center text-[16px] leading-[24px] text-white backdrop-blur',
  },
  light: {
    input:
      'w-full rounded-[8px] border border-border bg-white px-4 py-2.5 text-[15px] leading-[22px] text-foreground outline-none transition placeholder:text-muted focus:border-accent',
    dateExtra: '',
    label: 'flex flex-col gap-1.5 text-[13px] font-medium text-foreground',
    season: 'flex items-center gap-2 rounded-[8px] bg-accent/10 px-3 py-2 text-[13px] font-semibold text-gold-strong',
    seasonIcon: 'text-accent',
    note: 'flex items-start gap-2 text-[13px] leading-[1.5] text-muted',
    noteIcon: 'text-accent',
    button:
      'rounded-[4px] bg-accent p-[14px] text-[16px] font-semibold text-white transition-colors hover:bg-foreground',
    sent: 'rounded-[8px] bg-success-soft px-5 py-10 text-center text-[16px] leading-[24px] text-foreground',
  },
} as const

/** Activity booking-enquiry form. Collects contact details plus a preferred day &
 *  start time within the activity's daily window. The client is told this is an
 *  enquiry pending our confirmation. With `activitySlug` it is sent to
 *  /api/booking-enquiry (the farm is notified, the customer gets an
 *  acknowledgement); without it, it only shows the confirmation state. */
export function BookingForm({
  activityName,
  activitySlug,
  startHour = 8,
  endHour = 16,
  stepMinutes = 30,
  seasonStartMonth,
  seasonEndMonth,
  seasonLabel,
  variant = 'accent',
}: {
  activityName: string
  /** The Medusa activity the request is for — enables sending it. */
  activitySlug?: string
  /** first / last selectable start time (24h), inclusive. */
  startHour?: number
  endHour?: number
  stepMinutes?: number
  /** Restrict bookable dates to a recurring season (months 1-12), e.g. 4–10. */
  seasonStartMonth?: number
  seasonEndMonth?: number
  seasonLabel?: string
  /** 'accent' on a gold band, 'light' inside a white modal/card. */
  variant?: 'accent' | 'light'
}) {
  const s = STYLES[variant]
  const locale = useLocale()
  const ui = getBookingUi(locale)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    return <p className={s.sent}>{ui.sentMessage(activityName)}</p>
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!activitySlug) return setSent(true)
        const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
        setSending(true)
        setError(null)
        try {
          const res = await fetch('/api/booking-enquiry/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: activitySlug,
              name: data.name,
              email: data.email,
              phone: data.phone,
              date: data.date,
              time: data.time,
              website: data.website,
              locale,
            }),
          })
          if (!res.ok) throw new Error(String(res.status))
          setSent(true)
        } catch {
          setError(ui.sendFailed)
        } finally {
          setSending(false)
        }
      }}
      className="flex w-full flex-col gap-4 text-left"
    >
      <input type="hidden" name="activity" value={activityName} />
      {/* Honeypot: hidden from people, filled by bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <input
        type="text"
        name="name"
        required
        placeholder={ui.fullName}
        aria-label={ui.fullName}
        className={s.input}
      />
      <input
        type="email"
        name="email"
        required
        placeholder={ui.email}
        aria-label={ui.email}
        className={s.input}
      />
      <input
        type="tel"
        name="phone"
        required
        placeholder={ui.phone}
        aria-label={ui.phone}
        className={s.input}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={s.label}>
          {ui.preferredDay}
          <input
            type="date"
            name="date"
            required
            min={minDate}
            max={maxDate || undefined}
            aria-label={ui.preferredDay}
            className={`${s.input}${s.dateExtra}`}
          />
        </label>
        <label className={s.label}>
          {ui.startTime}
          <select name="time" required defaultValue="" aria-label={ui.startTime} className={s.input}>
            <option value="" disabled>
              {ui.chooseTime}
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
        <p className={s.season}>
          <Calendar className={`size-4 shrink-0 ${s.seasonIcon}`} aria-hidden="true" />
          {seasonLabel}
        </p>
      ) : null}

      <p className={s.note}>
        <Info className={`mt-0.5 size-4 shrink-0 ${s.noteIcon}`} aria-hidden="true" />
        {ui.requestNote}
      </p>

      {error ? (
        <p className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-700">{error}</p>
      ) : null}

      <button type="submit" disabled={sending} className={`${s.button} disabled:opacity-60`}>
        {sending ? ui.sending : ui.sendRequest}
      </button>
    </form>
  )
}
