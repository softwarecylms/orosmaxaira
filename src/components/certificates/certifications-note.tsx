'use client'

import { useLocale } from 'next-intl'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

/**
 * Discreet, text-only certifications note linking to the /certificates page.
 * Reused on activity, workshop and product detail pages (some of which are
 * client components), so this is a client component that reads the locale via
 * `useLocale()`. The whole box is a single link opening the certificates page in
 * a new tab. No badge imagery.
 */
export function CertificationsNote({ className }: { className?: string }) {
  const en = useLocale() === 'en'
  return (
    <Link
      href="/certificates"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={en ? 'See our certifications' : 'Δείτε τις πιστοποιήσεις'}
      className={cn(
        'group flex items-center justify-between gap-3 rounded-[12px] bg-accent-soft px-4 py-3.5 transition-colors hover:bg-accent/15',
        className,
      )}
    >
      <span className="flex items-center gap-2 text-[13.5px] leading-snug text-muted">
        <ShieldCheck className="size-4 shrink-0 text-gold-strong" aria-hidden="true" />
        <span>
          {en ? 'Certified to' : 'Πιστοποιημένοι με'}{' '}
          <span className="font-semibold text-foreground">ISO 14001</span> &{' '}
          <span className="font-semibold text-foreground">ISO 22000</span>
        </span>
      </span>
      <ArrowRight
        className="size-5 shrink-0 text-foreground transition-colors group-hover:text-accent"
        aria-hidden="true"
      />
    </Link>
  )
}
