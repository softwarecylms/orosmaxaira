'use client'

import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'

/**
 * The "wow" layer for the adopt-a-hive banner: the real honeycomb photo turned
 * into a looping video (rendered offline with ffmpeg — a slow Ken Burns drift,
 * a sunlight glint sweeping the comb, and gentle light breathing; see
 * scripts/render-adopt-video.sh). Transparent areas of the source were
 * flattened onto the banner gold so the edges fade seamlessly. The still photo
 * is the poster (instant paint) and the reduced-motion fallback.
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
            poster={image}
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
