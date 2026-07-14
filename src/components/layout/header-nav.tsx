'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ArrowRight } from '@/components/home/icons'
import type { MegaColumn } from '@/components/home/home-content'

type NavLink = { label: string; href: string }
type NavItem = {
  label: string
  href: string
  children?: NavLink[]
  groups?: { title: string; links: NavLink[] }[]
}

const MEGA_LABEL = 'Προϊόντα'

/**
 * Desktop nav row. "Προϊόντα" opens the product mega menu; any other item with
 * `children` opens a simple dropdown beneath it. Menus open on hover/focus and
 * stay open while the pointer is over the trigger or the panel (short close delay).
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
  const [openItem, setOpenItem] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMenu = (label: string) => {
    if (timer.current) clearTimeout(timer.current)
    setOpenItem(label)
  }
  const scheduleClose = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpenItem(null), 120)
  }
  const close = () => {
    if (timer.current) clearTimeout(timer.current)
    setOpenItem(null)
  }

  return (
    <div
      className="relative hidden lg:block"
      onKeyDown={(e) => {
        if (e.key === 'Escape') close()
      }}
    >
      <nav className="flex items-center justify-between py-3.5" aria-label="Κύρια πλοήγηση">
        <ul className="flex items-center gap-[39px]">
          {nav.map((item) => {
            const hasDropdown = Boolean(item.children || item.groups)
            const isOpen = openItem === item.label
            return (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={hasDropdown ? () => openMenu(item.label) : undefined}
                onMouseLeave={hasDropdown ? scheduleClose : undefined}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 text-[17px] text-foreground transition-colors hover:text-accent"
                  aria-haspopup={hasDropdown ? 'true' : undefined}
                  aria-expanded={hasDropdown ? isOpen : undefined}
                  onFocus={hasDropdown ? () => openMenu(item.label) : undefined}
                >
                  {item.label}
                  {hasDropdown ? (
                    <ChevronDown
                      className={cn(
                        'size-3 text-muted transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                  ) : null}
                </Link>

                {/* Grouped dropdown (titled sub-menus) — e.g. Δραστηριότητες */}
                {item.groups ? (
                  <div
                    onMouseEnter={() => openMenu(item.label)}
                    onMouseLeave={scheduleClose}
                    className={cn(
                      'absolute left-0 top-full z-50 pt-3 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
                      isOpen
                        ? 'visible translate-y-0 opacity-100'
                        : 'pointer-events-none invisible -translate-y-1 opacity-0',
                    )}
                  >
                    <div
                      role="menu"
                      aria-label={item.label}
                      className="flex gap-10 rounded-[4px] bg-white p-6 shadow-[0_0_12px_rgba(35,31,32,0.1)]"
                    >
                      {item.groups.map((group) => (
                        <div key={group.title} className="flex min-w-[210px] flex-col gap-2.5">
                          <span className="px-3 text-[13px] font-bold uppercase tracking-[0.08em] text-gold-strong">
                            {group.title}
                          </span>
                          <ul className="flex flex-col">
                            {group.links.map((l) => (
                              <li key={l.label}>
                                <Link
                                  href={l.href}
                                  onClick={close}
                                  className="block rounded-[4px] px-3 py-2 text-[16px] leading-[24px] text-muted transition-colors hover:bg-offwhite hover:text-accent"
                                >
                                  {l.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Simple dropdown for non-mega items with children */}
                {item.children && item.label !== MEGA_LABEL ? (
                  <div
                    onMouseEnter={() => openMenu(item.label)}
                    onMouseLeave={scheduleClose}
                    className={cn(
                      'absolute left-0 top-full z-50 pt-3 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
                      isOpen
                        ? 'visible translate-y-0 opacity-100'
                        : 'pointer-events-none invisible -translate-y-1 opacity-0',
                    )}
                  >
                    <ul
                      role="menu"
                      aria-label={item.label}
                      className="flex min-w-[260px] flex-col rounded-[4px] bg-white p-2 shadow-[0_0_12px_rgba(35,31,32,0.1)]"
                    >
                      {item.children.map((c) => (
                        <li key={c.label}>
                          <Link
                            href={c.href}
                            onClick={close}
                            className="block rounded-[4px] px-4 py-2.5 text-[16px] leading-[24px] text-muted transition-colors hover:bg-offwhite hover:text-accent"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
        <Link
          href={adopt.href}
          className="text-[17px] text-foreground transition-colors hover:text-accent"
        >
          <span className="bee-flutter">🐝</span> {adopt.label}
        </Link>
      </nav>

      {/* Mega menu panel — Προϊόντα only */}
      <div
        onMouseEnter={() => openMenu(MEGA_LABEL)}
        onMouseLeave={scheduleClose}
        className={cn(
          'absolute left-0 top-full z-50 pt-3 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
          openItem === MEGA_LABEL
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
                onClick={close}
                className="text-[17px] font-bold leading-[24px] text-foreground transition-colors hover:text-accent"
              >
                {col.title}
              </Link>
              <ul className="flex flex-col">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      onClick={close}
                      className="block text-[17px] leading-[39px] text-muted transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={col.href}
                onClick={close}
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
