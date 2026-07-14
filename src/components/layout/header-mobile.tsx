'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeaderSearch } from './header-search'

type NavLink = { label: string; href: string }
type NavItem = {
  label: string
  href: string
  children?: NavLink[]
  groups?: { title: string; links: NavLink[] }[]
}

export function HeaderMobile({
  nav,
  adopt,
  phone,
}: {
  nav: NavItem[]
  adopt: { label: string; href: string }
  phone: { label: string; href: string }
}) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Άνοιγμα μενού"
        className="text-foreground"
      >
        <Menu className="size-7" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Κλείσιμο μενού"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[320px] max-w-[88vw] flex-col gap-6 overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-center justify-end">
              <button type="button" onClick={() => setOpen(false)} aria-label="Κλείσιμο">
                <X className="size-6 text-foreground" />
              </button>
            </div>

            <HeaderSearch />

            <nav className="flex flex-col" aria-label="Κινητή πλοήγηση">
              {nav.map((item) => {
                const hasMenu = Boolean(item.children || item.groups)
                if (!hasMenu) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="border-b border-border py-3 text-[17px] text-foreground"
                    >
                      {item.label}
                    </Link>
                  )
                }
                return (
                  <div key={item.label} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                      aria-expanded={expanded === item.label}
                      className="flex w-full items-center justify-between py-3 text-[17px] text-foreground"
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          'size-4 text-muted transition-transform',
                          expanded === item.label && 'rotate-180',
                        )}
                      />
                    </button>
                    {expanded === item.label ? (
                      item.groups ? (
                        <div className="flex flex-col gap-2 pb-2">
                          {item.groups.map((group) => (
                            <div key={group.title} className="flex flex-col">
                              <span className="py-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-gold-strong">
                                {group.title}
                              </span>
                              <ul className="flex flex-col">
                                {group.links.map((l) => (
                                  <li key={l.label}>
                                    <Link
                                      href={l.href}
                                      onClick={() => setOpen(false)}
                                      className="block py-2 pl-4 text-[15px] text-muted transition-colors hover:text-accent"
                                    >
                                      {l.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ul className="flex flex-col pb-2">
                          {item.children!.map((c) => (
                            <li key={c.label}>
                              <Link
                                href={c.href}
                                onClick={() => setOpen(false)}
                                className="block py-2 pl-4 text-[15px] text-muted transition-colors hover:text-accent"
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )
                    ) : null}
                  </div>
                )
              })}
              <Link
                href={adopt.href}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-[17px] text-foreground"
              >
                🐝 {adopt.label}
              </Link>
            </nav>

            <div className="flex flex-col">
              <Link
                href="/terms"
                onClick={() => setOpen(false)}
                className="py-2 text-[15px] text-muted transition-colors hover:text-accent"
              >
                Όροι &amp; Προϋποθέσεις
              </Link>
              <Link
                href="/privacy"
                onClick={() => setOpen(false)}
                className="py-2 text-[15px] text-muted transition-colors hover:text-accent"
              >
                Πολιτική Απορρήτου
              </Link>
            </div>

            <a
              href={phone.href}
              className="mt-auto flex items-center gap-2.5 text-[19px] font-medium text-accent"
            >
              <Phone className="size-6 shrink-0" />
              {phone.label}
            </a>
          </div>
        </div>
      )}
    </>
  )
}
