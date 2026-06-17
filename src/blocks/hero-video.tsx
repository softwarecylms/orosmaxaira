'use client'

import * as React from 'react'
import Image from 'next/image'
import { Container } from '@/components/ui/section'
import { LinkButton } from '@/components/ui/button'
import { SparkleIcon } from '@/components/icons/sparkle-icon'
import { RevealMountItem, RevealMountStagger } from '@/components/motion/reveal'
import { useMotionReady } from '@/components/motion/motion-ready'
import { useReducedMotion } from 'framer-motion'
import { mediaSrc, mediaAlt, cn } from '@/lib/utils'

type Link = { label?: string | null; href?: string | null; newTab?: boolean | null } | null

type Block = {
  eyebrow?: string | null
  heading?: string | null
  subheading?: string | null
  /** Public path or CDN URL to an h.264 MP4 (keep < 2MB, muted, seamless loop). */
  mp4Src?: string | null
  /** Optional VP9/AV1 WebM source for smaller payloads on supporting browsers. */
  webmSrc?: string | null
  /** Poster image (Payload media) — first paint + the reduced-motion fallback. Required for a good LCP. */
  poster?: unknown
  posterFallback?: string | null
  primaryCta?: Link
  overlay?: 'none' | 'dark' | 'gradient' | null
  height?: 'screen' | 'large' | 'medium' | null
}

const heightClass: Record<NonNullable<Block['height']>, string> = {
  screen: 'min-h-[100svh]',
  large: 'min-h-[70vh] md:min-h-[80vh]',
  medium: 'min-h-[50vh] md:min-h-[60vh]',
}

const overlayClass: Record<NonNullable<Block['overlay']>, string> = {
  none: '',
  dark: 'bg-black/45',
  gradient: 'bg-gradient-to-t from-black/70 via-black/30 to-black/10',
}

export function HeroVideoRender({ block }: { block: Block }) {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()
  const [videoReady, setVideoReady] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const posterSrc = mediaSrc(block.poster) ?? block.posterFallback ?? undefined
  const posterAltText = mediaAlt(block.poster, block.heading ?? 'Background video')
  const showVideo = Boolean(ready && !reduceMotion && block.mp4Src)
  const height = block.height ?? 'large'
  const overlay = block.overlay ?? 'gradient'
  const cta = block.primaryCta

  // If the video is cached and fires events before React attaches the listener,
  // reconcile readiness on mount.
  React.useEffect(() => {
    if (!showVideo) return
    const el = videoRef.current
    if (el && el.readyState >= 3) setVideoReady(true)
  }, [showVideo])

  return (
    <section
      className={cn('relative isolate overflow-hidden bg-surface-dark', heightClass[height])}
      data-testid="hero-video-section"
    >
      {/* Base layer: poster image — instant paint + reduced-motion fallback. */}
      {posterSrc ? (
        <Image
          src={posterSrc}
          alt={posterAltText}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-dark" aria-hidden="true" />
      )}

      {/* Video layer — only when motion is allowed; fades in once it can play. */}
      {showVideo ? (
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-700 ease-soft',
            videoReady ? 'opacity-100' : 'opacity-0',
          )}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          onCanPlayThrough={() => setVideoReady(true)}
          aria-hidden="true"
        >
          {block.webmSrc ? <source src={block.webmSrc} type="video/webm" /> : null}
          {block.mp4Src ? <source src={block.mp4Src} type="video/mp4" /> : null}
        </video>
      ) : null}

      {/* Legibility overlay. */}
      {overlay !== 'none' ? (
        <div className={cn('absolute inset-0', overlayClass[overlay])} aria-hidden="true" />
      ) : null}

      {/* Content. */}
      <Container className="relative z-10 flex min-h-[inherit] flex-col items-center justify-center py-24 text-center text-white md:py-32">
        <RevealMountStagger className="flex w-full flex-col items-center">
          {block.eyebrow ? (
            <RevealMountItem>
              <div className="mb-6 inline-flex items-center gap-3 rounded-pill bg-white/10 px-[17px] py-2 backdrop-blur-sm">
                <SparkleIcon className="shrink-0 text-white" />
                <span className="text-[14px] leading-[21px] text-white">{block.eyebrow}</span>
              </div>
            </RevealMountItem>
          ) : null}

          {block.heading ? (
            <RevealMountItem>
              <h1 className="max-w-4xl whitespace-pre-line text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-[3.75rem]">
                {block.heading}
              </h1>
            </RevealMountItem>
          ) : null}

          {block.subheading ? (
            <RevealMountItem>
              <p className="mt-5 max-w-2xl text-[15.9px] leading-relaxed text-white/80 md:text-base">
                {block.subheading}
              </p>
            </RevealMountItem>
          ) : null}

          {cta?.label && cta?.href ? (
            <RevealMountItem>
              <div className="mt-8">
                <LinkButton
                  href={cta.href}
                  target={cta.newTab ? '_blank' : undefined}
                  size="lg"
                  variant="primary"
                  withIcon
                  className="h-[49px] rounded-[40px] px-9 text-[17px]"
                >
                  {cta.label}
                </LinkButton>
              </div>
            </RevealMountItem>
          ) : null}
        </RevealMountStagger>
      </Container>
    </section>
  )
}
