'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarCheck, Check, Info, Loader2, Phone, ShieldCheck, X } from 'lucide-react'
import { EASE, DURATION } from '@/lib/motion'
import type { PriceTier } from '@/lib/medusa/activities'

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const money = (p: number | string | undefined | null) => {
  const n = typeof p === 'number' ? p : Number(p)
  return Number.isFinite(n) ? `€${n}` : '—'
}
const inputCls =
  'w-full rounded-[8px] border border-border bg-white px-4 py-2.5 text-[15px] leading-[22px] text-foreground outline-none transition placeholder:text-muted focus:border-accent'

/**
 * Booking for a single workshop. A workshop is combined with an experience —
 * each combination is a price tier (from Medusa; DEMO prices for now). The
 * sticky card lists the combinations + prices; its CTA opens an enquiry modal
 * where the visitor picks a combination and leaves contact details. Submits to
 * the shared /api/workshop-enquiry pipeline.
 */
export function WorkshopBooking({
  workshopTitle,
  tiers,
}: {
  workshopTitle: string
  tiers: PriceTier[]
}) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const hasTiers = tiers.length > 0

  return (
    <>
      <div className="flex flex-col gap-5 rounded-[20px] border border-border-strong/15 bg-white p-6 shadow-card md:p-7">
        {hasTiers ? (
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-gold-strong">
              Επιλογές & κόστος
            </span>
            <ul className="flex flex-col gap-3">
              {tiers.map((t) => (
                <li key={t.key} className="flex items-baseline justify-between gap-3">
                  <span className="text-[14.5px] leading-snug text-muted">{t.label}</span>
                  <span className="shrink-0 text-[18px] font-bold text-accent">{money(t.price)}</span>
                </li>
              ))}
            </ul>
            <p className="text-[12px] text-muted">Ενδεικτικές τιμές ανά άτομο.</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-accent p-[15px] text-[16px] font-semibold uppercase tracking-[0.02em] text-white transition-colors hover:bg-foreground"
        >
          <CalendarCheck className="size-5" aria-hidden="true" />
          Κλείστε το εργαστήρι
        </button>

        <p className="flex items-start gap-2 rounded-[14px] bg-accent-soft p-4 text-[13px] leading-[1.55] text-foreground/80 ring-1 ring-accent/15">
          <Info className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
          Κάθε εργαστήρι συνδυάζεται με μία εμπειρία «Γνωρίζω τη Μέλισσα». Στείλτε το αίτημά σας και
          θα επικοινωνήσουμε για την επιβεβαίωση.
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

      {mounted
        ? createPortalModal(open, () => setOpen(false), reduce, workshopTitle, tiers)
        : null}
    </>
  )
}

function createPortalModal(
  open: boolean,
  onClose: () => void,
  reduce: boolean | null,
  workshopTitle: string,
  tiers: PriceTier[],
) {
  return createPortal(
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
            className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_0_60px_-15px_rgba(35,31,32,0.5)] sm:max-w-[500px] sm:rounded-[22px]"
            variants={{
              hidden: { opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.98 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: DURATION.ui, ease: EASE.snap }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-[17px] font-semibold text-foreground">
                <CalendarCheck className="size-5 text-accent" aria-hidden="true" />
                Κλείστε το εργαστήρι
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
              <WorkshopBookingForm workshopTitle={workshopTitle} tiers={tiers} onClose={onClose} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

function WorkshopBookingForm({
  workshopTitle,
  tiers,
  onClose,
}: {
  workshopTitle: string
  tiers: PriceTier[]
  onClose: () => void
}) {
  const [combo, setCombo] = useState<string>(tiers[0]?.key ?? '')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [minDate, setMinDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const now = new Date()
    setMinDate(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    )
  }, [])

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <Check className="size-7" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <h3 className="font-display text-[22px] font-bold text-foreground">Λάβαμε το αίτημά σας! 🐝</h3>
        <p className="max-w-[360px] text-[14.5px] leading-[1.6] text-muted">
          Θα επικοινωνήσουμε σύντομα μαζί σας για την επιβεβαίωση της κράτησης.
        </p>
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (name.trim().length < 2) return setError('Συμπληρώστε το ονοματεπώνυμό σας.')
    if (!emailOk(email)) return setError('Συμπληρώστε ένα έγκυρο email.')
    if (phone.trim().length < 5) return setError('Συμπληρώστε έγκυρο τηλέφωνο.')
    if (!combo) return setError('Επιλέξτε συνδυασμό εμπειρίας.')
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/workshop-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date,
          experience: combo,
          workshop: workshopTitle,
          website,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d?.error ?? 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.')
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-4 text-left">
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ονοματεπώνυμο" aria-label="Ονοματεπώνυμο" className={inputCls} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" aria-label="Email" className={inputCls} />
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Τηλέφωνο" aria-label="Τηλέφωνο" className={inputCls} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[13px] font-semibold text-foreground">
          Συνδυασμός εμπειρίας <span aria-hidden="true">*</span>
        </legend>
        <div className="flex flex-col gap-2">
          {tiers.map((t) => {
            const active = combo === t.key
            return (
              <label
                key={t.key}
                className={`flex cursor-pointer items-start justify-between gap-3 rounded-[8px] border px-4 py-3 text-[14.5px] leading-[1.4] transition ${
                  active
                    ? 'border-accent bg-accent/10 text-foreground'
                    : 'border-border bg-white text-muted hover:border-accent'
                }`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="workshop-combo"
                    value={t.key}
                    checked={active}
                    onChange={() => setCombo(t.key)}
                    className="mt-0.5 size-4 shrink-0 accent-accent"
                  />
                  {t.label}
                </span>
                <span className="shrink-0 font-semibold text-accent">{money(t.price)}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-foreground">
        Προτιμώμενη ημερομηνία (προαιρετικό)
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={minDate} aria-label="Προτιμώμενη ημερομηνία" className={inputCls} />
      </label>

      <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />

      <p className="flex items-start gap-2 text-[13px] leading-[1.5] text-muted">
        <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        Το παρόν αποτελεί αίτημα κράτησης — θα επικοινωνήσουμε για την επιβεβαίωση.
      </p>

      {error ? (
        <p className="rounded-[8px] bg-red-50 px-4 py-2.5 text-[14px] font-medium text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 rounded-[4px] bg-accent p-[14px] text-[16px] font-semibold text-white transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            Αποστολή…
          </>
        ) : (
          'Αποστολή αιτήματος'
        )}
      </button>
    </form>
  )
}
