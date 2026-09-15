'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { EASE, DURATION } from '@/lib/motion'

/**
 * Soft fade-down entrance for header rows on page load. Stagger via `delay`.
 * Reduced-motion is handled globally by <MotionConfig reducedMotion="user">
 * (drops the movement, keeps a gentle opacity fade).
 */
export function HeaderReveal({
  children,
  className,
  delay = 0,
  editKey,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  /** Section key for the admin's click-to-edit preview (`data-edit`). */
  editKey?: string
}) {
  return (
    <motion.div
      data-edit={editKey}
      className={className}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE.soft, delay }}
    >
      {children}
    </motion.div>
  )
}
