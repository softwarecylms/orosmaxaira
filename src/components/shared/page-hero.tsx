'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { RevealUp } from '@/components/home/reveal-up'
import { useMotionReady } from '@/components/motion/motion-ready'
import { floatY } from '@/lib/motion'

/** Reusable page-title banner: full-bleed photo with a subtle page-scroll
 *  parallax + dark overlay, centered eyebrow / title / description. */
export function PageHero({
  image,
  imageAlt,
  eyebrow,
  title,
  description,
  overlayClassName,
  logo,
  logoAlt,
  buttons,
}: {
  image: string
  imageAlt: string
  eyebrow?: string
  title: string
  description?: string
  /** Override the default overlay (e.g. `bg-black/30` to match the contact hero). */
  overlayClassName?: string
  /** Optional brand logo shown above the title (use a light/white version). */
  logo?: string
  logoAlt?: string
  /** Optional CTA buttons below the copy (outlined white, fill white on hover). */
  buttons?: { label: string; href: string }[]
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

      <RevealUp className="relative z-10 mx-auto flex max-w-[840px] flex-col items-center px-6 text-center">
        {logo ? (
          // Subtle continuous float on the logo (disabled under reduced motion).
          <motion.div
            animate={reduce ? undefined : floatY.animate}
            transition={reduce ? undefined : floatY.transition}
            className="mb-5 will-change-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo, no optimization needed */}
            <img src={logo} alt={logoAlt ?? ''} className="h-14 w-auto md:h-[62px]" />
          </motion.div>
        ) : null}
        {eyebrow ? (
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-cream">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-[32px] font-bold leading-[1.14] text-white md:text-[45px]">{title}</h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-[720px] text-[16px] leading-[26px] text-white/85 md:text-[18px] md:leading-[28px]">
            {description}
          </p>
        ) : null}
        {buttons?.length ? (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {buttons.map((btn) => (
              <a
                key={btn.href}
                href={btn.href}
                className="rounded-[4px] border border-white bg-transparent px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-foreground"
              >
                {btn.label}
              </a>
            ))}
          </div>
        ) : null}
      </RevealUp>
    </section>
  )
}
