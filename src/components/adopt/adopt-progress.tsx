'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Hexagon } from 'lucide-react'
import { Counter } from '@/components/motion/counter'
import { CtaLink } from '@/components/home/cta-link'
import { Reveal } from '@/components/motion/reveal'
import { EASE } from '@/lib/motion'

const ADOPTED = 40
const TARGET = 200
const PCT = Math.round((ADOPTED / TARGET) * 100) // 20

/** Adoption-progress toward the 200-hive goal — an animated gradient bar that
 *  fills on scroll-in, with a honeycomb marker on the leading edge. */
export function AdoptProgress() {
  const reduce = useReducedMotion()

  return (
    <section className="bg-white py-12 md:py-[70px]">
      <div className="container-wide flex flex-col gap-8">
        <Reveal className="mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
            Η Πρόοδός μας
          </span>
          <h2 className="font-display text-[28px] font-bold leading-[1.14] text-foreground md:text-[35px]">
            Μαζί, προς τις 200 κυψέλες
          </h2>
        </Reveal>

        <div className="flex w-full flex-col gap-7 rounded-[24px] bg-white p-7 shadow-card ring-1 ring-border md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="flex items-baseline gap-2">
                <Counter
                  value="40"
                  className="font-display text-[46px] font-bold leading-none text-accent md:text-[54px]"
                />
                <span className="text-[18px] text-muted">/ {TARGET} κυψέλες</span>
              </p>
              <span className="text-[14px] text-muted">υιοθετήθηκαν μέχρι σήμερα</span>
            </div>
            <div className="flex flex-col items-end">
              <Counter
                value={`${PCT}%`}
                className="font-display text-[32px] font-bold leading-none text-accent md:text-[40px]"
              />
              <span className="text-[13px] uppercase tracking-wide text-muted">του στόχου</span>
            </div>
          </div>

          {/* progress track */}
          <div className="relative h-6 rounded-full bg-offwhite ring-1 ring-border">
            <motion.div
              className="relative h-full min-w-6 rounded-full bg-gradient-to-r from-accent to-gold-strong"
              initial={{ width: 0 }}
              whileInView={{ width: `${PCT}%` }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: reduce ? 0 : 1.3, ease: EASE.soft }}
            >
              <span className="absolute right-0 top-1/2 flex size-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white shadow-card ring-2 ring-accent">
                <Hexagon className="size-4 fill-accent text-accent" aria-hidden="true" />
              </span>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] text-muted">
              Απομένουν{' '}
              <span className="font-semibold text-foreground">{TARGET - ADOPTED} κυψέλες</span> για να
              πετύχουμε τον στόχο μας.
            </p>
            <CtaLink href="#cta" variant="link" className="text-[15px]">
              Υιοθετήστε μια κυψέλη
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  )
}
