'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ADOPT_PAGE } from './adopt-content'

/** Testimonials carousel — 2 cards per view (1 on mobile), seamless looped
 *  autoplay (the set is duplicated so it wraps invisibly), prev/next arrows.
 *  Pauses on hover, autoplay off under reduced motion. */
export function AdoptTestimonials() {
  const raw = ADOPT_PAGE.testimonials.items
  const items = [...raw, ...raw] // duplicate for a seamless loop
  const trackRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)

  const stepPx = () => {
    const el = trackRef.current
    const slide = el?.querySelector<HTMLElement>('[data-slide]')
    return slide ? slide.clientWidth + 16 /* gap-4 */ : (el?.clientWidth ?? 0)
  }
  const setWidth = () => stepPx() * raw.length

  const go = useCallback((dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    // to go back past the start, hop forward by one set first (invisible — the
    // set is duplicated), then scroll back into it.
    if (dir < 0 && el.scrollLeft <= 2) el.scrollLeft += setWidth()
    el.scrollBy({ left: dir * stepPx(), behavior: 'smooth' })
    // after the scroll settles, rewind by a full set once we've entered the clone
    window.setTimeout(() => {
      const w = setWidth()
      if (w && el.scrollLeft >= w) el.scrollLeft -= w
    }, 600)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reduce || paused) return
    const id = setInterval(() => go(1), 4200)
    return () => clearInterval(id)
  }, [reduce, paused, go])

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((t, i) => (
          <div
            key={i}
            data-slide
            className="flex shrink-0 basis-full snap-start flex-col rounded-[8px] border border-border bg-white p-6 md:basis-[calc(50%-0.5rem)] md:p-7"
          >
            <span
              className="mt-3 font-display text-[120px] leading-[0.55] text-accent"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="mt-1 flex-1 text-[16px] leading-[1.7] text-muted">{t.quote}</p>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-[15px] font-semibold text-accent">{t.name}</p>
              <p className="text-[13px] text-muted">{t.role}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Προηγούμενες μαρτυρίες"
        className="absolute -left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-card ring-1 ring-border transition hover:bg-accent hover:text-white md:-left-5"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Επόμενες μαρτυρίες"
        className="absolute -right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-card ring-1 ring-border transition hover:bg-accent hover:text-white md:-right-5"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}
