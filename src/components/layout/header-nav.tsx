'use client'

import { useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ArrowRight } from '@/components/home/icons'
import type { MegaColumn } from '@/components/home/home-content'
import type { PartnerMenu } from '@/components/shop/shop-content'
import { getShopUi } from '@/components/shop/shop-ui'

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

/** A muted link in the products menu — 32px rows, a long one wraps tight. */
const MEGA_LINK = 'block py-[5px] text-[15px] leading-[22px] text-muted transition-colors hover:text-accent'
/** A column title in the products menu. */
const MEGA_TITLE = 'text-[15px] font-bold leading-[22px] text-foreground transition-colors hover:text-accent'

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
  const grid = { gridTemplateColumns: `repeat(${Math.max(mega.length, 4)}, minmax(0, 1fr))` }

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
        <ul className="flex items-center gap-6 xl:gap-[39px]">
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
                  className="flex items-center gap-1.5 whitespace-nowrap text-[16px] text-foreground transition-colors hover:text-accent xl:text-[17px]"
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
          className="whitespace-nowrap text-[16px] text-foreground transition-colors hover:text-accent xl:text-[17px]"
        >
          <span className="bee-flutter">🐝</span> {adopt.label}
        </Link>
      </nav>

      {/* Mega menu panel — Προϊόντα only. Όρος Μαχαιρά's columns, and below them a
          band for the partner brands on the same column grid. */}
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
          <div className="grid gap-6 px-8 py-7" style={grid}>
            {mega.map((col) => (
              <div key={col.title} className="flex min-w-0 flex-col gap-2">
                <Link
                  href={col.href}
                  onClick={close}
                  className={MEGA_TITLE}
                >
                  {col.title}
                </Link>
                <ul className="flex flex-col">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} onClick={close} className={MEGA_LINK}>
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
                  <ArrowRight className="size-[13px]" />
                </Link>
              </div>
            ))}
          </div>

          {partners ? (
            <PartnerBand partners={partners} columns={grid} onNavigate={close} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * The partner brands' band at the foot of the products menu, on Όρος Μαχαιρά's
 * column grid: the section's title, intro and categories in the first column,
 * and a card per brand across the others — its products and its categories.
 */
function PartnerBand({
  partners,
  columns,
  onNavigate,
}: {
  partners: PartnerMenu
  columns: React.CSSProperties
  onNavigate: () => void
}) {
  const t = useTranslations('nav')
  const ui = getShopUi(useLocale())

  return (
    <div className="grid gap-6 bg-cream px-8 py-6" style={columns}>
      <div className="flex min-w-0 flex-col gap-2">
        <Link
          href={partners.href}
          onClick={onNavigate}
          className={MEGA_TITLE}
        >
          {partners.title}
        </Link>
        <p className="text-[13px] leading-[19px] text-muted">{t('partnerIntro')}</p>
        <ul className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[14px] leading-[21px]">
          {partners.categories.map((c) => (
            // The separator trails each link, so a wrapped line never starts with one.
            <li key={c.href} className="after:ml-1.5 after:text-muted after:content-['·'] last:after:content-none">
              <Link href={c.href} onClick={onNavigate} className="text-foreground transition-colors hover:text-accent">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={partners.href}
          onClick={onNavigate}
          className="mt-0.5 inline-flex items-center gap-1.5 self-start text-[14px] font-medium text-accent transition-colors hover:text-gold-strong"
        >
          {t('partnerAll')}
          <ArrowRight className="size-[12px]" />
        </Link>
      </div>

      <ul
        className="grid gap-4"
        style={{ gridColumn: '2 / -1', gridTemplateColumns: `repeat(${Math.max(partners.brands.length, 3)}, minmax(0, 1fr))` }}
      >
        {partners.brands.map((b) => (
          <li key={b.href} className="flex flex-col rounded-[8px] bg-white px-[18px] py-4">
            <Link
              href={b.href}
              onClick={onNavigate}
              className="font-display text-[20px] leading-[1.15] text-foreground transition-colors hover:text-accent"
            >
              {b.label}
            </Link>
            <span className="mt-0.5 text-[12px] leading-[17px] text-muted">{ui.count(b.count)}</span>
            <ul className="mt-2.5 flex flex-col border-t border-border pt-1.5">
              {b.categories.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    onClick={onNavigate}
                    className="block py-[3px] text-[14px] leading-[21px] text-muted transition-colors hover:text-accent"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={b.href}
              onClick={onNavigate}
              aria-label={t('viewAll', { category: b.label })}
              className="mt-auto pt-2 text-accent transition-colors hover:text-gold-strong"
            >
              <ArrowRight className="size-[12px]" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
