import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'
import type { Footer as FooterGlobal, SiteSetting } from '@/payload-types'
import { mediaSrc, cn } from '@/lib/utils'

type SiteFooterProps = {
  footer: FooterGlobal | null | undefined
  settings: SiteSetting | null | undefined
  variant?: 'default' | 'dark'
}

export function SiteFooter({ footer, settings, variant = 'default' }: SiteFooterProps) {
  const columns = footer?.columns ?? []
  const badges = footer?.badges ?? []
  const social = settings?.social as Record<string, string | undefined> | undefined
  const logoUrl = mediaSrc(settings?.logo)
  const isDark = variant === 'dark'

  return (
    <footer
      className={cn(
        'border-t',
        isDark ? 'border-white/10 bg-[#09090b] text-white' : 'border-border bg-background',
      )}
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div className="container-page py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center" aria-label="Home">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={settings?.siteName ?? 'Logo'}
                  width={150}
                  height={32}
                  className={cn('h-8 w-auto', isDark && 'brightness-0 invert')}
                />
              ) : (
                <span className="text-xl font-bold">{settings?.siteName ?? 'Your Brand'}</span>
              )}
            </Link>
            {settings?.tagline ? (
              <p className={cn('text-sm max-w-xs', isDark ? 'text-white/50' : 'text-muted')}>
                {settings.tagline}
              </p>
            ) : null}
            <ul className="mt-4 flex gap-3" aria-label="Social media">
              {social?.facebook ? (
                <li>
                  <Link
                    href={social.facebook}
                    aria-label="Facebook"
                    className={cn(
                      'size-9 inline-flex items-center justify-center rounded-full border transition-colors',
                      isDark
                        ? 'border-white/15 hover:bg-white/10'
                        : 'border-border-strong/30 hover:bg-foreground/5',
                    )}
                  >
                    <Facebook className="size-4" />
                  </Link>
                </li>
              ) : null}
              {social?.instagram ? (
                <li>
                  <Link
                    href={social.instagram}
                    aria-label="Instagram"
                    className={cn(
                      'size-9 inline-flex items-center justify-center rounded-full border transition-colors',
                      isDark
                        ? 'border-white/15 hover:bg-white/10'
                        : 'border-border-strong/30 hover:bg-foreground/5',
                    )}
                  >
                    <Instagram className="size-4" />
                  </Link>
                </li>
              ) : null}
              {social?.linkedin ? (
                <li>
                  <Link
                    href={social.linkedin}
                    aria-label="LinkedIn"
                    className={cn(
                      'size-9 inline-flex items-center justify-center rounded-full border transition-colors',
                      isDark
                        ? 'border-white/15 hover:bg-white/10'
                        : 'border-border-strong/30 hover:bg-foreground/5',
                    )}
                  >
                    <Linkedin className="size-4" />
                  </Link>
                </li>
              ) : null}
              {social?.youtube ? (
                <li>
                  <Link
                    href={social.youtube}
                    aria-label="YouTube"
                    className={cn(
                      'size-9 inline-flex items-center justify-center rounded-full border transition-colors',
                      isDark
                        ? 'border-white/15 hover:bg-white/10'
                        : 'border-border-strong/30 hover:bg-foreground/5',
                    )}
                  >
                    <Youtube className="size-4" />
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="md:col-span-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col, idx) => (
              <div key={`fc-${idx}`} className="flex flex-col gap-3">
                <h3
                  className={cn(
                    'text-sm font-semibold uppercase tracking-wide',
                    isDark ? 'text-white/70' : 'text-foreground/80',
                  )}
                >
                  {col.heading}
                </h3>
                <ul className="flex flex-col gap-2">
                  {(col.links ?? []).map((l, i) => {
                    const link = (l as { link?: { label?: string; href?: string; newTab?: boolean } }).link
                    if (!link?.href) return null
                    return (
                      <li key={`fl-${idx}-${i}`}>
                        <Link
                          href={link.href}
                          target={link.newTab ? '_blank' : undefined}
                          rel={link.newTab ? 'noopener noreferrer' : undefined}
                          className={cn(
                            'text-sm transition-colors',
                            isDark
                              ? 'text-white/50 hover:text-white'
                              : 'text-muted hover:text-foreground',
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'mt-12 flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between',
            isDark ? 'border-white/10' : 'border-border',
          )}
        >
          <p className={cn('text-xs', isDark ? 'text-white/45' : 'text-muted')}>
            {footer?.bottomNote ?? '© Your Brand. All rights reserved.'}
          </p>
          {badges.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {badges.map((b, i) => (
                <li
                  key={`badge-${i}`}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs',
                    isDark ? 'border-white/15' : 'border-border-strong/30',
                  )}
                >
                  <span className="font-semibold">{b.label}</span>
                  {b.sublabel ? (
                    <span className={isDark ? 'text-white/45' : 'text-muted'}>{b.sublabel}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
