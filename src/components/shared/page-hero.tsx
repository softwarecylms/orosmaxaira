'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { RevealUp } from '@/components/home/reveal-up'
import { useMotionReady } from '@/components/motion/motion-ready'

/** Reusable page-title banner: full-bleed photo with a subtle page-scroll
 *  parallax + dark overlay, centered eyebrow / title / description. */
export function PageHero({
  image,
  imageAlt,
  eyebrow,
  title,
  description,
  overlayClassName,
}: {
  image: string
  imageAlt: string
  eyebrow?: string
  title: string
  description?: string
  /** Override the default overlay (e.g. `bg-black/30` to match the contact hero). */
  overlayClassName?: string
}) {
  const reduce = useReducedMotion()
  const ready = useMotionReady()
  const { scrollY } = useScroll()
  const yRaw = useTransform(scrollY, [0, 600], ['0%', '10%'])
  const y = !ready || reduce ? '0%' : yRaw

  return (
    <section className="relative isolate flex min-h-[42vh] items-center justify-center overflow-hidden md:min-h-[52vh]">
      <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[10%] will-change-transform">
        <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover object-center" />
      </motion.div>
      {overlayClassName ? (
        <div className={`absolute inset-0 ${overlayClassName}`} />
      ) : (
        <>
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-foreground/20" />
        </>
      )}

      <RevealUp className="relative z-10 mx-auto max-w-[840px] px-6 text-center">
        {eyebrow ? (
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-cream">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-[32px] font-bold leading-[1.14] text-white md:text-[45px]">{title}</h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-[720px] text-[16px] leading-[26px] text-white/85 md:text-[18px] md:leading-[28px]">
            {description}
          </p>
        ) : null}
      </RevealUp>
    </section>
  )
}
