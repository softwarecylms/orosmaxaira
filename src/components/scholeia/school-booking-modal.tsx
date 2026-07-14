'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { GraduationCap, X } from 'lucide-react'
import { EASE, DURATION } from '@/lib/motion'
import { SchoolVisitForm } from './school-visit-form'

/**
 * Booking popup for the school visit — the same modal shell as the activity
 * BookingModal (overlay, Esc, scroll-lock, motion), wrapping the enquiry form
 * instead of the seat-based checkout (school visits are date/headcount
 * requests, confirmed by the farm).
 */
export function SchoolBookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion()

  // Portal to <body> so the overlay escapes ancestor stacking contexts.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Esc + body-scroll lock while open.
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
            aria-label="Κράτηση σχολικής επίσκεψης"
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
                <GraduationCap className="size-5 text-accent" aria-hidden="true" />
                Κράτηση σχολικής επίσκεψης
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
              <SchoolVisitForm />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return mounted ? createPortal(overlay, document.body) : null
}
