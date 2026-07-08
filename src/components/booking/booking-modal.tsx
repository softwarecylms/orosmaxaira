'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus, X, Check, Loader2, CalendarDays, Mail } from 'lucide-react'
import type { Activity, AvailabilitySlot } from '@/lib/medusa/activities'
import {
  createBooking,
  getMonthAvailability,
  type ConfirmedBooking,
} from '@/lib/medusa/booking-actions'
import { EASE, DURATION } from '@/lib/motion'
import { BookingCalendar } from './booking-calendar'

const MONTHS_GEN = [
  'Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου',
  'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου',
]

const isoOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function greekDate(ds?: string): string {
  if (!ds) return ''
  const [y, m, d] = ds.split('-').map(Number)
  return `${d} ${MONTHS_GEN[m - 1]} ${y}`
}

function money(amount: number, currency = 'eur'): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/**
 * Booking popup: calendar → time slot → number of people → contact → pay →
 * confirmation. Availability is loaded fresh on open; the total is a live
 * preview but the server recomputes it authoritatively. A per-submission
 * idempotency key guards against double-booking on double-click/refresh.
 */
export function BookingModal({
  activity,
  open,
  onClose,
}: {
  activity: Activity
  open: boolean
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  const currency = activity.currency ?? 'eur'
  const tiers = activity.price_tiers ?? []

  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [nonce, setNonce] = useState('')

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<ConfirmedBooking | null>(null)

  // Refs to auto-scroll each newly-revealed step into view.
  const timeRef = useRef<HTMLDivElement>(null)
  const peopleRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  // Load availability + reset when the modal opens.
  useEffect(() => {
    if (!open) return
    setSelectedDate(null)
    setSelectedSlotId(null)
    setCounts({})
    setName('')
    setEmail('')
    setPhone('')
    setSubmitError(null)
    setResult(null)
    setSubmitting(false)
    setNonce(
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Math.round(performance.now())),
    )
    setLoading(true)
    const today = new Date()
    const from = isoOf(today)
    const to = isoOf(new Date(today.getFullYear(), today.getMonth() + 6, today.getDate()))
    getMonthAvailability(activity.slug, from, to)
      .then(({ slots }) => setSlots(slots))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [open, activity.slug])

  // Esc + body-scroll lock.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const availableDates = useMemo(
    () => new Set(slots.filter((s) => s.remaining > 0).map((s) => s.date)),
    [slots],
  )
  const daySlots = useMemo(
    () =>
      slots
        .filter((s) => s.date === selectedDate && s.remaining > 0)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [slots, selectedDate],
  )
  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null
  const remaining = selectedSlot?.remaining ?? 0

  const seats = Object.values(counts).reduce((a, b) => a + b, 0)
  const total = tiers.reduce((sum, t) => sum + (counts[t.key] ?? 0) * t.price, 0)

  // Nudge each newly-revealed step into view so it's obvious more is below.
  const scrollTo = (el: HTMLElement | null) =>
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  useEffect(() => {
    if (selectedDate) scrollTo(timeRef.current)
  }, [selectedDate])
  useEffect(() => {
    if (selectedSlotId) scrollTo(peopleRef.current)
  }, [selectedSlotId])
  const hasPeople = seats >= 1
  useEffect(() => {
    if (hasPeople) scrollTo(contactRef.current)
  }, [hasPeople])

  const pickDate = (d: string) => {
    setSelectedDate(d)
    setSelectedSlotId(null)
    setCounts({})
    setSubmitError(null)
  }
  const pickSlot = (id: string) => {
    setSelectedSlotId(id)
    setCounts({})
    setSubmitError(null)
  }
  const setCount = (key: string, next: number) =>
    setCounts((c) => ({ ...c, [key]: Math.max(0, next) }))

  const canSubmit =
    !!selectedSlotId &&
    seats >= 1 &&
    seats <= remaining &&
    name.trim().length > 0 &&
    emailOk(email) &&
    !submitting

  const submit = async () => {
    if (!canSubmit || !selectedSlotId) return
    setSubmitting(true)
    setSubmitError(null)
    const res = await createBooking({
      slug: activity.slug,
      slot_id: selectedSlotId,
      customer: { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined },
      adults: counts['adult'] ?? 0,
      children: counts['child'] ?? 0,
      infants: counts['infant'] ?? 0,
      idempotency_key: `${nonce}-${selectedSlotId}-${counts['adult'] ?? 0}-${counts['child'] ?? 0}-${counts['infant'] ?? 0}`,
    })
    if (res.ok && res.booking.status === "confirmed") {
      setResult(res.booking)
    } else {
      setSubmitError(
        res.ok ? "Η κράτηση δεν ολοκληρώθηκε. Δοκιμάστε ξανά." : res.error,
      )
      // Availability may have changed (e.g. sold out) — refresh it and clear the
      // time/people selection so the UI can't show a slot that's now gone.
      const today = new Date()
      getMonthAvailability(
        activity.slug,
        isoOf(today),
        isoOf(new Date(today.getFullYear(), today.getMonth() + 6, today.getDate())),
      )
        .then(({ slots }) => setSlots(slots))
        .catch(() => {})
      setSelectedSlotId(null)
      setCounts({})
    }
    setSubmitting(false)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.button
            type="button"
            aria-label="Κλείσιμο"
            onClick={onClose}
            className="absolute inset-0 bg-foreground/50"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: DURATION.ui, ease: EASE.snap }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Κράτηση — ${activity.title}`}
            data-testid="booking-modal"
            className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_0_60px_-15px_rgba(35,31,32,0.5)] sm:max-w-[540px] sm:rounded-[22px]"
            variants={{
              hidden: { opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.98 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: DURATION.ui, ease: EASE.snap }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-[17px] font-semibold text-foreground">
                <CalendarDays className="size-5 text-accent" aria-hidden="true" />
                {result ? 'Επιβεβαίωση κράτησης' : 'Κράτηση'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Κλείσιμο"
                className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-offwhite hover:text-accent"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {result ? (
                <Confirmation booking={result} currency={currency} onClose={onClose} />
              ) : loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-muted">
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  Φόρτωση διαθεσιμότητας…
                </div>
              ) : availableDates.size === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <p className="text-[15px] text-muted">
                    Δεν υπάρχει διαθέσιμη ημερομηνία αυτή τη στιγμή.
                  </p>
                  <a
                    href="tel:+35799130092"
                    className="text-[15px] font-semibold text-accent hover:underline"
                  >
                    Καλέστε στο +357 99 130092
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <Step n={1} title="Επιλέξτε ημερομηνία">
                    <BookingCalendar
                      availableDates={availableDates}
                      selected={selectedDate}
                      onSelect={pickDate}
                    />
                  </Step>

                  {selectedDate ? (
                    <div ref={timeRef} className="scroll-mt-4">
                    <Step n={2} title="Επιλέξτε ώρα">
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => pickSlot(s.id)}
                            className={`rounded-[8px] border px-4 py-2.5 text-[15px] transition-colors ${
                              selectedSlotId === s.id
                                ? 'border-accent bg-accent text-white'
                                : 'border-border text-foreground hover:border-accent'
                            }`}
                          >
                            {s.start_time}
                            {s.end_time ? `–${s.end_time}` : ''}
                            <span
                              className={`ml-2 text-[12px] ${selectedSlotId === s.id ? 'text-white/80' : 'text-muted'}`}
                            >
                              {s.remaining} θέσεις
                            </span>
                          </button>
                        ))}
                      </div>
                    </Step>
                    </div>
                  ) : null}

                  {selectedSlotId ? (
                    <div ref={peopleRef} className="scroll-mt-4">
                    <Step n={3} title="Άτομα">
                      <div className="flex flex-col gap-3">
                        {tiers.map((t) => (
                          <div key={t.key} className="flex items-center justify-between gap-3">
                            <div className="flex flex-col">
                              <span className="text-[15px] text-foreground">{t.label}</span>
                              <span className="text-[13px] text-muted">
                                {t.price === 0 ? (t.note ?? 'Δωρεάν') : money(t.price, currency)}
                              </span>
                            </div>
                            <Stepper
                              value={counts[t.key] ?? 0}
                              onDec={() => setCount(t.key, (counts[t.key] ?? 0) - 1)}
                              onInc={() => setCount(t.key, (counts[t.key] ?? 0) + 1)}
                              canInc={seats < remaining}
                            />
                          </div>
                        ))}
                        <p className="text-[12.5px] text-muted">
                          Διαθέσιμες θέσεις: {Math.max(0, remaining - seats)} από {remaining}
                        </p>
                      </div>
                    </Step>
                    </div>
                  ) : null}

                  {seats >= 1 ? (
                    <div ref={contactRef} className="scroll-mt-4">
                    <Step n={4} title="Στοιχεία επικοινωνίας">
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ονοματεπώνυμο"
                          aria-label="Ονοματεπώνυμο"
                          className={fieldCls}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                          aria-label="Email"
                          className={fieldCls}
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Τηλέφωνο (προαιρετικό)"
                          aria-label="Τηλέφωνο"
                          className={fieldCls}
                        />
                      </div>
                    </Step>
                    </div>
                  ) : null}

                  {submitError ? (
                    <p className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-700">
                      {submitError}
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            {/* Footer */}
            {!result && !loading && availableDates.size > 0 ? (
              <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
                <div className="flex flex-col">
                  <span className="text-[12px] text-muted">Σύνολο</span>
                  <span className="text-[20px] font-bold text-foreground">
                    {money(total, currency)}
                    {seats > 0 ? (
                      <span className="ml-1.5 text-[13px] font-normal text-muted">
                        ({seats} {seats === 1 ? 'άτομο' : 'άτομα'})
                      </span>
                    ) : null}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit}
                  className="flex items-center justify-center gap-2 rounded-[4px] bg-accent px-6 py-[14px] text-[16px] font-semibold text-white transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                      Επεξεργασία…
                    </>
                  ) : total > 0 ? (
                    'Πληρωμή & Κράτηση'
                  ) : (
                    'Ολοκλήρωση κράτησης'
                  )}
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

const fieldCls =
  'w-full rounded-[8px] border border-border bg-white px-4 py-2.5 text-[15px] text-foreground outline-none transition focus:border-accent'

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
        <span className="flex size-6 items-center justify-center rounded-full bg-accent/12 text-[13px] font-bold text-gold-strong">
          {n}
        </span>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Stepper({
  value,
  onDec,
  onInc,
  canInc,
}: {
  value: number
  onDec: () => void
  onInc: () => void
  canInc: boolean
}) {
  return (
    <div className="flex items-center rounded-[8px] border border-border">
      <button
        type="button"
        onClick={onDec}
        disabled={value <= 0}
        aria-label="Μείωση"
        className="flex size-9 items-center justify-center text-foreground transition-colors hover:text-accent disabled:opacity-30"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-9 text-center text-[15px] font-semibold text-foreground">{value}</span>
      <button
        type="button"
        onClick={onInc}
        disabled={!canInc}
        aria-label="Αύξηση"
        className="flex size-9 items-center justify-center text-foreground transition-colors hover:text-accent disabled:opacity-30"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

function Confirmation({
  booking,
  currency,
  onClose,
}: {
  booking: ConfirmedBooking
  currency: string
  onClose: () => void
}) {
  const people = [
    booking.adults ? `${booking.adults} ενήλικες` : '',
    booking.children ? `${booking.children} παιδιά` : '',
    booking.infants ? `${booking.infants} βρέφη` : '',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
        <Check className="size-7" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <h3 className="font-display text-[24px] font-bold text-foreground">
        Η κράτησή σας επιβεβαιώθηκε! 🐝
      </h3>
      <p className="text-[14px] text-muted">
        Κωδικός κράτησης:{' '}
        <span className="font-semibold text-foreground">{booking.reference}</span>
      </p>

      <dl className="mt-1 w-full divide-y divide-border rounded-[14px] bg-offwhite px-4 text-left text-[14px]">
        <Row label="Δραστηριότητα" value={booking.activity_title ?? ''} />
        <Row label="Ημερομηνία" value={greekDate(booking.date)} />
        <Row label="Ώρα" value={booking.start_time ?? ''} />
        {people ? <Row label="Άτομα" value={people} /> : null}
        <Row label="Σύνολο" value={money(booking.total_amount, currency)} />
      </dl>

      <p className="flex items-center gap-2 text-[13px] text-muted">
        <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
        Στείλαμε email επιβεβαίωσης στο {booking.email}.
      </p>

      <button
        type="button"
        onClick={onClose}
        className="mt-1 rounded-[4px] bg-accent px-6 py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-foreground"
      >
        Κλείσιμο
      </button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  )
}
