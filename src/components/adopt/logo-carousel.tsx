'use client'

import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'
import { useMotionReady } from '@/components/motion/motion-ready'

type Logo = { src: string; alt: string }

/** White logo chip — greyscale by default, colours up on hover. When `decorative`
 *  it's hidden from assistive tech (used for the marquee's visual clone). */
function LogoChip({ logo, decorative = false }: { logo: Logo; decorative?: boolean }) {
  return (
    <div className="flex h-28 items-center justify-center rounded-[4px] border border-border bg-white px-5 md:h-36">
      <Image
        src={logo.src}
        alt={decorative ? '' : logo.alt}
        aria-hidden={decorative || undefined}
        width={240}
        height={240}
        className="max-h-[76%] w-auto max-w-[88%] object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
      />
    </div>
  )
}

const CELL = 'shrink-0 px-2 w-[44vw] sm:w-[28vw] md:w-[21vw] lg:w-[17vw]'

/** Partner-logo strip. Auto-scrolling greyscale marquee showing ~3 → 5 → 6 → 7
 *  logos at a time; pauses on hover. Under reduced motion it renders a static
 *  centered grid instead. New component (no site equivalent). */
export function LogoCarousel({ logos }: { logos: Logo[] }) {
  const reduce = useReducedMotion()
  const ready = useMotionReady()

  // Render the marquee on the server + first client render (ready === false) so
  // hydration matches, then swap to the static grid for reduced-motion users.
  if (ready && reduce) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-3">
        {logos.map((l) => (
          <div key={l.src} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.6rem)] lg:w-[calc(20%-0.7rem)]">
            <LogoChip logo={l} />
          </div>
        ))}
      </div>
    )
  }

  // Render the set twice so the global `marquee-x` keyframe (0 → -50%) loops
  // seamlessly. The second pass is aria-hidden so screen readers hear each
  // partner once, not twice.
  return (
    <div
      className="group relative overflow-hidden"
      style={{
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
    >
      <div className="flex w-max [animation:marquee-x_45s_linear_infinite] group-hover:[animation-play-state:paused]">
        {[false, true].map((clone) => (
          <div key={clone ? 'clone' : 'real'} className="flex" aria-hidden={clone || undefined}>
            {logos.map((l) => (
              <div key={l.src} className={CELL}>
                <LogoChip logo={l} decorative={clone} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
