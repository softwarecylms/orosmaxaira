'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ArrowRight } from '@/components/home/icons'
import type { MegaColumn } from '@/components/home/home-content'
import type { PartnerMenu } from '@/components/shop/shop-content'

type NavLink = { label: string; href: string }
type NavItem = {
  label: string
  href: string
  children?: NavLink[]
  groups?: { title: string; links: NavLink[] }[]
}

/** The nav item that opens the products mega menu — identified by its stable
 *  href (locale-independent), not its label. */
const MEGA_HREF = '/proionta'

/** Small gold caps label over a part of the products menu. */
const EYEBROW = 'text-[12px] font-bold uppercase leading-[18px] tracking-[0.08em] text-gold-strong'

/**
 * Desktop nav row. "Προϊόντα" opens the product mega menu — Όρος Μαχαιρά's
 * category columns, and below them, in a band of their own, the partner brands'
 * categories and brands; any other item with `children` opens a simple dropdown
 * beneath it. Menus open on hover/focus and stay open while the pointer is over
 * the trigger or the panel (short close delay).
 */
export function HeaderNav({
  nav,
  adopt,
  mega,
  partners,
}: {
  nav: NavItem[]
  adopt: { label: string; href: string }
  mega: MegaColumn[]
  /** The partner brands' part of the products menu (none while they have no listed products). */
  partners?: PartnerMenu | null
}) {
  const [openItem, setOpenItem] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('nav')
  const megaLabel = nav.find((i) => i.href === MEGA_HREF)?.label ?? ''

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
      <nav className="flex items-center justify-between py-3.5" aria-label={t('mainNav')}>
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

                {/* Grouped mega panel — aligned to the trigger's left edge,
                    styled like the Προϊόντα mega (black bold headings). */}
                {item.groups && item.href !== MEGA_HREF ? (
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
                      className="flex gap-[60px] rounded-[4px] bg-white p-[45px] shadow-[0_0_12px_rgba(35,31,32,0.1)]"
                    >
                      {item.groups.map((group) => (
                        <div key={group.title} className="flex min-w-[220px] flex-col gap-[15px]">
                          <span className="text-[17px] font-bold leading-[24px] text-foreground">
                            {group.title}
                          </span>
                          <ul className="flex flex-col">
                            {group.links.map((l) => (
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
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Simple dropdown for non-mega items with children */}
                {item.children && item.href !== MEGA_HREF ? (
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
        onMouseEnter={() => openMenu(megaLabel)}
        onMouseLeave={scheduleClose}
        className={cn(
          'absolute left-0 top-full z-50 pt-3 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
          openItem === megaLabel
            ? 'visible translate-y-0 opacity-100'
            : 'pointer-events-none invisible -translate-y-1 opacity-0',
        )}
      >
        <div
          role="menu"
          aria-label={megaLabel}
          className="w-[1321px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-[4px] bg-white shadow-[0_0_12px_rgba(35,31,32,0.1)]"
        >
          <div className="flex flex-col gap-[22px] p-[45px]">
          {partners ? <span className={EYEBROW}>{t('ownProducts')}</span> : null}
          <div className="flex gap-[33px]">
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
                      className="block py-[7.5px] text-[17px] leading-[24px] text-muted transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={col.href}
                onClick={close}
                aria-label={t('viewAll', { category: col.title })}
                className="text-accent transition-colors hover:text-gold-strong"
              >
                <ArrowRight className="size-[15px]" />
              </Link>
            </div>
          ))}
          </div>
          </div>

          {/* The partner brands — their own band, apart from Όρος Μαχαιρά's products */}
          {partners ? (
            <div className="flex gap-[50px] border-t border-border bg-cream px-[45px] py-[32px]">
              <div className="flex w-[300px] shrink-0 flex-col gap-2.5">
                <span className={EYEBROW}>{partners.title}</span>
                <p className="text-[15px] leading-[22px] text-muted">{t('partnerIntro')}</p>
                <Link
                  href={partners.href}
                  onClick={close}
                  className="mt-1 inline-flex items-center gap-2 self-start text-[15px] font-medium text-accent transition-colors hover:text-gold-strong"
                >
                  {t('partnerAll')}
                  <ArrowRight className="size-[13px]" />
                </Link>
              </div>
              {partners.categories.length ? (
                <div className="flex min-w-0 flex-1 flex-col gap-[15px]">
                  <span className="text-[17px] font-bold leading-[24px] text-foreground">
                    {t('partnerCategories')}
                  </span>
                  <ul className="grid grid-cols-2 gap-x-[33px] xl:grid-cols-3">
                    {partners.categories.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          onClick={close}
                          className="block py-[7.5px] text-[17px] leading-[24px] text-muted transition-colors hover:text-accent"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {partners.brands.length ? (
                <div className="flex w-[300px] shrink-0 flex-col gap-[15px]">
                  <span className="text-[17px] font-bold leading-[24px] text-foreground">
                    {t('partnerBrands')}
                  </span>
                  <ul className="flex flex-wrap gap-2.5">
                    {partners.brands.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          onClick={close}
                          className="block rounded-full border border-border bg-white px-4 py-2 text-[15px] leading-[20px] text-foreground transition-colors hover:border-accent hover:text-accent"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
