'use client'

import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EASE, DURATION, fadeUp, staggerContainer } from '@/lib/motion'
import { ProductCardHoney } from './product-card-honey'
import type { HoneyProduct } from './home-content'

const GAP = 16 // gap-4

/**
 * Mobile product carousel for the Deal-of-the-Month row: two cards per view,
 * scroll-snap one item at a time, prev/next arrows and a 3.5s auto-advance
 * (paused while the user interacts; off under reduced motion). On sm+ it falls
 * back to the original grid / desktop row — arrows and auto-scroll are inert
 * there because the track no longer overflows.
 */
export function DealCarousel({ products }: { products: HoneyProduct[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const paused = useRef(false)

  const move = useCallback((dir: 1 | -1) => {
    const el = ref.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return
    const step = first.offsetWidth + GAP
    const max = el.scrollWidth - el.clientWidth
    let next = el.scrollLeft + dir * step
    if (dir === 1 && el.scrollLeft >= max - 2) next = 0
    else if (dir === -1 && el.scrollLeft <= 2) next = max
    el.scrollTo({ left: next, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      // only when the track actually scrolls (mobile carousel mode)
      if (paused.current || el.scrollWidth <= el.clientWidth + 4) return
      move(1)
    }, 3500)
    return () => clearInterval(id)
  }, [move])

  const hold = () => (paused.current = true)
  const release = () => (paused.current = false)

  return (
    <div className="relative">
      <motion.div
        ref={ref}
        variants={staggerContainer(0.07)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        onPointerEnter={hold}
        onPointerLeave={release}
        onTouchStart={hold}
        onTouchEnd={release}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:flex lg:justify-between lg:gap-0 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            transition={{ duration: DURATION.base, ease: EASE.soft }}
            className="w-[calc(50%-0.5rem)] shrink-0 snap-start sm:w-auto sm:shrink lg:w-[216.8px] lg:shrink-0"
          >
            <ProductCardHoney product={p} />
          </motion.div>
        ))}
      </motion.div>

      {/* Navigation arrows — mobile carousel only */}
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="Προηγούμενο προϊόν"
        className="absolute -left-1 top-[28%] flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-[0_4px_14px_-4px_rgba(35,31,32,0.4)] transition-colors hover:text-accent active:scale-95 sm:hidden"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        aria-label="Επόμενο προϊόν"
        className="absolute -right-1 top-[28%] flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-[0_4px_14px_-4px_rgba(35,31,32,0.4)] transition-colors hover:text-accent active:scale-95 sm:hidden"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}
