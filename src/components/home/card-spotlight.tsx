'use client'

import { useEffect, useRef } from 'react'

/**
 * Cursor-following spotlight overlay for the hero cards (à la bpwcyprus.com):
 * a soft radial glow tracks the pointer across the card, fading in on enter.
 * Listens on the parent <article> so it can stay pointer-events-none (clicks
 * pass through to the card). Skipped on touch / no-hover devices.
 */
export function CardSpotlight({
  color = 'rgba(241,172,16,0.22)',
  radius = 340,
}: {
  color?: string
  radius?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent) return
    if (window.matchMedia('(hover: none)').matches) return

    const onMove = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    const onEnter = () => (el.style.opacity = '1')
    const onLeave = () => (el.style.opacity = '0')

    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseenter', onEnter)
    parent.addEventListener('mouseleave', onLeave)
    return () => {
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseenter', onEnter)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 ease-out"
      style={{
        background: `radial-gradient(circle ${radius}px at var(--mx, 50%) var(--my, 50%), ${color}, transparent 62%)`,
      }}
    />
  )
}
