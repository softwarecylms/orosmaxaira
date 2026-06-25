'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useMotionReady } from '@/components/motion/motion-ready'
import { EASE } from '@/lib/motion'

const STEPS = [
  { n: 1, label: 'ΚΑΛΑΘΙ', href: '/cart' },
  { n: 2, label: 'ΤΑΜΕΙΟ', href: '/checkout' },
  { n: 3, label: 'ΠΑΡΑΓΓΕΛΙΑ', href: null },
] as const

/** Container staggers each step left → right, drawing the path in sequence. */
const listV: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
}
/** Empty parent so each <li> participates in the stagger and propagates to its parts. */
const itemV: Variants = { hidden: {}, visible: {} }
/** Connector line "draws" out from the left toward the next node. */
const lineV: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1, transition: { duration: 0.45, ease: EASE.snap } },
}
/** Node pops in once the path reaches it (slight lead from the connector). */
const circleV: Variants = {
  hidden: { scale: 0.4, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: EASE.emphasis, delay: 0.08 } },
}
const labelV: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE.soft, delay: 0.08 } },
}
/** Subtitle settles in after the path has drawn. */
const noteV: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE.soft, delay: 0.55 } },
}

type Step = (typeof STEPS)[number] & {
  done: boolean
  on: boolean
  lineClass: string
  circleClass: string
  labelClass: string
  current: 'step' | undefined
}

/** Precompute per-step state + classes once, so the static and animated trees stay in sync. */
function buildSteps(active: 1 | 2 | 3): Step[] {
  return STEPS.map((step) => {
    const on = step.n <= active // active or already completed
    return {
      ...step,
      done: step.n < active,
      on,
      lineClass: cn(
        'mx-1.5 h-px w-6 origin-left sm:mx-4 sm:w-16',
        step.n <= active ? 'bg-accent' : 'bg-border-strong/30',
      ),
      circleClass: cn(
        'flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold sm:size-8',
        on ? 'bg-accent text-white' : 'border border-border-strong/40 text-muted',
      ),
      labelClass: cn(
        'text-[10px] font-semibold tracking-[0.06em] sm:text-[14px]',
        on ? 'text-foreground' : 'text-muted',
        step.href ? 'transition-colors group-hover/step:text-accent' : null,
      ),
      current: step.n === active ? ('step' as const) : undefined,
    }
  })
}

const SECTION = 'border-b border-border bg-offwhite'
const INNER = 'container-wide flex flex-col items-center gap-2.5 py-5 md:gap-3 md:py-6'
const OL = 'flex items-center justify-center'
const GROUP = 'flex items-center gap-1.5 sm:gap-2.5'
const NOTE = 'text-center text-[13px] leading-[18px] text-muted sm:text-[15px] sm:leading-[22px]'

/**
 * Branded checkout progress stepper (Καλάθι → Ταμείο → Παραγγελία), shown atop
 * the cart, checkout and order pages. `active` is the current step (1–3).
 *
 * On load the path draws in left → right: connectors extend, nodes pop and
 * labels slide in, in sequence — a "your order is progressing" flourish. Falls
 * back to the static, final layout when motion is unavailable or reduced (the
 * motion subtree only mounts once hydrated, so it animates from a fresh mount).
 */
export function CheckoutSteps({ active, note }: { active: 1 | 2 | 3; note?: string }) {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()
  const steps = buildSteps(active)

  // Static fallback: pre-hydration, or when the user prefers reduced motion.
  if (!ready || reduceMotion) {
    return (
      <section className={SECTION}>
        <div className={INNER}>
          <ol className={OL}>
            {steps.map((step, i) => (
              <li key={step.n} className="flex items-center">
                {i > 0 ? <span aria-hidden="true" className={step.lineClass} /> : null}
                <StepGroup href={step.href}>
                  <span className={step.circleClass} aria-current={step.current}>
                    {step.done ? <Check className="size-4" strokeWidth={2.6} aria-hidden="true" /> : step.n}
                  </span>
                  <span className={step.labelClass}>{step.label}</span>
                </StepGroup>
              </li>
            ))}
          </ol>
          {note ? <p className={NOTE}>{note}</p> : null}
        </div>
      </section>
    )
  }

  // Animated: this subtree mounts fresh when `ready` flips true, so the
  // initial="hidden" → animate="visible" entrance plays on every load.
  return (
    <section className={SECTION}>
      <div className={INNER}>
        <motion.ol className={OL} variants={listV} initial="hidden" animate="visible">
          {steps.map((step, i) => (
            <motion.li key={step.n} className="flex items-center" variants={itemV}>
              {i > 0 ? <motion.span aria-hidden="true" variants={lineV} className={step.lineClass} /> : null}
              <StepGroup href={step.href}>
                <motion.span variants={circleV} className={step.circleClass} aria-current={step.current}>
                  {step.done ? <Check className="size-4" strokeWidth={2.6} aria-hidden="true" /> : step.n}
                </motion.span>
                <motion.span variants={labelV} className={step.labelClass}>
                  {step.label}
                </motion.span>
              </StepGroup>
            </motion.li>
          ))}
        </motion.ol>
        {note ? (
          <motion.p className={NOTE} variants={noteV} initial="hidden" animate="visible">
            {note}
          </motion.p>
        ) : null}
      </div>
    </section>
  )
}

/** A step's circle+label: a Link to its page when navigable, else a plain span. */
function StepGroup({ href, children }: { href: string | null; children: React.ReactNode }) {
  const className = cn(GROUP, href && 'group/step')
  return href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  )
}
