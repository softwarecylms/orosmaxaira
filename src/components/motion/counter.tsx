'use client'

import * as React from 'react'
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { EASE } from '@/lib/motion'

type CounterProps = {
  value: string
  duration?: number
  className?: string
}

/**
 * Animates the numeric part of a string ("250+", "10+ years"). Leading
 * non-numeric characters and the trailing suffix are preserved.
 */
export function Counter({ value, duration = 1.6, className }: CounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduceMotion = useReducedMotion()

  const match = value.match(/^([^0-9]*)(\d[\d.,]*)(.*)$/)
  const prefix = match?.[1] ?? ''
  const rawNumber = match?.[2] ?? ''
  const target = match ? Number(rawNumber.replace(/,/g, '')) : NaN
  const suffix = match?.[3] ?? ''
  const isDecimal = rawNumber.includes('.')

  const motionValue = useMotionValue(0)
  const rendered = useTransform(motionValue, (v) =>
    isDecimal ? v.toFixed(1) : Math.round(v).toLocaleString(),
  )

  React.useEffect(() => {
    if (!inView || !Number.isFinite(target)) return
    if (reduceMotion) {
      motionValue.set(target)
      return
    }
    const controls = animate(motionValue, target, {
      duration,
      ease: EASE.soft,
    })
    return () => controls.stop()
  }, [inView, target, duration, motionValue, reduceMotion])

  if (!Number.isFinite(target)) {
    return <span className={className}>{value}</span>
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rendered}</motion.span>
      {suffix}
    </span>
  )
}
