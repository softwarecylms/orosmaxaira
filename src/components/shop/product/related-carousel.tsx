'use client'

import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EASE, DURATION, fadeUp, staggerContainer } from '@/lib/motion'
import { ShopProductCard } from '@/components/shop/shop-product-card'
import type { ShopProduct } from '@/components/shop/shop-content'

const GAP = 16 // gap-4

/**
 * Related-products carousel — same behaviour as the home "Διαμάντια" deal row:
 * two cards per view, scroll-snap one item at a time, prev/next arrows and a
 * 3.5s auto-advance (paused while the user interacts; off under reduced motion).
 * On md+ it falls back to the 4-column grid, where arrows/auto-scroll are inert.
 */
export function RelatedCarousel({ products }: { products: ShopProduct[] }) {
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
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            transition={{ duration: DURATION.base, ease: EASE.soft }}
            className="w-[calc(50%-0.5rem)] shrink-0 snap-start md:w-auto md:shrink"
          >
            <ShopProductCard product={p} shortCta />
          </motion.div>
        ))}
      </motion.div>

      {/* Navigation arrows — mobile carousel only */}
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="Προηγούμενο προϊόν"
        className="absolute -left-1 top-[26%] flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-[0_4px_14px_-4px_rgba(35,31,32,0.4)] transition-colors hover:text-accent active:scale-95 md:hidden"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        aria-label="Επόμενο προϊόν"
        className="absolute -right-1 top-[26%] flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-[0_4px_14px_-4px_rgba(35,31,32,0.4)] transition-colors hover:text-accent active:scale-95 md:hidden"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}
