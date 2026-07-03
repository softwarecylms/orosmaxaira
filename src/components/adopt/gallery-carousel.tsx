'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { EASE } from '@/lib/motion'

type GalleryImage = { src: string; alt: string }

/** Autoplay image carousel (~5 per view at desktop) with prev/next arrows and a
 *  full-screen lightbox on click (←/→/Esc + backdrop to close). Autoplay pauses
 *  on hover / when the lightbox is open and is disabled under reduced motion.
 *  New component (no site equivalent). */
export function GalleryCarousel({ images }: { images: GalleryImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)

  const stepPx = () => {
    const el = trackRef.current
    const tile = el?.querySelector<HTMLElement>('[data-tile]')
    return tile ? tile.clientWidth + 12 /* gap-3 */ : (el?.clientWidth ?? 0)
  }

  const scrollByTiles = useCallback((dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
    else el.scrollBy({ left: dir * stepPx(), behavior: 'smooth' })
  }, [])

  // autoplay
  useEffect(() => {
    if (reduce || paused || lightbox !== null) return
    const id = setInterval(() => scrollByTiles(1), 3200)
    return () => clearInterval(id)
  }, [reduce, paused, lightbox, scrollByTiles])

  // lightbox keyboard + body scroll lock
  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      else if (e.key === 'ArrowRight') setLightbox((i) => (i === null ? i : (i + 1) % images.length))
      else if (e.key === 'ArrowLeft') setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length))
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, images.length])

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <button
            key={i}
            data-tile
            type="button"
            onClick={() => setLightbox(i)}
            aria-label={`Άνοιγμα φωτογραφίας ${i + 1} από ${images.length}`}
            className="group relative aspect-square shrink-0 basis-[calc(50%-0.375rem)] cursor-zoom-in snap-start overflow-hidden rounded-[8px] bg-offwhite sm:basis-[calc(33.333%-0.5rem)] lg:basis-[calc(25%-0.5625rem)]"
          >
            <Image
              src={img.src}
              alt=""
              fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.06]"
            />
            <span className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/25" />
            <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/85 text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ZoomIn className="size-4" aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      {/* nav arrows */}
      <button
        type="button"
        onClick={() => scrollByTiles(-1)}
        aria-label="Προηγούμενες φωτογραφίες"
        className="absolute -left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-card ring-1 ring-border transition hover:bg-accent hover:text-white md:-left-4"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => scrollByTiles(1)}
        aria-label="Επόμενες φωτογραφίες"
        className="absolute -right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-card ring-1 ring-border transition hover:bg-accent hover:text-white md:-right-4"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox !== null ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Προβολή φωτογραφίας"
            className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/92 p-4 sm:p-8"
            onClick={() => setLightbox(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE.soft }}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Κλείσιμο"
              className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length)) }}
              aria-label="Προηγούμενη"
              className="absolute left-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="size-6" aria-hidden="true" />
            </button>
            <motion.div
              key={lightbox}
              className="relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: EASE.snap }}
            >
              <Image
                src={images[lightbox].src}
                alt=""
                width={880}
                height={1100}
                className="max-h-[85vh] w-auto rounded-[8px] object-contain"
              />
            </motion.div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? i : (i + 1) % images.length)) }}
              aria-label="Επόμενη"
              className="absolute right-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="size-6" aria-hidden="true" />
            </button>
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium text-white">
              {lightbox + 1} / {images.length}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
