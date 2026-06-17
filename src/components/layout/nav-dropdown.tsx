'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type NavLink = {
  label: string
  href: string
  newTab: boolean
}

type NavDropdownProps = {
  label: string
  children: NavLink[]
  active: boolean
  pathname: string
  chevron: React.ReactNode
  isDark?: boolean
}

function isActive(pathname: string, href: string) {
  if (href === '/' || href === '#') return pathname === '/'
  return pathname.startsWith(href)
}

export function NavDropdown({
  label,
  children,
  active,
  pathname,
  chevron,
  isDark = false,
}: NavDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className="relative"
      data-testid="nav-dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        data-testid="nav-dropdown-trigger"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex h-[42px] items-center justify-center gap-1.5 text-[15.9px] font-medium leading-[26.4px] transition-colors',
          active
            ? isDark
              ? 'text-white'
              : 'min-w-[82px] rounded-[40px] bg-accent px-5 text-white'
            : isDark
              ? 'text-white/65 hover:text-white'
              : 'text-foreground hover:text-foreground/80',
        )}
      >
        {label}
        {chevron}
      </button>

      {open ? (
        <div
          role="menu"
          data-testid="nav-dropdown-menu"
          className={cn(
            'absolute left-1/2 top-[calc(100%+0.55rem)] z-50 min-w-[220px] -translate-x-1/2 rounded-[20px] border p-2',
            isDark
              ? 'border-white/10 bg-[#141417] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)]'
              : 'border-border-strong/10 bg-white shadow-[0_20px_50px_-24px_rgba(20,20,20,0.25)]',
          )}
        >
          {children.map((child) => (
            <Link
              key={`${child.label}-${child.href}`}
              href={child.href}
              role="menuitem"
              target={child.newTab ? '_blank' : undefined}
              rel={child.newTab ? 'noopener noreferrer' : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                'block rounded-[14px] px-4 py-3 text-[15px] font-medium leading-[24px] transition-colors',
                isActive(pathname, child.href)
                  ? isDark
                    ? 'bg-white/10 text-white'
                    : 'bg-accent-soft text-accent'
                  : isDark
                    ? 'text-white/70 hover:bg-white/5 hover:text-white'
                    : 'text-foreground hover:bg-background',
              )}
              data-testid={`nav-dropdown-link-${child.href.replace(/\//g, '').replace(/^$/, 'home')}`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
