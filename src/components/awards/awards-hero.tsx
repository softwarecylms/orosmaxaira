'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { RevealUp } from '@/components/home/reveal-up'

/** Awards page title banner — background photo with a subtle scroll parallax
 *  (off under reduced motion), dark overlay, centered title + description.
 *  Same pattern as the Contact page hero. */
export function AwardsHero({
  image,
  imageAlt,
  title,
  description,
}: {
  image: string
  imageAlt: string
  title: string
  description?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yRaw = useTransform(scrollYProgress, [0, 1], [-28, 28])
  const y = reduce ? 0 : yRaw

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[260px] items-center justify-center overflow-hidden md:min-h-[320px] lg:min-h-[340px]"
    >
      <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[14%] will-change-transform">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/45" />
      <RevealUp className="relative z-10 mx-auto max-w-[820px] px-6 text-center">
        <h1 className="font-display text-[32px] font-bold leading-[1.12] text-white md:text-[45px] md:leading-[55px]">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-[700px] text-[16px] leading-[24px] text-white/85 md:text-[18px] md:leading-[28px]">
            {description}
          </p>
        ) : null}
      </RevealUp>
    </section>
  )
}
