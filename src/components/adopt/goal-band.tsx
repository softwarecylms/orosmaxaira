'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Counter } from '@/components/motion/counter'
import { ADOPT_PAGE } from './adopt-content'

/** §8 "Ο Στόχος μας" — a gold band with the honeybee footage bleeding in on the
 *  right (same video + accent colour as the home "Υιοθετώ μια κυψέλη" banner). A
 *  gold gradient sits solid on the left (behind the copy) and fades to
 *  transparent on the right so the video reads there. Video plays via effect
 *  (no autoPlay attr) so server/client markup match; paused under reduced motion. */
export function GoalBand() {
  const g = ADOPT_PAGE.goal
  const reduce = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (reduce) v.pause()
    else v.play().catch(() => {})
  }, [reduce])

  return (
    <section className="container-wide pb-6 pt-0 md:pb-8 md:pt-2">
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
          {/* desktop: solid gold left → lighter right (video peeks behind the stats) */}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-accent from-25% via-accent/70 to-accent/35 lg:block" />
        </div>

        {/* copy — goal on the left, impact on the right (over the video) */}
        <div className="relative z-10 grid gap-8 px-7 py-12 md:px-12 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-[72px]">
          <div className="flex max-w-[560px] flex-col gap-5">
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cream">
              {g.eyebrow}
            </span>
            <h2 className="font-display text-[30px] font-bold leading-[1.08] text-white md:text-[44px]">
              {g.headingLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="text-[16px] leading-[1.7] text-white/85">{g.body}</p>
          </div>

          <div className="flex flex-col gap-6 [text-shadow:0_2px_14px_rgba(35,31,32,0.45)]">
            <div className="grid max-w-[460px] gap-6 sm:grid-cols-2">
              {g.impact.map((s) => (
                <div key={s.value} className="flex flex-col gap-1.5">
                  <Counter
                    value={s.value}
                    className="font-display text-[38px] font-bold leading-none text-white md:text-[46px]"
                  />
                  <p className="text-[14px] leading-[1.5] text-white/90">{s.text}</p>
                </div>
              ))}
            </div>
            <p className="max-w-[460px] border-t border-white/30 pt-5 text-[15px] leading-[1.6] text-white/95">
              {g.closing}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
