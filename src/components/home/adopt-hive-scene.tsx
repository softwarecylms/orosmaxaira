'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * The "wow" layer for the adopt-a-hive banner: real macro footage of honeybees
 * working a honeycomb, lightly graded to match the brand photo and looped
 * seamlessly (see scripts/render-adopt-video.sh — sourced from Pexels, free
 * for commercial use). A frame of the footage is the poster (instant paint);
 * the original brand still is the reduced-motion fallback.
 */
export function AdoptHiveScene({ image, alt }: { image: string; alt: string }) {
  const reduce = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Mobile browsers (esp. iOS) often ignore the declarative `autoPlay` until
  // play() is called explicitly; muted + playsInline keeps it inline.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const tryPlay = () => {
      v.play().catch(() => {})
    }
    tryPlay()
    v.addEventListener('loadeddata', tryPlay, { once: true })
    return () => v.removeEventListener('loadeddata', tryPlay)
  }, [])

  return (
    // Below lg: a banner across the top of the card (content sits beneath it).
    // lg+: bleeds from the left behind the content.
    <div className="pointer-events-none relative h-[240px] w-full overflow-hidden sm:h-[300px] lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[58%]">
      {reduce ? (
        <Image src={image} alt={alt} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/adopt-hive-poster.jpg"
          aria-label={alt}
        >
          <source src="/videos/adopt-hive.webm" type="video/webm" />
          <source src="/videos/adopt-hive.mp4" type="video/mp4" />
        </video>
      )}

      {/* Mobile/tablet: fade DOWN into the gold content (transparent → accent). */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent lg:hidden" />
      {/* Desktop: fade RIGHT into the gold band. */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-accent/20 to-accent lg:block" />
    </div>
  )
}
