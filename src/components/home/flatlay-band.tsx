'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { FLATLAY } from './home-content'
import { FlatlayHotspot } from './flatlay-hotspot'

/** Section 9 — full-bleed marble flatlay with floating price pills that reveal
 *  a product quick-view card on hover (Figma 118:617 + 358:1793). On lg the
 *  image + pills drift together as the section scrolls (subtle parallax); the
 *  image carries a vertical buffer so no edges show. Off on mobile / reduced
 *  motion so the carefully-placed pills stay aligned. */
export function FlatlayBand() {
  const ref = useRef<HTMLElement | null>(null)
  const reduce = useReducedMotion()
  const [lg, setLg] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setLg(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yRaw = useTransform(scrollYProgress, [0, 1], [-44, 44])
  // Neutral (y=0) at the centre of the scroll-through, so pills line up when the
  // section is in view; identical px on both layers keeps them locked together.
  const y = lg && !reduce ? yRaw : 0

  return (
    <section ref={ref} data-testid="flatlay-band" className="relative z-10 w-full overflow-x-clip">
      <div className="relative aspect-square w-full lg:aspect-auto lg:h-[520px]">
        {/* Image clipped to the band; the hover cards are free to overflow it */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y }} className="absolute inset-0 will-change-transform lg:-inset-y-[14%]">
            <Image
              src={FLATLAY.image}
              alt={FLATLAY.imageAlt}
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </div>
        <motion.div style={{ y }} className="absolute inset-0 will-change-transform">
          {FLATLAY.prices.map((p, i) => (
            <FlatlayHotspot key={p.value} item={p} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
