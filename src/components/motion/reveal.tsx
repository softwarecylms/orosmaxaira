'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useMotionReady } from '@/components/motion/motion-ready'
import { EASE, fadeUp } from '@/lib/motion'

// HTMLAttributes minus the handlers framer-motion redefines with its own
// signatures (otherwise spreading `...rest` onto motion.div is a type conflict).
type MotionDivProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
>

type RevealProps = {
  as?: 'div' | 'section' | 'article' | 'header' | 'li' | 'span'
  delay?: number
  className?: string
  children: React.ReactNode
  /** Animate on mount instead of waiting for scroll (above-the-fold content). */
  immediate?: boolean
}

/** @deprecated import `fadeUp` from '@/lib/motion' instead. Kept for back-compat. */
export const revealVariants = fadeUp

const ease = EASE.soft

export function Reveal({
  as = 'div',
  delay = 0,
  className,
  children,
  immediate = false,
}: RevealProps) {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()
  const MotionTag = motion[as] as typeof motion.div
  const Tag = as

  if (!ready || reduceMotion) {
    return <Tag className={className}>{children}</Tag>
  }

  const transition = { duration: 0.55, delay, ease }

  if (immediate) {
    return (
      <MotionTag
        className={cn(className)}
        initial="hidden"
        animate="visible"
        transition={transition}
        variants={revealVariants}
      >
        {children}
      </MotionTag>
    )
  }

  return (
    <MotionTag
      className={cn(className)}
      initial={false}
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={transition}
      variants={revealVariants}
    >
      {children}
    </MotionTag>
  )
}

export function RevealStagger({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
}) {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()

  if (!ready || reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={false}
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function RevealStaggerItem({
  children,
  className,
  hoverLift = false,
  ...rest
}: MotionDivProps & { hoverLift?: boolean }) {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()

  if (!ready || reduceMotion) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={false}
      variants={revealVariants}
      transition={{ duration: 0.5, ease }}
      whileHover={hoverLift ? { y: -6, transition: { duration: 0.25 } } : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Staggered entrance on page load — for hero and above-the-fold sections. */
export function RevealMountStagger({
  children,
  className,
  stagger = 0.12,
  delay = 0.08,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
  delay?: number
}) {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()

  if (!ready || reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function RevealMountItem({
  children,
  className,
  ...rest
}: MotionDivProps) {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()

  if (!ready || reduceMotion) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={revealVariants}
      transition={{ duration: 0.65, ease }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
