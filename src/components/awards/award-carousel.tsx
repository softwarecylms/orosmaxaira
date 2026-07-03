'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EASE } from '@/lib/motion'
import { AwardLightbox } from './award-lightbox'
import type { AwardImage } from './awards-manifest'

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? 36 : -36 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d > 0 ? -36 : 36 }),
}

/** One-image-at-a-time carousel for an award's photos. Arrows + dots/counter,
 *  click-to-zoom (full-screen lightbox). Images are `object-contain` on a soft
 *  frame so nothing is cropped (mixed portrait/landscape + the wide banner). */
export function AwardCarousel({ images, alt }: { images: AwardImage[]; alt: string }) {
  const [[i, dir], setState] = useState<[number, number]>([0, 0])
  const [open, setOpen] = useState<number | null>(null)
  const len = images.length
  if (len === 0) return null

  const goto = (n: number, d: number) => setState([(n + len) % len, d])

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-offwhite">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: EASE.snap }}
            className="absolute inset-0"
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label="Άνοιγμα φωτογραφίας σε πλήρη οθόνη"
              className="block size-full cursor-zoom-in"
            >
              <Image
                src={images[i].src}
                alt={`${alt} — φωτογραφία ${i + 1}`}
                fill
                sizes="(min-width:1024px) 45vw, 100vw"
                className="object-contain"
              />
            </button>
          </motion.div>
        </AnimatePresence>

        {len > 1 ? (
          <>
            <button
              type="button"
              aria-label="Προηγούμενη"
              onClick={() => goto(i - 1, -1)}
              className="absolute left-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-accent"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Επόμενη"
              onClick={() => goto(i + 1, 1)}
              className="absolute right-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-accent"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <span className="absolute bottom-2.5 right-3 rounded-full bg-foreground/70 px-2.5 py-1 text-[12px] font-medium text-white">
              {i + 1} / {len}
            </span>
          </>
        ) : null}
      </div>

      <AwardLightbox
        images={images}
        alt={alt}
        index={open}
        onClose={() => setOpen(null)}
        onIndex={setOpen}
      />
    </div>
  )
}
