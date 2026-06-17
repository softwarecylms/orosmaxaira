'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useMotionReady } from '@/components/motion/motion-ready'

export function AnimatedSeoWaveChart({ className }: { className?: string }) {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()

  const linePath =
    'M0 110 C60 95 90 120 150 80 C210 40 250 90 320 55 C390 20 430 70 520 35 C610 0 650 45 707 25'
  const areaPath = `${linePath} L707 145 L0 145 Z`

  if (!ready || reduceMotion) {
    return (
      <svg viewBox="0 0 707 145" className={cn(className)} aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id="seoWave" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#seoWave)" />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 707 145" className={cn(className)} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="seoWave" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill="url(#seoWave)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.4, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
      />
    </svg>
  )
}
