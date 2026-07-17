'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, MapPin, User, LogOut } from 'lucide-react'
import { logoutCustomer } from '@/lib/medusa/customer-actions'
import { cn } from '@/lib/utils'
import type { Customer } from '@/lib/medusa/customer'

const NAV = [
  { href: '/account', label: 'Επισκόπηση', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Παραγγελίες', icon: Package },
  { href: '/account/addresses', label: 'Διευθύνσεις', icon: MapPin },
  { href: '/account/profile', label: 'Στοιχεία', icon: User },
]

/** Account area chrome: title, a nav (sidebar on desktop, scrollable pills on
 *  mobile) + logout, with the page content beside it. */
export function AccountShell({
  customer,
  children,
}: {
  customer: Customer
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || customer.email

  return (
    <section className="container-page py-8 md:py-12">
      <div className="mb-6 flex flex-col gap-1 md:mb-8">
        <h1 className="font-display text-[28px] font-bold leading-[1.1] text-foreground md:text-[38px]">
          Ο λογαριασμός μου
        </h1>
        <p className="text-[15px] text-muted">
          Καλωσορίσατε, <span className="text-foreground">{name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[248px_1fr] lg:gap-12">
        {/* Nav — scrollable pills on mobile (min-w-0 lets the track shrink so
            the row scrolls instead of widening the page), sidebar on lg+. */}
        <nav className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <ul className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
            {NAV.map((item) => {
              const active =
                item.href === '/account'
                  ? pathname === '/account'
                  : pathname.startsWith(item.href)
              return (
                <li key={item.href} className="shrink-0 lg:shrink">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 whitespace-nowrap rounded-[6px] px-3.5 py-2.5 text-[15px] font-medium transition-colors',
                      active
                        ? 'bg-accent text-white'
                        : 'text-foreground hover:bg-offwhite',
                    )}
                  >
                    <item.icon className="size-[18px] shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
            <li className="shrink-0 lg:mt-2 lg:border-t lg:border-border lg:pt-2">
              <form action={logoutCustomer}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 whitespace-nowrap rounded-[6px] px-3.5 py-2.5 text-[15px] font-medium text-muted transition-colors hover:bg-offwhite hover:text-foreground"
                >
                  <LogOut className="size-[18px] shrink-0" aria-hidden="true" />
                  Αποσύνδεση
                </button>
              </form>
            </li>
          </ul>
        </nav>

        {/* Content */}
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}
