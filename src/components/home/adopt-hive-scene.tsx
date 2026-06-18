'use client'

import Image from 'next/image'
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

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      <div className="absolute inset-y-0 left-0 w-[58%] overflow-hidden">
        {reduce ? (
          <Image src={image} alt={alt} fill sizes="58vw" className="object-cover" />
        ) : (
          <video
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

        {/* Fade the footage into the gold band */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-accent" />
      </div>
    </div>
  )
}
