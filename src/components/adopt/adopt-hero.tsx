'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { RevealMountStagger, RevealMountItem } from '@/components/motion/reveal'
import { useMotionReady } from '@/components/motion/motion-ready'
import { CtaLink } from '@/components/home/cta-link'
import { ADOPT_PAGE } from './adopt-content'

/** Full-bleed programme hero — parallax photo, dark overlay, wordmark + tagline
 *  («Bee-come a Hero» in accent) and the primary CTA. Parallax is driven off the
 *  page scroll (the hero sits at the top), avoiding element-target scroll
 *  measurement; both parallax and mount-stagger disable under reduced motion. */
export function AdoptHero() {
  const h = ADOPT_PAGE.hero
  const reduce = useReducedMotion()
  const ready = useMotionReady()
  const { scrollY } = useScroll()
  // Range starts at 0% so server + first client render match (avoids a
  // reduced-motion hydration mismatch); parallax engages after mount.
  const yRaw = useTransform(scrollY, [0, 700], ['0%', '10%'])
  const y = !ready || reduce ? '0%' : yRaw

  return (
    <section className="relative isolate flex min-h-[48vh] items-end overflow-hidden md:min-h-[60vh]">
      <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[10%] will-change-transform">
        <Image
          src={h.image}
          alt={h.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
      {/* Warm honey-toned scrim so white text always reads */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/15 to-foreground/25" />

      <div className="relative z-10 w-full pb-12 pt-12 md:pb-[70px] md:pt-14">
        <RevealMountStagger className="container-wide mx-auto flex max-w-[1200px] flex-col items-center text-center">
          <RevealMountItem>
            <Image
              src={h.wordmark}
              alt="Adopt a Hive — Όρος Μαχαιρά"
              width={280}
              height={173}
              priority
              // Render the wordmark solid white (brightness(0) invert(1)), then a
              // soft dark shadow for legibility on the photo — order fixed via one
              // arbitrary filter so invert doesn't flip the shadow colour.
              className="mb-6 h-11 w-auto object-contain opacity-95 md:h-16 [filter:brightness(0)_invert(1)_drop-shadow(0_2px_10px_rgba(0,0,0,0.45))]"
            />
          </RevealMountItem>
          <RevealMountItem>
            <h1 className="font-display text-[28px] font-bold leading-[1.16] text-white sm:text-[32px] md:text-[45px] md:leading-[1.14]">
              {h.taglinePre}{' '}
              <span className="text-accent">{h.taglineAccent}</span>{' '}
              {h.taglinePost}
            </h1>
          </RevealMountItem>
          <RevealMountItem>
            <div className="mt-8 flex w-full justify-center sm:w-auto">
              <CtaLink
                href={h.ctaPrimary.href}
                variant="gold"
                className="w-full justify-center hover:bg-white hover:text-foreground sm:w-auto"
              >
                {h.ctaPrimary.label}
              </CtaLink>
            </div>
          </RevealMountItem>
        </RevealMountStagger>
      </div>
    </section>
  )
}
