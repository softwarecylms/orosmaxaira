'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus, X, Check, Clock, Info, Loader2, CalendarDays, Mail } from 'lucide-react'
import type {
  Activity,
  ActivityProgram,
  AvailabilitySlot,
  PriceTier,
} from '@/lib/medusa/activities'
import { comboAgeTiers, tierPrice } from '@/lib/pricing'
import {
  confirmBookingPayment,
  createBooking,
  createWorkshopBooking,
  getActivityProgramsAction,
  getMonthAvailability,
  releaseBookingHold,
  type ConfirmedBooking,
  type ConfirmedWorkshopBooking,
} from '@/lib/medusa/booking-actions'
import { stripeConfigured } from '@/components/shop/checkout/stripe-elements'
import { EASE, DURATION } from '@/lib/motion'
import { BookingCalendar } from './booking-calendar'
import { BookingPaymentStep, type PendingPayment } from './booking-payment'
import {
  BOOKING_CATEGORY,
  bookingItems,
  trackBeginCheckout,
  trackPurchase,
} from '@/lib/analytics'
import { getBookingUi } from './booking-ui'

const isoOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** True when a `YYYY-MM-DD` date is a Saturday/Sunday (timezone-safe). */
function isWeekendDate(ds?: string | null): boolean {
  if (!ds) return false
  const [y, m, d] = ds.split('-').map(Number)
  const wd = new Date(y, (m ?? 1) - 1, d ?? 1).getDay()
  return wd === 0 || wd === 6
}

