import { cn } from '@/lib/utils'

/** Render `text`, wrapping any of the `bold` phrases in a <strong> and any phrase
 *  in `links` in an <a href>. Pure, server-safe helper shared across sections. */
export function BoldText({
  text,
  bold,
  links,
  className = 'font-semibold text-foreground',
}: {
  text: string
  bold?: readonly string[]
  links?: Record<string, string>
  className?: string
}) {
  const phrases = [...new Set([...(bold ?? []), ...(links ? Object.keys(links) : [])])]
  if (!phrases.length) return <>{text}</>
  const re = new RegExp(
    `(${phrases
      .sort((a, b) => b.length - a.length)
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')})`,
  )
  return (
    <>
      {text.split(re).map((part, i) => {
        const href = links?.[part]
        const strong = bold?.includes(part)
        if (href) {
          return (
            <a
              key={i}
              href={href}
              className={cn(
                'underline underline-offset-2 transition-opacity hover:opacity-80',
                strong && className,
              )}
            >
              {part}
            </a>
          )
        }
        if (strong) {
          return (
            <strong key={i} className={className}>
              {part}
            </strong>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
