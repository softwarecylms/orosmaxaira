'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { EASE, DURATION } from '@/lib/motion'

export type OutdoorSlide = {
  title: string
  text: string
  image: string
  href?: string
}

const AUTOPLAY_MS = 8000

/**
 * Outdoor-spaces carousel for the About page (slide structure = Figma 393:2049,
 * content = 135:1312). One image-left / text-right card at a time, autoplayed,
 * with dark navigation arrows outside the card that turn accent on hover.
 * Autoplay pauses on hover/focus and is disabled under reduced motion.
 */
export function OutdoorCarousel({
  slides,
  cta,
}: {
  slides: OutdoorSlide[]
  cta: { label: string; href: string }
}) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const paused = useRef(false)

  const go = useCallback(
    (d: 1 | -1) => {
      setDir(d)
      setIndex((i) => (i + d + slides.length) % slides.length)
    },
    [slides.length],
  )

  // Autoplay — paused while the user interacts; off under reduced motion.
  useEffect(() => {
    if (reduce || slides.length <= 1) return
    const id = setInterval(() => {
      if (!paused.current) {
        setDir(1)
        setIndex((i) => (i + 1) % slides.length)
      }
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [reduce, slides.length])

  const slide = slides[index]
  if (!slide) return null

  const variants = reduce
    ? undefined
    : {
        enter: (d: number) => ({ opacity: 0, x: d * 40 }),
        center: { opacity: 1, x: 0 },
        exit: (d: number) => ({ opacity: 0, x: d * -40 }),
      }

  const hold = () => (paused.current = true)
  const release = () => (paused.current = false)

  return (
    <div
      className="flex items-center gap-3 md:gap-6"
      onPointerEnter={hold}
      onPointerLeave={release}
      onFocusCapture={hold}
      onBlurCapture={release}
    >
      <NavArrow dir="prev" onClick={() => go(-1)} />

      <div className="relative flex-1 overflow-hidden rounded-[4px]">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={index}
            custom={dir}
            variants={variants}
            initial={reduce ? false : 'enter'}
            animate="center"
            exit="exit"
            transition={{ duration: DURATION.base, ease: EASE.soft }}
            className="grid grid-cols-1 overflow-hidden rounded-[4px] bg-white lg:grid-cols-2"
          >
            <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:min-h-[360px]">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-start justify-center gap-5 px-6 py-8 md:px-12 md:py-10">
              <h3 className="font-display text-[26px] font-semibold leading-[1.1] text-foreground md:text-[36px]">
                {slide.title}
              </h3>
              <p className="text-[17px] leading-[24px] text-muted">{slide.text}</p>
              <Link
                href={slide.href ?? cta.href}
                className="inline-flex items-center gap-3 rounded-[4px] bg-accent px-[18px] py-[13px] text-[17px] leading-[24px] text-white transition-colors hover:bg-foreground"
              >
                {cta.label}
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <NavArrow dir="next" onClick={() => go(1)} />
    </div>
  )
}

function NavArrow({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Προηγούμενο' : 'Επόμενο'}
      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-foreground text-foreground transition-colors hover:border-accent hover:text-accent active:scale-95 md:size-12"
    >
      <Icon className="size-5" strokeWidth={2} />
    </button>
  )
}