function money(amount: number, currency = 'eur', priceLocale = 'el-GR'): string {
  return new Intl.NumberFormat(priceLocale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/** The booking window: availability starts today and runs six months ahead. */
function bookingWindow(): [string, string] {
  const today = new Date()
  return [isoOf(today), isoOf(new Date(today.getFullYear(), today.getMonth() + 6, today.getDate()))]
}

/** A confirmed activity booking, or a programme booked through its workshop. */
type AnyBooking = ConfirmedBooking & Partial<ConfirmedWorkshopBooking>

/** 'single' = the activity on its own; 'program' = one of its workshop programmes. */
type Mode = 'single' | 'program'

/** A programme slot, tagged with the programme (index) it belongs to. */
type ProgramSlot = AvailabilitySlot & { program: number }

type PeopleTier = { key: string; label: string; price: number; note?: string }

/** Shortened age label for the option summaries: "Ενήλικες (12+ ετών)" → "Ενήλικες". */
const shortLabel = (label: string) => label.replace(/\s*\(.*\)/, '')

/**
 * Booking popup: (programme) → calendar → time slot → number of people →
 * contact → pay → confirmation. Availability is loaded fresh on open; the total
 * is a live preview but the server recomputes it authoritatively. A
 * per-submission idempotency key guards against double-booking on
 * double-click/refresh.
 *
 * An activity with workshop programmes (e.g. Περιπέτειες στις Κυψέλες →
 * «Πλήρες πρόγραμμα» with the month's εργαστήρι) first asks which to book. A
 * programme's dates, times and prices come from its workshop, and it is booked
 * through the workshop's own endpoint.
 */
export function BookingModal({
  activity,
  programs: initialPrograms = [],
  open,
  onClose,
}: {
  activity: Activity
  /** Server-loaded programmes, refreshed whenever the modal opens. */
  programs?: ActivityProgram[]
  open: boolean
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  const locale = useLocale()
  const ui = getBookingUi(locale)
  const tiers = activity.price_tiers ?? []

  // Portal to <body> so the fixed overlay escapes any ancestor stacking context
  // (e.g. the sticky header) and truly sits on top. Mounted guard keeps SSR safe.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [programs, setPrograms] = useState<ActivityProgram[]>(initialPrograms)
  const [nonce, setNonce] = useState('')

  const [mode, setMode] = useState<Mode | null>(null)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<AnyBooking | null>(null)

  // A card payment in progress — the server holds the seats until it is paid,
  // released (Back / close), or swept once the hold expires.
  const [pending, setPending] = useState<PendingPayment | null>(null)
  // The Esc listener calls whatever `close` is current; keeping it in a ref
  // means the scroll-lock effect never re-runs (re-running would record
  // 'hidden' as the "previous" overflow and leave the page unscrollable).
  const closeRef = useRef<() => void>(onClose)

  // Refs to auto-scroll each newly-revealed step into view.
  const dateRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const peopleRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  // Load availability + reset when the modal opens.
  useEffect(() => {
    if (!open) return
    setMode(null)
    setSelectedDate(null)
    setSelectedSlotId(null)
    setCounts({})
    setName('')
    setEmail('')
    setPhone('')
    setSubmitError(null)
    setResult(null)
    setPending(null)
    setSubmitting(false)
    setNonce(
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Math.round(performance.now())),
    )
    setLoading(true)
    const [from, to] = bookingWindow()
    Promise.all([
      getMonthAvailability(activity.slug, from, to)
        .then(({ slots }) => setSlots(slots))
        .catch(() => setSlots([])),
      activity.combo_program_key
        ? getActivityProgramsAction(activity.slug, from, to, locale)
            .then(setPrograms)
            .catch(() => setPrograms([]))
        : null,
    ]).finally(() => setLoading(false))
  }, [open, activity.slug, activity.combo_program_key, locale])

  // Esc + body-scroll lock.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const singleSlots = useMemo(() => slots.filter((s) => s.remaining > 0), [slots])
  const programSlots = useMemo<ProgramSlot[]>(
    () =>
      programs.flatMap((p, program) =>
        p.slots.filter((s) => s.remaining > 0).map((s) => ({ ...s, program })),
      ),
    [programs],
  )
  const hasPrograms = programSlots.length > 0
  // Without programmes there is nothing to choose: straight to the calendar.
  const activeMode: Mode | null = hasPrograms ? mode : 'single'
  const activeSlots: (AvailabilitySlot & { program?: number })[] =
    activeMode === 'program' ? programSlots : activeMode === 'single' ? singleSlots : []

  const availableDates = useMemo(
    () => new Set(activeSlots.map((s) => s.date)),
    [activeSlots],
  )
  const daySlots = activeSlots
    .filter((s) => s.date === selectedDate)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
  const selectedSlot = activeSlots.find((s) => s.id === selectedSlotId) ?? null
  const remaining = selectedSlot?.remaining ?? 0
  // The programme (workshop) behind the chosen date — each month has its own.
  const programIndex = selectedSlot?.program ?? daySlots[0]?.program
  const program = activeMode === 'program' && programIndex != null ? programs[programIndex] : null
  const currency = program?.workshop.currency ?? activity.currency ?? 'eur'

  const seats = Object.values(counts).reduce((a, b) => a + b, 0)
  // Weekend (Sat/Sun) dates use each tier's `weekend_price` when set — mirrors
  // the server's authoritative calculation in the bookings route (via the shared
  // `tierPrice` helper, so the preview can never diverge from what's charged).
  const weekendSelected = isWeekendDate(selectedDate)
  const priceOf = (t: PriceTier) => tierPrice(t, weekendSelected)
  // A programme is priced per age by its workshop combo.
  const peopleTiers: PeopleTier[] = program
    ? comboAgeTiers(program.tier, locale)
    : tiers.map((t) => ({ key: t.key, label: t.label, price: priceOf(t), note: t.note }))
  const total = peopleTiers.reduce((sum, t) => sum + (counts[t.key] ?? 0) * t.price, 0)

  // Nudge each newly-revealed step into view so it's obvious more is below.
  const scrollTo = (el: HTMLElement | null) =>
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  useEffect(() => {
    if (mode) scrollTo(dateRef.current)
  }, [mode])
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

  const pickMode = (m: Mode) => {
    setMode(m)
    setSelectedDate(null)
    setSelectedSlotId(null)
    setCounts({})
    setSubmitError(null)
  }
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
    !!activeMode &&
    !!selectedSlotId &&
    seats >= 1 &&
    seats <= remaining &&
    name.trim().length > 0 &&
    emailOk(email) &&
    !submitting

  const reloadAvailability = () => {
    const [from, to] = bookingWindow()
    getMonthAvailability(activity.slug, from, to)
      .then(({ slots }) => setSlots(slots))
      .catch(() => {})
    if (activity.combo_program_key) {
      getActivityProgramsAction(activity.slug, from, to, locale)
        .then(setPrograms)
        .catch(() => {})
    }
  }

  // Google Analytics: the people and prices on this booking, one item per tier.
  const analyticsItems = () =>
    bookingItems(
      program
        ? {
            id: program.workshop.slug,
            name: `${program.workshop.title} — ${program.tier.label}`,
            category: BOOKING_CATEGORY.workshop,
          }
        : { id: activity.slug, name: activity.title, category: BOOKING_CATEGORY.activity },
      peopleTiers.map((t) => ({ key: t.key, label: t.label, price: t.price })),
      counts,
    )

  const trackConfirmed = (booking: AnyBooking) =>
    trackPurchase({
      transactionId: booking.reference,
      items: analyticsItems(),
      value: booking.total_amount,
      currency: booking.currency,
    })

  const submit = async () => {
    if (!canSubmit || !selectedSlotId) return
    trackBeginCheckout(analyticsItems(), total, { currency })
    setSubmitting(true)
    setSubmitError(null)
    const key = `${nonce}-${selectedSlotId}-${counts['adult'] ?? 0}-${counts['child'] ?? 0}-${counts['infant'] ?? 0}`
    const booking = {
      slot_id: selectedSlotId,
      customer: { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined },
      adults: counts['adult'] ?? 0,
      children: counts['child'] ?? 0,
      infants: counts['infant'] ?? 0,
      idempotency_key: key,
      locale,
    }
    const res: Awaited<ReturnType<typeof createBooking>> = program
      ? await createWorkshopBooking({
          ...booking,
          slug: program.workshop.slug,
          combo_key: program.tier.key,
        })
      : await createBooking({ ...booking, slug: activity.slug })
    if (res.ok && res.booking.status === 'confirmed') {
      // Free (€0), or no card provider on the backend: done in one step.
      setResult(res.booking)
      trackConfirmed(res.booking)
    } else if (res.ok && res.booking.status === 'pending' && res.payment) {
      // The seats are now held — on to the payment step.
      if (stripeConfigured) {
        setPending({
          clientSecret: res.payment.client_secret,
          reference: res.booking.reference,
          key,
          holdMinutes: res.payment.hold_minutes,
          total: res.booking.total_amount,
        })
      } else {
        // The server wants a card but this build has no publishable key to
        // render one — give the seats straight back instead of holding them.
        void releaseBookingHold({ reference: res.booking.reference, idempotency_key: key })
        setSubmitError(ui.cardUnavailable)
      }
    } else {
      setSubmitError(res.ok ? ui.bookingFailed : res.error)
      // Availability may have changed (e.g. sold out) — refresh it and clear the
      // time/people selection so the UI can't show a slot that's now gone.
      reloadAvailability()
      setSelectedSlotId(null)
      setCounts({})
    }
    setSubmitting(false)
  }

  /** Stripe reports the card paid — let the server confirm it. Resolves to an
   *  error to show, or null once the booking is confirmed. */
  const onPaid = async (): Promise<string | null> => {
    if (!pending) return null
    const r = await confirmBookingPayment({
      reference: pending.reference,
      idempotency_key: pending.key,
    })
    if (r.ok) {
      setPending(null)
      setResult(r.booking)
      trackConfirmed(r.booking)
      return null
    }
    // The card went through; only the confirmation call failed. The server
    // settles paid holds by itself, so the customer must not pay twice.
    return ui.paidPendingConfirmation(pending.reference)
  }

  /** Give held seats back now rather than making others wait out the hold. */
  const releasePending = () => {
    if (!pending) return
    void releaseBookingHold({ reference: pending.reference, idempotency_key: pending.key })
    setPending(null)
  }

  const backToDetails = () => {
    releasePending()
    reloadAvailability()
  }

  // Every way out — Esc, the backdrop, ✕ — releases the hold. If the card had in
  // fact been paid, the server cannot cancel the intent and confirms instead.
  const close = () => {
    releasePending()
    onClose()
  }
  useEffect(() => {
    closeRef.current = close
  })

  // Step numbers shift by one when the programme choice comes first.
  const step = hasPrograms ? 1 : 0

  const overlay = (
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
            aria-label={ui.close}
            onClick={close}
            className="absolute inset-0 bg-foreground/50"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: DURATION.ui, ease: EASE.snap }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${ui.bookingTitle} — ${activity.title}`}
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
                {result ? ui.confirmTitle : pending ? ui.paymentTitle : ui.bookingTitle}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label={ui.close}
                className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-offwhite hover:text-accent"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {result ? (
                <Confirmation booking={result} currency={currency} onClose={onClose} />
              ) : pending ? (
                <BookingPaymentStep
                  payment={pending}
                  amountLabel={money(pending.total, currency, ui.priceLocale)}
                  onPaid={onPaid}
                  onBack={backToDetails}
                />
              ) : loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-muted">
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  {ui.loadingAvailability}
                </div>
              ) : singleSlots.length === 0 && !hasPrograms ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <p className="text-[15px] text-muted">{ui.noDatesAvailable}</p>
                  <a
                    href="tel:+35799130092"
                    className="text-[15px] font-semibold text-accent hover:underline"
                  >
                    {ui.callAt('+357 99 130 092')}
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {hasPrograms ? (
                    <Step n={1} title={ui.stepProgram}>
                      <ProgramChoice
                        activity={activity}
                        programs={programs}
                        mode={mode}
                        singleAvailable={singleSlots.length > 0}
                        priceLabel={(amount, note) =>
                          amount === 0 ? (note ?? ui.free) : money(amount, currency, ui.priceLocale)
                        }
                        onPick={pickMode}
                      />
                    </Step>
                  ) : null}

                  {activeMode ? (
                    <div ref={dateRef} className="scroll-mt-4">
                    <Step n={step + 1} title={ui.stepDate}>
                      <BookingCalendar
                        availableDates={availableDates}
                        selected={selectedDate}
                        onSelect={pickDate}
                      />
                    </Step>
                    </div>
                  ) : null}

                  {selectedDate ? (
                    <div ref={timeRef} className="scroll-mt-4">
                    <Step n={step + 2} title={ui.stepTime}>
                      {program ? (
                        <p className="mb-1 rounded-[10px] bg-cream px-3.5 py-2.5 text-[13px] leading-snug text-foreground">
                          <span className="font-semibold">{program.tier.label}</span>
                          {program.tier.long_label ? ` — ${program.tier.long_label}` : ''}
                        </p>
                      ) : null}
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
                              {s.remaining} {ui.seatsLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                    </Step>
                    </div>
                  ) : null}

                  {selectedSlotId ? (
                    <div ref={peopleRef} className="scroll-mt-4">
                    <Step n={step + 3} title={ui.stepPeople}>
                      <div className="flex flex-col gap-3">
                        {peopleTiers.map((t) => (
                          <div key={t.key} className="flex items-center justify-between gap-3">
                            <div className="flex flex-col">
                              <span className="text-[15px] text-foreground">{t.label}</span>
                              <span className="text-[13px] text-muted">
                                {t.price === 0 ? (t.note ?? ui.free) : money(t.price, currency, ui.priceLocale)}
                              </span>
                            </div>
                            <Stepper
                              value={counts[t.key] ?? 0}
                              onDec={() => setCount(t.key, (counts[t.key] ?? 0) - 1)}
                              onInc={() => setCount(t.key, (counts[t.key] ?? 0) + 1)}
                              canInc={seats < remaining}
                              decLabel={ui.decrease}
                              incLabel={ui.increase}
                            />
                          </div>
                        ))}
                        <p className="text-[12.5px] text-muted">
                          {ui.seatsAvailable(Math.max(0, remaining - seats), remaining)}
                        </p>
                      </div>
                    </Step>
                    </div>
                  ) : null}

                  {seats >= 1 ? (
                    <div ref={contactRef} className="scroll-mt-4">
                    <Step n={step + 4} title={ui.stepContact}>
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={ui.fullName}
                          aria-label={ui.fullName}
                          className={fieldCls}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={ui.email}
                          aria-label={ui.email}
                          className={fieldCls}
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={ui.phoneOptional}
                          aria-label={ui.phone}
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
            {!result && !pending && !loading && (singleSlots.length > 0 || hasPrograms) ? (
              <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
                <div className="flex flex-col">
                  <span className="text-[12px] text-muted">{ui.totalLabel}</span>
                  <span className="text-[20px] font-bold text-foreground">
                    {money(total, currency, ui.priceLocale)}
                    {seats > 0 ? (
                      <span className="ml-1.5 text-[13px] font-normal text-muted">
                        ({seats} {seats === 1 ? ui.person : ui.people})
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
                      {ui.processing}
                    </>
                  ) : total > 0 && stripeConfigured ? (
                    ui.continueToPayment
                  ) : (
                    ui.completeBooking
                  )}
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return mounted ? createPortal(overlay, document.body) : null
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
  decLabel,
  incLabel,
}: {
  value: number
  onDec: () => void
  onInc: () => void
  canInc: boolean
  decLabel: string
  incLabel: string
}) {
  return (
    <div className="flex items-center rounded-[8px] border border-border">
      <button
        type="button"
        onClick={onDec}
        disabled={value <= 0}
        aria-label={decLabel}
        className="flex size-9 items-center justify-center text-foreground transition-colors hover:text-accent disabled:opacity-30"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-9 text-center text-[15px] font-semibold text-foreground">{value}</span>
      <button
        type="button"
        onClick={onInc}
        disabled={!canInc}
        aria-label={incLabel}
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
  booking: AnyBooking
  currency: string
  onClose: () => void
}) {
  const ui = getBookingUi(useLocale())
  const people = [
    booking.adults ? ui.adults(booking.adults) : '',
    booking.children ? ui.children(booking.children) : '',
    booking.infants ? ui.infants(booking.infants) : '',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
        <Check className="size-7" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <h3 className="font-display text-[24px] font-bold text-foreground">{ui.bookingConfirmed}</h3>
      <p className="text-[14px] text-muted">
        {ui.bookingRef}{' '}
        <span className="font-semibold text-foreground">{booking.reference}</span>
      </p>

      <dl className="mt-1 w-full divide-y divide-border rounded-[14px] bg-offwhite px-4 text-left text-[14px]">
        {booking.workshop_title ? (
          <Row label={ui.fWorkshop} value={booking.workshop_title} />
        ) : (
          <Row label={ui.fActivity} value={booking.activity_title ?? ''} />
        )}
        {booking.combo_label ? <Row label={ui.fProgram} value={booking.combo_label} /> : null}
        <Row label={ui.fDate} value={ui.formatDate(booking.date ?? '')} />
        <Row label={ui.fTime} value={booking.start_time ?? ''} />
        {people ? <Row label={ui.fPeople} value={people} /> : null}
        <Row label={ui.fTotal} value={money(booking.total_amount, currency, ui.priceLocale)} />
      </dl>

      {booking.confirmation_note ? <ConfirmationNote note={booking.confirmation_note} /> : null}

      <p className="flex items-center gap-2 text-[13px] text-muted">
        <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
        {ui.emailSentTo(booking.email)}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="mt-1 rounded-[4px] bg-accent px-6 py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-foreground"
      >
        {ui.close}
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

/** The practical info the farm attaches to a booking ("arrive 5 minutes early…"). */
export function ConfirmationNote({ note }: { note: string }) {
  return (
    <p className="flex w-full items-start gap-2.5 rounded-[12px] bg-cream px-4 py-3 text-left text-[14px] leading-[1.5] text-foreground">
      <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
      <span className="whitespace-pre-line">{note}</span>
    </p>
  )
}

/**
 * The first step for an activity with workshop programmes: the activity on its
 * own, or the programme. The programme lists each month's workshop and times,
 * since the workshop — and so the date — decides which one is booked.
 */
function ProgramChoice({
  activity,
  programs,
  mode,
  singleAvailable,
  priceLabel,
  onPick,
}: {
  activity: Activity
  programs: ActivityProgram[]
  mode: Mode | null
  singleAvailable: boolean
  priceLabel: (amount: number, note?: string) => string
  onPick: (mode: Mode) => void
}) {
  const locale = useLocale()
  const ui = getBookingUi(locale)
  const lead = programs[0]
  const option = (active: boolean, disabled: boolean) =>
    `flex flex-col gap-1.5 rounded-[10px] border px-4 py-3 text-left transition ${
      active ? 'border-accent bg-accent/10' : 'border-border hover:border-accent'
    } ${disabled ? 'cursor-not-allowed opacity-45' : ''}`

  // "Σεπτέμβριος" / "Οκτώβριος – Νοέμβριος" from the programme's open dates.
  const months = (p: ActivityProgram) =>
    [...new Set(p.slots.map((s) => Number(s.date.slice(5, 7))))]
      .map((m) => ui.monthsNom[m - 1])
      .join(' – ')
  const times = (p: ActivityProgram) => {
    const t = p.tier.start_time ?? p.slots[0]?.start_time
    const end = p.tier.end_time ?? p.slots[0]?.end_time
    return t ? `${t}${end ? `–${end}` : ''}` : ''
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={!singleAvailable}
        onClick={() => onPick('single')}
        className={option(mode === 'single', !singleAvailable)}
        data-testid="program-single"
      >
        <span className="text-[15px] font-semibold text-foreground">{activity.title}</span>
        <span className="text-[12.5px] leading-snug text-muted">
          {ui.singleOption}
          {singleAvailable ? '' : ` · ${ui.unavailableShort}`}
        </span>
        <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] text-muted">
          {(activity.price_tiers ?? []).map((t) => (
            <span key={t.key}>
              {shortLabel(t.label)}:{' '}
              <span className="font-semibold text-accent">
                {priceLabel(tierPrice(t, false), t.note)}
              </span>
            </span>
          ))}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onPick('program')}
        className={option(mode === 'program', false)}
        data-testid="program-combo"
      >
        <span className="text-[15px] font-semibold text-foreground">{lead.tier.label}</span>
        <span className="text-[12.5px] leading-snug text-muted">{ui.programMonthly}</span>
        <ul className="flex flex-col gap-1">
          {programs.map((p) => (
            <li key={p.workshop.slug} className="text-[12.5px] leading-snug text-foreground">
              <span className="font-semibold">{months(p)}</span>
              {': '}
              {p.tier.long_label ?? p.workshop.title}
              {times(p) ? (
                <span className="ml-1.5 inline-flex items-center gap-1 whitespace-nowrap text-muted">
                  <Clock className="size-3" aria-hidden="true" />
                  {times(p)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] text-muted">
          {comboAgeTiers(lead.tier, locale).map((t) => (
            <span key={t.key}>
              {shortLabel(t.label)}:{' '}
              <span className="font-semibold text-accent">{priceLabel(t.price)}</span>
            </span>
          ))}
        </span>
      </button>
    </div>
  )
}
