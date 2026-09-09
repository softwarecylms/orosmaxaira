'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Tag, Truck } from 'lucide-react'
import { DURATION, EASE } from '@/lib/motion'

/**
 * The announcement bar, cycling through the current offers.
 *
 * Each message holds for `HOLD_MS` and then cross-fades to the next. Rotation
 * pauses on hover and on keyboard focus, so a message can always be read in
 * full (WCAG 2.2.2) — and it never starts at all when there is only one thing
 * to say.
 *
 * The bar sits above the sticky header and is `aria-live="polite"`, so a screen
 * reader hears each offer once rather than being interrupted mid-sentence.
 */

/**
 * Each icon gets an entrance that means something: the truck drives in from the
 * left, the tag swings down as if hung on the price. They replay on every
 * rotation, which is the only motion here — no idle loop, so the bar is still
 * for most of the four seconds it holds.
 */
const ICONS = {
  truck: {
    Glyph: Truck,
    from: { x: -14, opacity: 0 },
    to: { x: 0, opacity: 1 },
    ease: EASE.emphasis,
    duration: DURATION.base,
  },
  tag: {
    Glyph: Tag,
    from: { rotate: -35, scale: 0.6, opacity: 0 },
    to: { rotate: 0, scale: 1, opacity: 1 },
    ease: EASE.bounce,
    duration: DURATION.ui,
  },
} as const

export type Announcement = {
  /** Leading word, set in the display face (e.g. «ΔΩΡΕΑΝ», "10%"). */
  bold: string
  /** The rest of the sentence — rich text, so a fragment can be emphasised. */
  rest: ReactNode
  /** A shorter tail for narrow screens. */
  restShort: ReactNode
  icon: keyof typeof ICONS
}

/** How long each message stays up. */
const HOLD_MS = 4000

export function AnnouncementRotator({ messages }: { messages: Announcement[] }) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (messages.length < 2 || paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), HOLD_MS)
    return () => clearInterval(id)
  }, [messages.length, paused])

  const current = messages[index] ?? messages[0]
  if (!current) return null
  const { Glyph, from, to, ease, duration } = ICONS[current.icon]

  return (
    <div
      className="relative flex min-h-[46px] items-center justify-center px-4 py-2 md:h-[46px] md:min-h-0 md:py-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: reduced ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -6 }}
          transition={{ duration: DURATION.fast, ease: EASE.soft }}
        >
          <motion.span
            className="flex shrink-0 items-center"
            initial={reduced ? { opacity: 0 } : from}
            animate={reduced ? { opacity: 1 } : to}
            // Lands just after the line has settled, so the icon reads as the
            // punctuation of the sentence rather than racing it.
            transition={{ duration, ease, delay: reduced ? 0 : DURATION.fast }}
          >
            <Glyph className="size-4" aria-hidden="true" />
          </motion.span>
          <p className="text-center text-[13px] leading-[21px] md:text-[14px]">
            <span className="font-display text-[15px] font-bold">{current.bold} </span>
            <span className="md:hidden">{current.restShort}</span>
            <span className="hidden md:inline">{current.rest}</span>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
