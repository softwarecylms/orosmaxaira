'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocale } from 'next-intl'
import { Check, Info, Loader2 } from 'lucide-react'
import { BookingCalendar } from '@/components/booking/booking-calendar'
import { getBookingUi } from '@/components/booking/booking-ui'
import { MAX_STUDENTS, SCHOOL_WORKSHOP_OPTIONS, pricePerChild } from '@/lib/data/school-visit'
import { getScholeiaUi } from './scholeia-ui'

type FormWorkshopOption = { key: string; short: string }
type FormPricing = { range: string; price: number | null }[]

// Light fields — the form lives inside the white booking modal.
const inputCls =
  'w-full rounded-[8px] border border-border bg-white px-4 py-2.5 text-[15px] leading-[22px] text-foreground outline-none transition placeholder:text-muted focus:border-accent'

const labelCls = 'flex flex-col gap-1.5 text-[13px] font-medium text-foreground'
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/** True for a YYYY-MM-DD date on Mon–Fri (school visits run on weekdays only). */
const isWeekday = (ds: string): boolean => {
  if (!ds) return false
  const [y, m, d] = ds.split('-').map(Number)
  const wd = new Date(y, (m ?? 1) - 1, d ?? 1).getDay()
  return wd >= 1 && wd <= 5
}

/**
 * School-visit booking request form (rendered inside SchoolBookingModal).
 * Captures the school, contact, headcount, preferred date and the chosen
 * Δραστηριότητα-2 workshop, shows a live cost estimate, and submits to
 * /api/school-visit-enquiry. Validation runs on submit so keyboard / screen
 * reader users get a concrete reason; the workshop + headcount are re-checked
 * server-side.
 */
