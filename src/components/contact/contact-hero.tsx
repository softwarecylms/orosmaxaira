'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { RevealUp } from '@/components/home/reveal-up'

/** Contact page hero (Figma 146:957). The background image drifts vertically as
 *  the section scrolls (subtle parallax). The image carries a vertical buffer
 *  (`-inset-y`) larger than the drift so no edges ever show; the effect is off
 *  under reduced motion. */
export function ContactHero({
  image,
  imageAlt,
  title,
}: {
  image: string
  imageAlt: string
  title: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const yRaw = useTransform(scrollYProgress, [0, 1], [-80, 80])
  const y = reduce ? 0 : yRaw

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[220px] items-center justify-center overflow-hidden md:min-h-[290px] lg:min-h-[280px]"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-x-0 -inset-y-[45%] will-change-transform"
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/30" />
      <RevealUp className="relative z-10 px-6 text-center">
        <h1 className="font-display text-[32px] font-bold leading-[1.12] text-white md:text-[45px] md:leading-[55px]">
          {title}
        </h1>
      </RevealUp>
    </section>
  )
}
