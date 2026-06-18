'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * The "wow" layer for the adopt-a-hive banner — a cinemagraph built from the
 * real honeycomb photo (no fake critters): a slow cinematic Ken Burns drift
 * plus a soft sunlight glint that sweeps across the comb, so the still reads
 * as living video. Pure GPU transforms — crisp at any size, ~zero weight.
 * Honours prefers-reduced-motion: the photo simply holds still.
 */
export function AdoptHiveScene({ image, alt }: { image: string; alt: string }) {
  const reduce = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      <div className="absolute inset-y-0 left-0 w-[58%] overflow-hidden">
        {/* Ken Burns: the comb slowly breathes — a continuous zoom + pan */}
        <motion.div
          className="absolute inset-0"
          animate={reduce ? undefined : { scale: [1, 1.1], x: ['0%', '-4%'], y: ['0%', '-3%'] }}
          transition={{ duration: 19, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        >
          <Image src={image} alt={alt} fill sizes="58vw" className="object-cover" priority={false} />
        </motion.div>

        {/* Sunlight glint travelling across the honeycomb */}
        {!reduce && (
          <motion.div
            className="absolute -inset-y-1/4 left-0 w-[45%] -skew-x-12 mix-blend-soft-light"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
            }}
            initial={{ x: '-60%', opacity: 0 }}
            animate={{ x: ['-60%', '260%'], opacity: [0, 0.9, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
          />
        )}

        {/* Fade the photo into the gold band */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-accent" />
      </div>
    </div>
  )
}
