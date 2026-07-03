'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useMotionReady } from '@/components/motion/motion-ready'

/** Featured article image with a subtle page-scroll parallax: the photo drifts
 *  vertically inside its frame as the page scrolls. The image carries a vertical
 *  buffer larger than the drift so no edges ever show; the effect is off under
 *  reduced motion and gated on mount to avoid a hydration mismatch. */
export function ArticleFeaturedImage({
  src,
  alt,
  label,
}: {
  src: string
  alt: string
  label?: string
}) {
  const reduce = useReducedMotion()
  const ready = useMotionReady()
  const { scrollY } = useScroll()
  const yRaw = useTransform(scrollY, [0, 600], ['0%', '8%'])
  const y = !ready || reduce ? '0%' : yRaw

  return (
    <div className="relative aspect-[12/5] w-full overflow-hidden rounded-[18px] bg-offwhite shadow-card">
      <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[10%] will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(min-width:1024px) 70vw, 100vw"
          className="object-cover object-[center_40%]"
        />
      </motion.div>
      {label ? (
        <span className="absolute left-4 top-4 z-10 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[13px] font-medium text-white backdrop-blur">
          {label}
        </span>
      ) : null}
    </div>
  )
}
