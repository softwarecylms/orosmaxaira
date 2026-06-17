'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Testimonial } from '@/payload-types'
import { mediaSrc, mediaAlt } from '@/lib/utils'

type TestimonialsCarouselProps = {
  heading?: string | null
  items: Testimonial[]
}

const avatarByAuthor: Record<string, string> = {}

export function TestimonialsCarousel({ heading, items }: TestimonialsCarouselProps) {
  const [index, setIndex] = React.useState(0)
  const reduceMotion = useReducedMotion()
  const current = items[index]

  if (!current) return null

  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1))
  const next = () => setIndex((i) => (i === items.length - 1 ? 0 : i + 1))

  const slideVariants = reduceMotion
    ? undefined
    : {
        enter: { opacity: 0, x: 28 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -28 },
      }

  const avatarSrc = mediaSrc(current.photo) ?? avatarByAuthor[current.author]

  return (
    <div
      className="flex h-full flex-col rounded-[30px] bg-accent-soft p-8 md:p-10"
      data-testid="testimonials-carousel"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="max-w-md font-display text-[20px] leading-[30px] text-foreground">
          {heading ?? 'What Our Clients Are Expressing About Their Growth Experience'}
        </h2>
        <Link
          href="/contact"
          aria-label="Contact us"
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-[24px] bg-surface-dark text-white transition-transform duration-200 hover:scale-105"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M3 4c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h1.5L3 13.5V11H3a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h2v3H3V4Zm7 0c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h1.5L10 13.5V11H10a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h2v3h-2V4Z" />
          </svg>
        </Link>
      </div>

      <div className="relative mt-8 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            variants={slideVariants}
            initial={reduceMotion ? false : 'enter'}
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <blockquote className="text-[15px] leading-[28.05px] text-foreground md:text-[17px]">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <div className="mt-8 flex items-center gap-3" data-testid="testimonial-author-row">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={mediaAlt(current.photo, current.author)}
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="size-10 shrink-0 rounded-full bg-pink" />
              )}
              <div>
                <p className="text-[13.9px] font-bold leading-[23.1px] text-muted">
                  {current.author}
                </p>
                {current.role ? (
                  <p className="text-[13px] leading-[21.45px] text-muted">{current.role}</p>
                ) : null}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-end gap-2">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous testimonial"
          className="inline-flex size-9 items-center justify-center rounded-[18px] bg-accent text-white transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next testimonial"
          className="inline-flex size-9 items-center justify-center rounded-[18px] bg-accent text-white transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

type CtaPanelProps = {
  heading?: string
  body?: string
  href?: string
}

export function JourneyCtaPanel({
  heading = 'Ready to Begin Your Journey Toward Lasting Success?',
  body = 'Get in touch for anything related to your online presence.',
  href = '/contact',
}: CtaPanelProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-[30px] bg-pink p-8 md:min-h-full md:p-10">
      {reduceMotion ? (
        <div
          className="pointer-events-none absolute -bottom-8 -right-8 size-72 rounded-full bg-white/25"
          aria-hidden="true"
        />
      ) : (
        <motion.div
          className="pointer-events-none absolute -bottom-8 -right-8 size-72 rounded-full bg-white/25"
          aria-hidden="true"
          animate={{ scale: [1, 1.08, 1], x: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <h2 className="relative max-w-xs text-xl font-bold leading-snug text-foreground">{heading}</h2>
      <div className="relative flex items-end justify-between gap-4">
        <p className="max-w-[220px] text-sm leading-relaxed text-foreground">{body}</p>
        <Link
          href={href}
          aria-label="Get in touch"
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-dark text-white transition-transform duration-200 hover:scale-105"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
