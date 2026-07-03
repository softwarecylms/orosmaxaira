'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/** Background for the CTA/form band: an autoplaying, muted, looping video with
 *  an accent overlay. Falls back to the poster (form-bg.webp) until a
 *  form-bg.mp4 / .webm is added. Plays via effect (paused under reduced motion)
 *  so server/client markup match. */
export function FormVideoBg() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (reduce) v.pause()
    else v.play().catch(() => {})
  }, [reduce])

  return (
    <>
      <video
        ref={ref}
        className="pointer-events-none absolute inset-0 size-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/form-bg.webp"
        aria-hidden="true"
      >
        <source src="/videos/form-bg.mp4" type="video/mp4" />
        <source src="/videos/form-bg.webm" type="video/webm" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-accent/80" />
    </>
  )
}
