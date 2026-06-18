'use client'

import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { EASE, DURATION } from '@/lib/motion'
import type { FlatlayPrice } from './home-content'

/**
 * A price pill on the flatlay band that reveals a product quick-view card on
 * hover / keyboard focus (Figma 358:1793): image, category, title, price and
 * an add-to-cart button. The card opens up or down per `placement` so it stays
 * over the band, and raises its stacking order while open.
 */
export function FlatlayHotspot({ item, index }: { item: FlatlayPrice; index: number }) {
  const openUp = item.placement === 'top'

  return (
    <motion.div
      className="group absolute z-20 hidden -translate-x-1/2 -translate-y-1/2 hover:z-40 md:block"
      style={{ left: item.left, top: item.top }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: DURATION.base, ease: EASE.soft, delay: 0.1 + index * 0.1 }}
    >
      {/* Price pill (focusable so the card is keyboard-accessible) */}
      <span
        tabIndex={0}
        role="button"
        aria-label={`${item.product.title} — ${item.product.price}`}
        className="flex cursor-pointer items-center justify-center rounded-[21px] bg-white px-5 py-2.5 text-[17px] leading-[24px] text-foreground shadow-[0_6px_20px_-8px_rgba(0,0,0,0.35)] outline-none transition-transform focus-visible:ring-2 focus-visible:ring-accent group-hover:scale-105"
      >
        {item.value}
      </span>

      {/* Quick-view card */}
      <div
        className={cn(
          'absolute left-1/2 w-[240px] -translate-x-1/2 opacity-0 transition-all duration-300 ease-out',
          'pointer-events-none invisible',
          openUp ? 'bottom-[calc(100%+12px)] translate-y-2' : 'top-[calc(100%+12px)] -translate-y-2',
          'group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto',
          'group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto',
        )}
      >
        <div className="flex flex-col gap-3 rounded-[4px] bg-white p-[15px] text-left shadow-[0_24px_60px_-20px_rgba(35,31,32,0.5)]">
          <div className="relative aspect-square w-full overflow-hidden rounded-[4px] bg-offwhite">
            <Image
              src={item.product.image}
              alt={item.product.title}
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>
          <p className="text-[14px] leading-[21px] text-[#555]">{item.product.category}</p>
          <p className="text-[17px] font-medium leading-[24px] text-foreground">
            {item.product.title}
          </p>
          <p className="text-[16px] leading-[24px] text-accent">{item.product.price}</p>
          <button
            type="button"
            className="flex items-center justify-center gap-3 rounded-[4px] bg-accent p-[15px] text-[17px] leading-[24px] text-white transition-colors hover:bg-foreground"
          >
            <ShoppingCart className="size-[15px] shrink-0" aria-hidden="true" />
            Προσθήκη
          </button>
        </div>
      </div>
    </motion.div>
  )
}
