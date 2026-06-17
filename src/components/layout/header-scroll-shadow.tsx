'use client'

import { useEffect, useRef } from 'react'

/**
 * Toggles `data-scrolled` on the parent <header> once the page is scrolled, so
 * the sticky header gains a subtle bottom shadow (see the header className).
 * Renders nothing visible.
 */
export function HeaderScrollShadow() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const header = ref.current?.closest('header')
    if (!header) return
    const onScroll = () => {
      header.setAttribute('data-scrolled', String(window.scrollY > 4))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <span ref={ref} aria-hidden="true" className="hidden" />
}
