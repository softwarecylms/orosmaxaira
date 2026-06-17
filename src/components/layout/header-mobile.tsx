'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { HeaderSearch } from './header-search'

type NavItem = { label: string; href: string; children?: { label: string; href: string }[] }

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
            <div className="flex items-center justify-between">
              <span className="font-display text-[18px] font-semibold text-foreground">Μενού</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Κλείσιμο">
                <X className="size-6 text-foreground" />
              </button>
            </div>

            <HeaderSearch />

            <nav className="flex flex-col" aria-label="Κινητή πλοήγηση">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-border py-3 text-[17px] text-foreground"
                >
                  {item.label}
                  {item.children ? <ChevronDown className="size-4 text-muted" /> : null}
                </Link>
              ))}
              <Link
                href={adopt.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[17px] font-medium text-accent"
              >
                🐝 {adopt.label}
              </Link>
            </nav>

            <a href={phone.href} className="mt-auto flex items-center gap-2 text-[15px] text-foreground">
              <Phone className="size-5 text-accent" />
              {phone.label}
            </a>
          </div>
        </div>
      )}
    </>
  )
}
