'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type NavItem = {
  label: string
  href: string
  newTab: boolean
  children?: NavItem[]
}

type MobileNavProps = {
  items: NavItem[]
  pathname: string
  callbackHref: string
  callbackLabel: string
}

function isActive(pathname: string, href: string) {
  if (href === '/' || href === '#') return pathname === '/'
  return pathname.startsWith(href)
}

function isNavItemActive(pathname: string, item: NavItem) {
  if (item.children?.length) {
    return item.children.some((child) => isActive(pathname, child.href)) || isActive(pathname, item.href)
  }
  return isActive(pathname, item.href)
}

export function MobileNav({ items, pathname, callbackHref, callbackLabel }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)
  const [expanded, setExpanded] = React.useState<string | null>(null)

  return (
    <>
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-full border border-border-strong/30 md:hidden"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] rounded-[24px] border border-border-strong/10 bg-white shadow-[0_20px_50px_-24px_rgba(20,20,20,0.25)] md:hidden">
          <nav aria-label="Mobile" className="flex flex-col px-5 py-4" data-testid="mobile-nav">
            {items.map((item) => {
              const active = isNavItemActive(pathname, item)
              const hasChildren = Boolean(item.children?.length)
              const expandedItem = expanded === item.label

              if (hasChildren) {
                return (
                  <div key={`m-${item.label}`} className="flex flex-col">
                    <button
                      type="button"
                      aria-expanded={expandedItem}
                      data-testid={`mobile-nav-${item.label.toLowerCase()}-toggle`}
                      onClick={() => setExpanded((value) => (value === item.label ? null : item.label))}
                      className={cn(
                        'flex items-center justify-between rounded-[40px] px-4 py-3 text-left text-base font-medium',
                        active ? 'bg-accent text-white' : 'text-foreground/90',
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn('size-4 transition-transform', expandedItem && 'rotate-180')}
                        aria-hidden="true"
                      />
                    </button>
                    {expandedItem ? (
                      <div className="ml-3 flex flex-col gap-1 pb-2 pl-3" data-testid="mobile-nav-services-menu">
                        {item.children!.map((child) => (
                          <Link
                            key={`m-${child.label}-${child.href}`}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            target={child.newTab ? '_blank' : undefined}
                            rel={child.newTab ? 'noopener noreferrer' : undefined}
                            className={cn(
                              'rounded-[20px] px-4 py-2.5 text-[15px] font-medium',
                              isActive(pathname, child.href)
                                ? 'bg-accent-soft text-accent'
                                : 'text-foreground/90',
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              }

              return (
                <Link
                  key={`m-${item.label}-${item.href}`}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  target={item.newTab ? '_blank' : undefined}
                  rel={item.newTab ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'rounded-[40px] px-4 py-3 text-base font-medium',
                    active ? 'bg-accent text-white' : 'text-foreground/90',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <LinkButton
              href={callbackHref}
              variant="primary"
              withIcon
              className="mt-4 self-start rounded-[40px]"
              onClick={() => setOpen(false)}
            >
              {callbackLabel}
            </LinkButton>
          </nav>
        </div>
      ) : null}
    </>
  )
}
