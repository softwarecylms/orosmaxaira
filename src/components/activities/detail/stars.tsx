import { Star } from 'lucide-react'
import { getActivitiesUi } from '@/components/activities/activities-content'

/** Row of 5 stars filled to `value` (rounded). Presentational, server-safe. */
export function Stars({
  value,
  className,
  locale = 'el',
}: {
  value: number
  className?: string
  locale?: string
}) {
  const rounded = Math.round(value)
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className ?? ''}`}
      aria-label={getActivitiesUi(locale).starsAria(value.toFixed(1))}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i + 1 <= rounded
        return (
          <Star
            key={i}
            className={`size-[17px] ${filled ? 'fill-accent text-accent' : 'fill-transparent text-border'}`}
            strokeWidth={filled ? 0 : 1.5}
            aria-hidden="true"
          />
        )
      })}
    </span>
  )
}
