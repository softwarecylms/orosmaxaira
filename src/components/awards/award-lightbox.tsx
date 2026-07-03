'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { EASE } from '@/lib/motion'
import type { AwardImage } from './awards-manifest'

/** Full-screen image viewer. Controlled: `index` is the open photo (null = closed).
 *  Esc / ← / → keyboard nav, click-backdrop to close, body-scroll lock. */
export function AwardLightbox({
  images,
  alt,
  index,
  onClose,
  onIndex,
}: {
  images: AwardImage[]
  alt: string
  index: number | null
  onClose: () => void
  onIndex: (i: number) => void
}) {
  const open = index !== null
  const len = images.length

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onIndex(((index as number) + 1) % len)
      else if (e.key === 'ArrowLeft') onIndex(((index as number) - 1 + len) % len)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, index, len, onClose, onIndex])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Προβολή φωτογραφίας"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/92 p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE.snap }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Κλείσιμο"
            className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          {len > 1 ? (
            <>
              <button
                type="button"
                aria-label="Προηγούμενη"
                onClick={(e) => {
                  e.stopPropagation()
                  onIndex(((index as number) - 1 + len) % len)
                }}
                className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-5"
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Επόμενη"
                onClick={(e) => {
                  e.stopPropagation()
                  onIndex(((index as number) + 1) % len)
                }}
                className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-5"
              >
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: EASE.snap }}
            className="relative h-[78vh] w-[min(92vw,1100px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[index as number].src}
              alt={`${alt} — φωτογραφία ${(index as number) + 1}`}
              fill
              sizes="(min-width:1100px) 1100px, 92vw"
              className="object-contain"
              priority
            />
          </motion.div>

          {len > 1 ? (
            <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[13px] font-medium text-white/80">
              {(index as number) + 1} / {len}
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
