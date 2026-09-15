'use client'

import { useEffect, useState } from 'react'

const POLL_MS = 60_000

/**
 * The count bubble on the sidebar's «Orders» link. Starts from the count the
 * server rendered, then re-reads it every minute and whenever the tab regains
 * focus — the sidebar stays mounted while editors move around the admin.
 */
export default function NewOrdersBadge({ initial }: { initial: number | null }) {
  const [count, setCount] = useState(initial)

  useEffect(() => {
    let alive = true
    const refresh = () =>
      fetch('/api/medusa/new-orders', { credentials: 'include', cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((body) => {
          if (alive && body && (typeof body.count === 'number' || body.count === null)) setCount(body.count)
        })
        .catch(() => {})
    const timer = window.setInterval(refresh, POLL_MS)
    const onFocus = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      alive = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [])

  if (!count) return null
  return (
    <span className="medusa-links__badge" aria-label={`${count} new orders`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}
