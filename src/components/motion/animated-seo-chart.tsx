'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useMotionReady } from '@/components/motion/motion-ready'

type Props = {
  src?: string | null
  className?: string
  alt?: string
}

/**
 * Wraps the Figma-exported analytics SVG (vertical-bars histogram) with a
 * fade + clip-path reveal so the chart animates in when scrolled into view.
 * The image itself is the Figma asset to guarantee 1:1 fidelity with design.
 */
export function AnimatedSeoChart({ src, className, alt = '' }: Props) {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()

  if (!src) return null

  if (!ready || reduceMotion) {
    return (
      <div className={cn('w-full', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          aria-hidden={alt ? undefined : true}
          className="block h-auto w-full"
        />
      </div>
    )
  }

  return (
    <motion.div
      className={cn('w-full overflow-hidden', className)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        className="block h-auto w-full"
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.4, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
      />
    </motion.div>
  )
}
