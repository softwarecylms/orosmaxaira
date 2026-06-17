import Link from 'next/link'
import { MapPin } from 'lucide-react'

export function MapFacade({ href }: { href?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.06),transparent_50%)]">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-white text-foreground">
        <MapPin className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm text-white/80">Visit us</p>
      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline text-white/70 hover:text-white"
        >
          Open in Google Maps
        </Link>
      ) : null}
    </div>
  )
}
