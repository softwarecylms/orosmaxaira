'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Horizontal carousel of numbered tour-step cards — 4 per view on desktop
 *  (2 on tablet, 1 on mobile), scrolled with the prev/next arrows. */
export function StepsCarousel({
  items,
}: {
  items: readonly { title: string; text: string }[]
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: number) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-step]')
    const step = card ? card.offsetWidth + 16 : el.clientWidth
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((s, i) => (
          <div
            key={s.title}
            data-step
            className="flex shrink-0 basis-full snap-start items-start gap-4 rounded-[14px] bg-white p-5 shadow-card ring-1 ring-border/50 sm:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)]"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold-strong text-[14px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(241,172,16,0.75)]">
              {i + 1}
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[16px] font-semibold text-foreground">{s.title}</span>
              <span className="text-[14px] leading-[1.5] text-muted">{s.text}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Προηγούμενα"
          className="flex size-11 items-center justify-center rounded-full bg-white text-foreground shadow-card ring-1 ring-border/50 transition-colors hover:bg-accent hover:text-white"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Επόμενα"
          className="flex size-11 items-center justify-center rounded-full bg-white text-foreground shadow-card ring-1 ring-border/50 transition-colors hover:bg-accent hover:text-white"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
