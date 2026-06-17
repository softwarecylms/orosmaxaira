'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * A subtle dark blurred bar that appears once you scroll past the hero,
 * so the white nav text stays readable when the home alternates into
 * light sections (Problem, Bento, Testimonials, Blog, FAQ).
 *
 * Renders inside the <header> as a sibling of the nav, absolute-positioned
 * with `-z-10` so it sits behind the nav content within the header's own
 * stacking context.
 */
export function HeaderScrollBackdrop() {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 -top-2 bottom-0 -z-10 transition-opacity duration-500 ease-out md:-top-3',
        scrolled ? 'opacity-100' : 'opacity-0',
      )}
      aria-hidden
    >
      <div className="h-full border-b border-white/[0.06] bg-[#0a0910]/85 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,black_72%,transparent_100%)]" />
    </div>
  )
}
