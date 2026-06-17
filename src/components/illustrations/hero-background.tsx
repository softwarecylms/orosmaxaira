'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useMotionReady } from '@/components/motion/motion-ready'

const columns = [
  { x: 0, y: 260, width: 391, height: 1043, opacity: 1 },
  { x: 1609, y: 260, width: 391, height: 1043, opacity: 1 },
  { x: 165, y: 478, width: 391, height: 826, opacity: 0.85 },
  { x: 1443, y: 478, width: 391, height: 826, opacity: 0.85 },
  { x: 413, y: 696, width: 309, height: 609, opacity: 0.7 },
  { x: 1278, y: 696, width: 309, height: 609, opacity: 0.7 },
] as const

export function HeroBackground({ className }: { className?: string }) {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()

  return (
    <svg
      viewBox="0 0 2000 1304"
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 h-full w-full min-w-[1200px] -translate-x-1/2 left-1/2',
        className,
      )}
      aria-hidden="true"
      preserveAspectRatio="xMidYMin slice"
    >
      <defs>
        <linearGradient id="heroCol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe2c9" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffe2c9" stopOpacity="0" />
        </linearGradient>
      </defs>
      {columns.map((col, i) =>
        ready && !reduceMotion ? (
          <motion.rect
            key={i}
            x={col.x}
            width={col.width}
            height={col.height}
            fill="url(#heroCol)"
            rx={8}
            initial={{ opacity: 0, y: col.y + 48 }}
            animate={{ opacity: col.opacity, y: col.y }}
            transition={{
              duration: 0.85,
              delay: 0.05 + i * 0.07,
              ease: [0.22, 0.61, 0.36, 1],
            }}
          />
        ) : (
          <rect
            key={i}
            x={col.x}
            y={col.y}
            width={col.width}
            height={col.height}
            fill="url(#heroCol)"
            rx={8}
            opacity={col.opacity}
          />
        ),
      )}
    </svg>
  )
}
