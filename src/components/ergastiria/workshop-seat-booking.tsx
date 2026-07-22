'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CalendarCheck,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  Mail,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react'
import type { PriceTier } from '@/lib/medusa/activities'
import { comboAgeTiers, type AgeTier } from '@/lib/pricing'
import {
  createWorkshopBooking,
  getWorkshopMonthAvailability,
  type ConfirmedWorkshopBooking,
} from '@/lib/medusa/booking-actions'
import { EASE, DURATION } from '@/lib/motion'
import { BookingCalendar } from '../booking/booking-calendar'

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

const fieldCls =
  'w-full rounded-[8px] border border-border bg-white px-4 py-2.5 text-[15px] text-foreground outline-none transition focus:border-accent'

/**
 * Seat booking for a seasonal workshop. Each workshop is offered as two priced
 * experience combos — «Μισό πρόγραμμα» and «Πλήρες πρόγραμμα» — that run at
 * different times, so the flow is: pick a combo → date → time → people by age →
 * pay. The combo is fixed by the chosen slot (`combo_key`); the server recomputes
 * the total authoritatively. Used by workshops that have availability; workshops
 * without slots fall back to the enquiry form instead.
 */
export function WorkshopSeatBooking({
  slug,
  workshopTitle,
  combos,
  currency = 'eur',
}: {
  slug: string
  workshopTitle: string
  combos: PriceTier[]
  currency?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-5 rounded-[20px] border border-border-strong/15 bg-white p-6 shadow-card md:p-7">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-gold-strong">
            Επιλογές & κόστος
          </span>
          <ul className="flex flex-col gap-3">
            {combos.map((c) => (
              <li key={c.key} className="flex flex-col gap-1.5 rounded-[12px] bg-cream/60 p-3">
                <span className="text-[14.5px] font-semibold leading-snug text-foreground">
                  {c.label}
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] text-muted">
                  {comboAgeTiers(c).map((t) => (
                    <span key={t.key}>
                      {t.label.replace(/\s*\(.*\)/, '')}:{' '}
                      <span className="font-semibold text-accent">
                        {t.price === 0 ? (t.note ?? 'Δωρεάν') : money(t.price, currency)}
                      </span>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-accent p-[15px] text-[16px] font-semibold uppercase tracking-[0.02em] text-white transition-colors hover:bg-foreground"
        >
          <CalendarCheck className="size-5" aria-hidden="true" />
          Κλείστε online
        </button>

        <p className="flex items-center gap-2 text-[12.5px] text-muted">
          <ShieldCheck className="size-4 shrink-0 text-gold-strong" aria-hidden="true" />
          Άμεση επιβεβαίωση & email απόδειξης. Ακύρωση έως 72 ώρες πριν.
        </p>

        <div className="flex items-center gap-3 rounded-[14px] bg-cream p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-accent">
            <Phone className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] text-muted">Έχετε απορίες;</span>
            <a
              href="tel:+35725622305"
              className="text-[15px] font-semibold text-foreground transition-colors hover:text-accent"
            >
              +357 25622305
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-border pt-4 text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            Μια εμπειρία του
          </span>
          <Image
            src="/images/activities/bee-academy-logo.png"
            alt="Bee Academy"
            width={180}
            height={48}
            className="h-10 w-auto"
          />
        </div>
      </div>

      <WorkshopBookingModal
        slug={slug}
        workshopTitle={workshopTitle}
        combos={combos}
        currency={currency}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

function WorkshopBookingModal({
  slug,
  workshopTitle,
  combos,
  currency,
  open,
  onClose,
}: {
  slug: string
  workshopTitle: string
  combos: PriceTier[]
  currency: string
  open: boolean
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<
    { id: string; date: string; start_time: string; end_time?: string | null; remaining: number; combo_key?: string | null }[]
  >([])
  const [nonce, setNonce] = useState('')

  const [comboKey, setComboKey] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<ConfirmedWorkshopBooking | null>(null)

  const dateRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const peopleRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  // Load availability + reset when the modal opens.
  useEffect(() => {
    if (!open) return
    setComboKey('')
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
    const to = isoOf(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()))
    getWorkshopMonthAvailability(slug, from, to)
      .then(({ slots }) => setSlots(slots))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [open, slug])

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

  const combo = combos.find((c) => c.key === comboKey) ?? null
  const ageTiers: AgeTier[] = useMemo(() => (combo ? comboAgeTiers(combo) : []), [combo])

  // Which combos actually have upcoming availability.
  const comboHasSlots = useMemo(() => {
    const set = new Set(slots.filter((s) => s.remaining > 0).map((s) => s.combo_key))
    return (key: string) => set.has(key)
  }, [slots])

  const comboSlots = useMemo(
    () => slots.filter((s) => s.combo_key === comboKey && s.remaining > 0),
    [slots, comboKey],
  )
  const availableDates = useMemo(
    () => new Set(comboSlots.map((s) => s.date)),
    [comboSlots],
  )
  const daySlots = useMemo(
    () =>
      comboSlots
        .filter((s) => s.date === selectedDate)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [comboSlots, selectedDate],
  )
  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null
  const remaining = selectedSlot?.remaining ?? 0

  const seats = Object.values(counts).reduce((a, b) => a + b, 0)
  const total = ageTiers.reduce((sum, t) => sum + (counts[t.key] ?? 0) * t.price, 0)

  const scrollTo = (el: HTMLElement | null) =>
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  useEffect(() => {
    if (comboKey) scrollTo(dateRef.current)
  }, [comboKey])
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

  const pickCombo = (key: string) => {
    setComboKey(key)
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
    !!comboKey &&
    !!selectedSlotId &&
    seats >= 1 &&
    seats <= remaining &&
    name.trim().length > 0 &&
    emailOk(email) &&
    !submitting

  const reloadAvailability = () => {
    const today = new Date()
    getWorkshopMonthAvailability(
      slug,
      isoOf(today),
      isoOf(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())),
    )
      .then(({ slots }) => setSlots(slots))
      .catch(() => {})
  }

  const submit = async () => {
    if (!canSubmit || !selectedSlotId) return
    setSubmitting(true)
    setSubmitError(null)
    const res = await createWorkshopBooking({
      slug,
      slot_id: selectedSlotId,
      combo_key: comboKey,
      customer: { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined },
      adults: counts['adult'] ?? 0,
      children: counts['child'] ?? 0,
      infants: counts['infant'] ?? 0,
      idempotency_key: `${nonce}-${selectedSlotId}-${counts['adult'] ?? 0}-${counts['child'] ?? 0}-${counts['infant'] ?? 0}`,
    })
    if (res.ok && res.booking.status === 'confirmed') {
      setResult(res.booking)
    } else {
      setSubmitError(res.ok ? 'Η κράτηση δεν ολοκληρώθηκε. Δοκιμάστε ξανά.' : res.error)
      reloadAvailability()
      setSelectedSlotId(null)
      setCounts({})
    }
    setSubmitting(false)
  }

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
            aria-label="Κλείσιμο"
            onClick={onClose}
            className="absolute inset-0 bg-foreground/50"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: DURATION.ui, ease: EASE.snap }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Κράτηση — ${workshopTitle}`}
            data-testid="workshop-booking-modal"
            className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_0_60px_-15px_rgba(35,31,32,0.5)] sm:max-w-[540px] sm:rounded-[22px]"
            variants={{
              hidden: { opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.98 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: DURATION.ui, ease: EASE.snap }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-[17px] font-semibold text-foreground">
                <CalendarDays className="size-5 text-accent" aria-hidden="true" />
                {result ? 'Επιβεβαίωση κράτησης' : 'Κράτηση εργαστηρίου'}
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

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {result ? (
                <Confirmation booking={result} currency={currency} onClose={onClose} />
              ) : loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-muted">
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  Φόρτωση διαθεσιμότητας…
                </div>
              ) : slots.filter((s) => s.remaining > 0).length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <p className="text-[15px] text-muted">
                    Δεν υπάρχει διαθέσιμη ημερομηνία αυτή τη στιγμή.
                  </p>
                  <a href="tel:+35725622305" className="text-[15px] font-semibold text-accent hover:underline">
                    Καλέστε στο +357 25622305
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <Step n={1} title="Επιλέξτε πρόγραμμα">
                    <div className="flex flex-col gap-2">
                      {combos.map((c) => {
                        const active = comboKey === c.key
                        const disabled = !comboHasSlots(c.key)
                        return (
                          <button
                            key={c.key}
                            type="button"
                            disabled={disabled}
                            onClick={() => pickCombo(c.key)}
                            className={`flex flex-col gap-1 rounded-[10px] border px-4 py-3 text-left transition ${
                              active
                                ? 'border-accent bg-accent/10'
                                : 'border-border hover:border-accent'
                            } ${disabled ? 'cursor-not-allowed opacity-45' : ''}`}
                          >
                            <span className="text-[15px] font-semibold text-foreground">{c.label}</span>
                            {c.long_label ? (
                              <span className="text-[12.5px] leading-snug text-muted">{c.long_label}</span>
                            ) : null}
                            {c.start_time ? (
                              <span className="flex items-center gap-1.5 text-[12px] text-muted">
                                <Clock className="size-3.5" aria-hidden="true" />
                                {c.start_time}
                                {c.end_time ? `–${c.end_time}` : ''}
                                {disabled ? ' · χωρίς διαθέσιμες ημερομηνίες' : ''}
                              </span>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  </Step>

                  {comboKey ? (
                    <div ref={dateRef} className="scroll-mt-4">
                      <Step n={2} title="Επιλέξτε ημερομηνία">
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
                      <Step n={3} title="Επιλέξτε ώρα">
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
                      <Step n={4} title="Άτομα">
                        <div className="flex flex-col gap-3">
                          {ageTiers.map((t) => (
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
                      <Step n={5} title="Στοιχεία επικοινωνίας">
                        <div className="flex flex-col gap-3">
                          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ονοματεπώνυμο" aria-label="Ονοματεπώνυμο" className={fieldCls} />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" className={fieldCls} />
                          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Τηλέφωνο (προαιρετικό)" aria-label="Τηλέφωνο" className={fieldCls} />
                        </div>
                      </Step>
                    </div>
                  ) : null}

                  {submitError ? (
                    <p className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-700">{submitError}</p>
                  ) : null}
                </div>
              )}
            </div>

            {!result && !loading && slots.filter((s) => s.remaining > 0).length > 0 ? (
              <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
                <div className="flex flex-col">
                  <span className="text-[12px] text-muted">Σύνολο</span>
                  <span className="text-[20px] font-bold text-accent">
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

  return mounted ? createPortal(overlay, document.body) : null
}

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
      <button type="button" onClick={onDec} disabled={value <= 0} aria-label="Μείωση" className="flex size-9 items-center justify-center text-foreground transition-colors hover:text-accent disabled:opacity-30">
        <Minus className="size-4" />
      </button>
      <span className="w-9 text-center text-[15px] font-semibold text-foreground">{value}</span>
      <button type="button" onClick={onInc} disabled={!canInc} aria-label="Αύξηση" className="flex size-9 items-center justify-center text-foreground transition-colors hover:text-accent disabled:opacity-30">
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
  booking: ConfirmedWorkshopBooking
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
        Κωδικός κράτησης: <span className="font-semibold text-foreground">{booking.reference}</span>
      </p>

      <dl className="mt-1 w-full divide-y divide-border rounded-[14px] bg-offwhite px-4 text-left text-[14px]">
        <Row label="Εργαστήρι" value={booking.workshop_title ?? ''} />
        {booking.combo_label ? <Row label="Πρόγραμμα" value={booking.combo_label} /> : null}
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
