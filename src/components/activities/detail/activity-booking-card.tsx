'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CalendarCheck, Phone, ShieldCheck } from 'lucide-react'
import type { Activity } from '@/lib/medusa/activities'
import { Stars } from './stars'
import { BookingModal } from '@/components/booking/booking-modal'

/** Format a tier price; €0 renders as its `note` (e.g. "Δωρεάν"). */
export function formatTierPrice(amount: number, currency = 'eur'): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

/**
 * Sticky sidebar booking card: price tiers → rating → the "ΔΕΙΤΕ
 * ΔΙΑΘΕΣΙΜΟΤΗΤΑ" button (opens the booking modal) → cancellation note + help box.
 */
export function ActivityBookingCard({ activity }: { activity: Activity }) {
  const [open, setOpen] = useState(false)
  const tiers = activity.price_tiers ?? []
  const currency = activity.currency ?? 'eur'

  return (
    <>
      <div className="flex flex-col gap-5 rounded-[20px] border border-border-strong/15 bg-white p-6 shadow-card md:p-7">
        {tiers.length ? (
          <ul className="flex flex-col gap-3">
            {tiers.map((t) => (
              <li key={t.key} className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] leading-snug text-muted">{t.label}</span>
                <span className="shrink-0 text-[18px] font-bold text-accent">
                  {t.price === 0 ? (t.note ?? 'Δωρεάν') : formatTierPrice(t.price, currency)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {activity.rating ? (
          <div className="flex items-center gap-2 border-t border-border pt-4">
            <Stars value={activity.rating} />
            <span className="text-[14px] font-semibold text-foreground">
              {activity.rating.toFixed(1)}
            </span>
            {activity.review_count ? (
              <span className="text-[14px] text-muted">({activity.review_count})</span>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-accent p-[15px] text-[16px] font-semibold uppercase tracking-[0.02em] text-white transition-colors hover:bg-foreground"
        >
          <CalendarCheck className="size-5" aria-hidden="true" />
          Δείτε διαθεσιμότητα
        </button>

        <p className="flex items-center gap-2 text-[13px] text-muted">
          <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
          Δωρεάν ακύρωση έως 72 ώρες πριν.
        </p>

        <div className="flex items-center gap-3 rounded-[14px] bg-cream p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-accent">
            <Phone className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] text-muted">Έχετε απορίες για την κράτηση;</span>
            <a
              href="tel:+35799130092"
              className="text-[15px] font-semibold text-foreground transition-colors hover:text-accent"
            >
              +357 99 130092
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

      <BookingModal activity={activity} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
