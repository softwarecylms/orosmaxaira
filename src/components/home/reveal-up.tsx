'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { EASE, DURATION, fadeUp, staggerContainer } from '@/lib/motion'

/**
 * Minimal scroll-entrance helpers for the home page.
 *
 * Unlike the shared `Reveal` (which uses `initial={false}` and renders content
 * already-visible), these use an explicit hidden→visible variant so elements
 * actually fade-up as they enter the viewport. Easing/variants come from
 * `lib/motion.ts`. Reduced-motion is handled globally by the
 * `<MotionConfig reducedMotion="user">` in MotionReady, which drops the
 * transform (movement) and keeps only a soft opacity fade.
 */

const viewport = { once: true, margin: '-60px' } as const

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  style?: React.CSSProperties
}

/** Single element, soft fade-up on scroll-in. */
export function RevealUp({ children, className, delay = 0, style }: RevealProps) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={{ duration: DURATION.base, ease: EASE.soft, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Opacity-only reveal — for absolutely-positioned elements whose CSS
 *  transform (e.g. centering translate) must be preserved. */
export function RevealFade({ children, className, delay = 0, style }: RevealProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewport}
      transition={{ duration: DURATION.base, ease: EASE.soft, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Stagger container — children should be <RevealItem>. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {children}
    </motion.div>
  )
}

/** A staggered child of <RevealGroup>. */
export function RevealItem({
  children,
  className,
  'data-testid': testId,
}: {
  children: React.ReactNode
  className?: string
  'data-testid'?: string
}) {
  return (
    <motion.div
      className={className}
      data-testid={testId}
      variants={fadeUp}
      transition={{ duration: DURATION.base, ease: EASE.soft }}
    >
      {children}
    </motion.div>
  )
}
