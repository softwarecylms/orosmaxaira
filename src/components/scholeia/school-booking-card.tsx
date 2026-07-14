'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CalendarCheck, Gift, Phone } from 'lucide-react'
import { SCHOOL_PRICING } from '@/lib/data/school-visit'
import { SchoolBookingModal } from './school-booking-modal'

/**
 * Sticky sidebar booking card for the school visit — same anatomy as the
 * activity ActivityBookingCard (price tiers → CTA → trust note → phone → brand),
 * but its CTA opens the school-visit request modal instead of the seat checkout.
 */
export function SchoolBookingCard() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-5 rounded-[20px] border border-border-strong/15 bg-white p-6 shadow-card md:p-7">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-gold-strong">
            Κόστος ανά παιδί
          </span>
          <ul className="flex flex-col gap-3">
            {SCHOOL_PRICING.map((t) => (
              <li key={t.range} className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] leading-snug text-muted">{t.range}</span>
                <span className="shrink-0 text-[18px] font-bold text-accent">
                  {t.price === null ? (
                    'Δωρεάν'
                  ) : (
                    <>
                      €{t.price}
                      <span className="text-[12px] font-medium text-muted"> / παιδί</span>
                    </>
                  )}
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
          Κλείστε επίσκεψη
        </button>

        <p className="flex items-start gap-2 rounded-[14px] bg-accent-soft p-4 text-[13px] leading-[1.55] text-foreground/80 ring-1 ring-accent/15">
          <Gift className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
          Η τιμή περιλαμβάνει όλα τα υλικά των εργαστηρίων και τα δώρα του quiz.
        </p>

        <div className="flex items-center gap-3 rounded-[14px] bg-cream p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-accent">
            <Phone className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] text-muted">Έχετε απορίες για την επίσκεψη;</span>
            <a
              href="tel:+35725622305"
              className="text-[15px] font-semibold text-foreground transition-colors hover:text-accent"
            >
              +357 25622305
            </a>
          </div>
        </div>

        {/* Bee Academy — the programme's brand, woven into the booking panel. */}
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

      <SchoolBookingModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