export function SchoolVisitForm({
  onSuccess,
  workshopOptions = SCHOOL_WORKSHOP_OPTIONS as unknown as FormWorkshopOption[],
  maxStudents = MAX_STUDENTS,
  pricing,
}: {
  onSuccess?: () => void
  workshopOptions?: FormWorkshopOption[]
  maxStudents?: number
  pricing?: FormPricing
}) {
  const locale = useLocale()
  const ui = getScholeiaUi(locale)
  const bui = getBookingUi(locale)
  const [school, setSchool] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [students, setStudents] = useState('')
  const [grade, setGrade] = useState('')
  const [workshop, setWorkshop] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [website, setWebsite] = useState('') // honeypot

  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  // Bookable dates = weekdays (Mon–Fri) from today through ~8 months out, so the
  // calendar greys out weekends + past dates. Computed on the client (depends on
  // today) to avoid a hydration mismatch.
  useEffect(() => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const set = new Set<string>()
    const end = new Date(now.getFullYear(), now.getMonth() + 8, now.getDate())
    for (
      const cur = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      cur <= end;
      cur.setDate(cur.getDate() + 1)
    ) {
      const wd = cur.getDay()
      if (wd >= 1 && wd <= 5) set.add(isoOf(cur))
    }
    setAvailableDates(set)
  }, [])

  const count = useMemo(() => {
    const n = parseInt(students, 10)
    return Number.isFinite(n) ? n : 0
  }, [students])
  // Per-child price: from the Medusa pricing tiers ([≤25, 26+]) when provided,
  // else the static rule (≤25 → €8, else €7).
  const perChild = (n: number): number => {
    if (pricing && pricing.length) {
      const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d)
      return n <= 25 ? num(pricing[0]?.price, 8) : num(pricing[1]?.price, 7)
    }
    return pricePerChild(n)
  }
  const estimate = count > 0 ? count * perChild(count) : 0

  const validate = (): string | null => {
    if (school.trim().length < 2) return ui.vSchool
    if (name.trim().length < 2) return ui.vName
    if (!emailOk(email)) return ui.vEmail
    if (phone.trim().length < 5) return ui.vPhone
    if (!count || count < 1) return ui.vCount
    if (count > maxStudents) return ui.vMax(maxStudents)
    if (!workshop) return ui.vWorkshop
    if (!date) return ui.vDate
    if (!isWeekday(date)) return ui.vWeekday
    return null
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/school-visit-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school: school.trim(),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date,
          students: count,
          grade: grade.trim(),
          workshop,
          notes: notes.trim(),
          website,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? ui.genericError)
      }
      setSent(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.genericError)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <Check className="size-7" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <h3 className="font-display text-[22px] font-bold text-foreground">{ui.successTitle}</h3>
        <p className="max-w-[360px] text-[14.5px] leading-[1.6] text-muted">{ui.successBody}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-4 text-left">
      <input
        type="text"
        value={school}
        onChange={(e) => setSchool(e.target.value)}
        required
        placeholder={ui.school}
        aria-label={ui.school}
        className={inputCls}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder={ui.contactPerson}
          aria-label={ui.contactPerson}
          className={inputCls}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder={bui.phone}
          aria-label={bui.phone}
          className={inputCls}
        />
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder={bui.email}
        aria-label={bui.email}
        className={inputCls}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          {ui.numberOfChildren}
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={maxStudents}
            value={students}
            onChange={(e) => setStudents(e.target.value)}
            required
            placeholder={`1–${maxStudents}`}
            aria-label={ui.numberOfChildren}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          {ui.gradeLabel}
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder={ui.gradePlaceholder}
            aria-label={ui.gradeAria}
            className={inputCls}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-foreground">
          {ui.preferredDate} <span className="text-muted">{ui.weekdaysOnly}</span>
        </span>
        <div className="rounded-[8px] border border-border bg-white p-3">
          <BookingCalendar
            availableDates={availableDates}
            selected={date || null}
            onSelect={setDate}
          />
        </div>
        {date ? (
          <span className="text-[12.5px] text-muted">
            {ui.selectedDate}{' '}
            <span className="font-semibold text-foreground">{bui.formatDate(date)}</span>
          </span>
        ) : null}
      </div>

      {/* Δραστηριότητα 2 workshop choice (required) */}
      <fieldset className="flex flex-col gap-2" aria-required="true">
        <legend className="mb-1 text-[13px] font-semibold text-foreground">
          {ui.workshopLegend} <span aria-hidden="true">*</span>
          <span className="sr-only">{ui.required}</span>
        </legend>
        <div className="flex flex-col gap-2">
          {workshopOptions.map((opt) => {
            const active = workshop === opt.key
            return (
              <label
                key={opt.key}
                className={`flex cursor-pointer items-start gap-3 rounded-[8px] border px-4 py-3 text-[14.5px] leading-[1.4] transition ${
                  active
                    ? 'border-accent bg-accent/10 text-foreground'
                    : 'border-border bg-white text-muted hover:border-accent'
                }`}
              >
                <input
                  type="radio"
                  name="school-workshop"
                  value={opt.key}
                  checked={active}
                  onChange={() => setWorkshop(opt.key)}
                  className="mt-0.5 size-4 shrink-0 accent-accent"
                />
                <span>{opt.short}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder={ui.notesPlaceholder}
        aria-label={ui.notesAria}
        className={`${inputCls} resize-y`}
      />

      {/* Live total — €8/child up to 25 children, €7/child for 26+ (escorts free) */}
      {count > 0 && count <= maxStudents ? (
        <div className="flex flex-col gap-1 rounded-[8px] bg-accent/10 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[14px] font-semibold text-foreground">{ui.estimatedTotal}</span>
            <span className="text-[22px] font-bold leading-none text-accent">€{estimate}</span>
          </div>
          <span className="text-[12px] leading-[1.4] text-muted">
            {ui.estimateBreakdown(count, perChild(count))}
          </span>
        </div>
      ) : null}

      {/* Honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      <p className="flex items-start gap-2 text-[13px] leading-[1.5] text-muted">
        <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        {ui.requestNote}
      </p>

      {error ? (
        <p className="rounded-[8px] bg-red-50 px-4 py-2.5 text-[14px] font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 rounded-[4px] bg-accent p-[14px] text-[16px] font-semibold text-white transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent"
      >
        {submitting ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            {ui.sending}
          </>
        ) : (
          bui.sendRequest
        )}
      </button>
    </form>
  )
}
