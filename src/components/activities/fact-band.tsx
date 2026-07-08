'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { CtaLink } from '@/components/home/cta-link'
import { ACTIVITIES_PAGE } from './activities-content'

/**
 * "Ήξερες ότι…" — the adopt "Ο Στόχος μας" goal-band design: a gold band with
 * the honeybee footage bleeding in on the right (solid gold left → transparent
 * right). Video plays via effect (no autoPlay attr) so server/client markup
 * match; paused under reduced motion.
 */
export function FactBand() {
  const f = ACTIVITIES_PAGE.fact
  const reduce = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (reduce) v.pause()
    else v.play().catch(() => {})
  }, [reduce])

  return (
    <section className="container-wide pt-4 pb-12 md:pt-4 md:pb-[70px]">
      <div className="relative isolate overflow-hidden rounded-[30px] bg-accent text-white">
        {/* video bleed — visible on the right */}
        <div className="pointer-events-none absolute inset-0">
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            poster="/videos/adopt-hive-poster.jpg"
            aria-hidden="true"
          >
            <source src="/videos/adopt-hive.webm" type="video/webm" />
            <source src="/videos/adopt-hive.mp4" type="video/mp4" />
          </video>
          {/* mobile: mostly-solid gold so the copy always reads */}
          <div className="absolute inset-0 bg-gradient-to-t from-accent via-accent/90 to-accent/70 lg:hidden" />
          {/* desktop: solid gold left → lighter right (video peeks behind the stat) */}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-accent from-25% via-accent/70 to-accent/35 lg:block" />
        </div>

        <div className="relative z-10 grid gap-8 px-7 py-12 md:px-12 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-[72px]">
          <div className="flex max-w-[560px] flex-col gap-5">
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cream">
              {f.eyebrow}
            </span>
            <h2 className="font-display text-[30px] font-bold leading-[1.08] text-white md:text-[44px]">
              {f.heading}
            </h2>
            <p className="text-[16px] leading-[1.7] text-white/85">{f.body}</p>
            <CtaLink
              href={f.cta.href}
              variant="link"
              className="mt-1 self-start text-white hover:text-white/75"
            >
              {f.cta.label}
            </CtaLink>
          </div>

          <div className="flex flex-col gap-6 [text-shadow:0_2px_14px_rgba(35,31,32,0.45)]">
            <div className="max-w-[460px]">
              <span className="font-display text-[46px] font-bold leading-none text-white md:text-[56px]">
                {f.stat.value}
              </span>
              <p className="mt-2.5 max-w-[340px] text-[15px] leading-[1.5] text-white/90">
                {f.stat.label}
              </p>
            </div>
            <p className="max-w-[460px] border-t border-white/30 pt-5 text-[15px] leading-[1.6] text-white/95">
              {f.closing}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
