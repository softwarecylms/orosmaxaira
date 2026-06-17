'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ArrowRight } from '@/components/home/icons'
import type { MegaColumn } from '@/components/home/home-content'

type NavItem = { label: string; href: string; children?: unknown }

/**
 * Desktop nav row with the "Προϊόντα" mega menu (Figma 305:2612).
 * The panel opens on hover/focus of any nav item that has `children` and stays
 * open while the pointer is over the trigger or the panel (short close delay so
 * the cursor can travel between them).
 */
export function HeaderNav({
  nav,
  adopt,
  mega,
}: {
  nav: NavItem[]
  adopt: { label: string; href: string }
  mega: MegaColumn[]
}) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMenu = () => {
    if (timer.current) clearTimeout(timer.current)
    setOpen(true)
  }
  const scheduleClose = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <div
      className="relative hidden lg:block"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false)
      }}
    >
      <nav className="flex items-center justify-between py-3.5" aria-label="Κύρια πλοήγηση">
        <ul className="flex items-center gap-[39px]">
          {nav.map((item) => {
            const hasMega = Boolean(item.children)
            return (
              <li
                key={item.label}
                onMouseEnter={hasMega ? openMenu : undefined}
                onMouseLeave={hasMega ? scheduleClose : undefined}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 text-[17px] text-foreground transition-colors hover:text-accent"
                  aria-haspopup={hasMega ? 'true' : undefined}
                  aria-expanded={hasMega ? open : undefined}
                  onFocus={hasMega ? openMenu : undefined}
                >
                  {item.label}
                  {hasMega ? (
                    <ChevronDown
                      className={cn(
                        'size-3 text-muted transition-transform duration-200',
                        open && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
        <Link
          href={adopt.href}
          className="text-[17px] text-foreground transition-colors hover:text-accent"
        >
          🐝 {adopt.label}
        </Link>
      </nav>

      {/* Mega menu panel */}
      <div
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        className={cn(
          'absolute left-0 top-full z-50 pt-3 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
          open
            ? 'visible translate-y-0 opacity-100'
            : 'pointer-events-none invisible -translate-y-1 opacity-0',
        )}
      >
        <div
          role="menu"
          aria-label="Προϊόντα"
          className="flex w-[1321px] max-w-[calc(100vw-2.5rem)] gap-[33px] rounded-[4px] bg-white p-[45px] shadow-[0_0_12px_rgba(35,31,32,0.1)]"
        >
          {mega.map((col) => (
            <div key={col.title} className="flex min-w-0 flex-1 flex-col gap-[15px]">
              <Link
                href={col.href}
                onClick={() => setOpen(false)}
                className="text-[17px] font-bold leading-[24px] text-foreground transition-colors hover:text-accent"
              >
                {col.title}
              </Link>
              <ul className="flex flex-col">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="block text-[17px] leading-[39px] text-muted transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={col.href}
                onClick={() => setOpen(false)}
                aria-label={`Δείτε όλα — ${col.title}`}
                className="text-accent transition-colors hover:text-gold-strong"
              >
                <ArrowRight className="size-[15px]" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
