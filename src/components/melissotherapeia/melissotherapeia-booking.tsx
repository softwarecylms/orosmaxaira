'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarCheck, CalendarRange, Clock, Phone, ShieldCheck, X } from 'lucide-react'
import { EASE, DURATION } from '@/lib/motion'
import { BookingForm } from '@/components/booking/booking-form'

/**
 * Sticky sidebar booking card for Μελισσοθεραπεία — same anatomy as the activity
 * ActivityBookingCard (info → CTA → trust note → phone → brand), but appointment-
 * based (no seat pricing), so its CTA opens an enquiry modal. Facts + season come
 * from the backend (Medusa), with sensible defaults.
 */
export function MelissotherapeiaBooking({
  durationLabel = '20 λεπτά / συνεδρία',
  periodLabel = 'Απρίλιος – Οκτώβριος',
  seasonStartMonth = 4,
  seasonEndMonth = 10,
  seasonLabel = 'Διαθέσιμη μόνο Απρίλιο–Οκτώβριο',
}: {
  durationLabel?: string
  periodLabel?: string
  seasonStartMonth?: number
  seasonEndMonth?: number
  seasonLabel?: string
} = {}) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  const FACTS = [
    { icon: Clock, label: 'Διάρκεια', value: durationLabel },
    { icon: CalendarRange, label: 'Περίοδος', value: periodLabel },
  ]

  // Portal to <body> so the overlay escapes ancestor stacking contexts.
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

  return (
    <>
      <div className="flex flex-col gap-5 rounded-[20px] border border-border-strong/15 bg-white p-6 shadow-card md:p-7">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-gold-strong">
            Το ραντεβού με μια ματιά
          </span>
          <ul className="flex flex-col gap-3">
            {FACTS.map((f) => (
              <li key={f.label} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <f.icon className="size-4" aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[12px] uppercase tracking-[0.04em] text-muted">
                    {f.label}
                  </span>
                  <span className="text-[15px] font-semibold text-foreground">{f.value}</span>
                </span>
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
          Κλείστε ραντεβού
        </button>

        <p className="flex items-start gap-2 text-[13px] leading-[1.5] text-muted">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
          Το αίτημα δεν δεσμεύει — θα επικοινωνήσουμε για την επιβεβαίωση του ραντεβού.
        </p>

        <div className="flex items-center gap-3 rounded-[14px] bg-cream p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-accent">
            <Phone className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] text-muted">Έχετε απορίες για το ραντεβού;</span>
            <a
              href="tel:+35725622305"
              className="text-[15px] font-semibold text-foreground transition-colors hover:text-accent"
            >
              +357 25622305
            </a>
          </div>
        </div>

        {/* Bee Academy — the experience's brand, woven into the booking panel. */}
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

      {/* Enquiry modal — portaled to <body> so it sits above the sticky header */}
      {mounted
        ? createPortal(
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
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-foreground/50"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              transition={{ duration: DURATION.ui, ease: EASE.snap }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Κράτηση ραντεβού — Μελισσοθεραπεία"
              className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_0_60px_-15px_rgba(35,31,32,0.5)] sm:max-w-[480px] sm:rounded-[22px]"
              variants={{
                hidden: { opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.98 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: DURATION.ui, ease: EASE.snap }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <h2 className="flex items-center gap-2 text-[17px] font-semibold text-foreground">
                  <CalendarCheck className="size-5 text-accent" aria-hidden="true" />
                  Κλείστε το ραντεβού σας
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Κλείσιμο"
                  className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-offwhite hover:text-accent"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <BookingForm
                  activityName="Μελισσοθεραπεία"
                  variant="light"
                  seasonStartMonth={seasonStartMonth}
                  seasonEndMonth={seasonEndMonth}
                  seasonLabel={seasonLabel}
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  )
}
