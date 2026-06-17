import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import type { Header as HeaderGlobal, SiteSetting } from '@/payload-types'
import { LinkButton } from '@/components/ui/button'
import { MobileNav, type NavItem } from '@/components/layout/mobile-nav'
import { NavDropdown } from '@/components/layout/nav-dropdown'
import { HeaderScrollBackdrop } from '@/components/layout/header-scroll-backdrop'
import { cn, mediaSrc } from '@/lib/utils'

type SiteHeaderProps = {
  header: HeaderGlobal | null | undefined
  settings: SiteSetting | null | undefined
  variant?: 'default' | 'dark'
}

const fallbackNav: NavItem[] = [
  { label: 'Home', href: '/', newTab: false },
  { label: 'About', href: '/about', newTab: false },
  { label: 'Services', href: '/services', newTab: false },
  { label: 'Blog', href: '/blog', newTab: false },
  { label: 'Contact', href: '/contact', newTab: false },
]

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

function ServicesChevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 8 8"
      className={className}
      aria-hidden="true"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1.12 1.70667L4 4.58667L6.88 1.70667L8 2.29333L4 6.29333L0 2.29333L1.12 1.70667Z" />
    </svg>
  )
}

function mapHeaderNav(header: HeaderGlobal | null | undefined): NavItem[] {
  if (!header?.nav?.length) return fallbackNav

  return header.nav.map((entry) => {
    const link = entry.link
    const children = (entry.children ?? [])
      .map((child) => {
        const childLink = child.link
        return {
          label: childLink?.label ?? '',
          href: childLink?.href ?? '#',
          newTab: childLink?.newTab ?? false,
        }
      })
      .filter((child) => child.label && child.href)

    return {
      label: link?.label ?? '',
      href: link?.href ?? '#',
      newTab: link?.newTab ?? false,
      children: children.length ? children : undefined,
    }
  })
}

export async function SiteHeader({ header, settings, variant = 'default' }: SiteHeaderProps) {
  const pathname = (await headers()).get('x-pathname') ?? '/'
  const items = mapHeaderNav(header)
  const isDark = variant === 'dark'

  const logoUrl = mediaSrc(settings?.logo)
  const callback = (settings as { callbackCta?: { label?: string; href?: string } } | null)
    ?.callbackCta
  const callbackHref = callback?.href ?? '/contact'
  const callbackLabel = callback?.label ?? 'Request a callback'

  return (
    <header
      className={cn('sticky top-0 z-40', isDark ? 'pt-2 md:pt-3' : 'pt-5 md:pt-[22px]')}
    >
      {isDark ? <HeaderScrollBackdrop /> : null}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>

      <div className="container-page">
        <div
          className={cn(
            'relative mx-auto grid max-w-[1282px] grid-cols-[auto_1fr_auto] items-center px-5 md:px-8 lg:px-10',
            isDark
              ? 'h-[68px]'
              : 'h-[78px] rounded-[50px] bg-white shadow-[0_8px_40px_-24px_rgba(20,20,20,0.15)]',
          )}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center justify-self-start"
            aria-label="Home"
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={settings?.siteName ?? 'Logo'}
                width={171}
                height={33}
                priority
                className={cn(
                  'h-[33px] w-[171px] max-w-none',
                  isDark && 'brightness-0 invert',
                )}
              />
            ) : (
              <span
                className={cn(
                  'font-display text-[22px] font-bold tracking-tight',
                  isDark ? 'text-white' : 'text-foreground',
                )}
              >
                {settings?.siteName ?? 'Your Brand'}
              </span>
            )}
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center justify-center gap-8 justify-self-center md:flex"
          >
            {items.map((item) => {
              const active = isNavItemActive(pathname, item)

              if (item.children?.length) {
                return (
                  <NavDropdown
                    key={`${item.label}-${item.href}`}
                    label={item.label}
                    children={item.children}
                    active={active}
                    pathname={pathname}
                    isDark={isDark}
                    chevron={
                      <ServicesChevron
                        className={cn(
                          'ml-0.5 size-2 shrink-0',
                          active
                            ? 'text-white/90'
                            : isDark
                              ? 'text-white/60'
                              : 'text-foreground/70',
                        )}
                      />
                    }
                  />
                )
              }

              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  target={item.newTab ? '_blank' : undefined}
                  rel={item.newTab ? 'noopener noreferrer' : undefined}
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
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center justify-self-end">
            <LinkButton
              href={callbackHref}
              size="sm"
              variant="primary"
              withIcon
              className={cn(
                'hidden h-[42px] min-w-[227px] rounded-[40px] px-7 text-[17px] font-semibold md:inline-flex',
                isDark && 'bg-white text-[#09090b] hover:bg-white/90',
              )}
            >
              {callbackLabel}
            </LinkButton>
            <MobileNav
              items={items}
              pathname={pathname}
              callbackHref={callbackHref}
              callbackLabel={callbackLabel}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
