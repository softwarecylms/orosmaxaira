import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Phone, User, Heart, Truck } from 'lucide-react'
import { CartBadge } from '@/components/commerce/cart-badge'
import { getHomeContent } from '@/components/home/home-content'
import type { Locale } from '@/i18n/routing'
import { HeaderSearch } from './header-search'
import { HeaderMobile } from './header-mobile'
import { HeaderNav } from './header-nav'
import { HeaderScrollShadow } from './header-scroll-shadow'
import { HeaderReveal } from './header-reveal'
import { LanguageSwitcher } from './language-switcher'

type SiteHeaderProps = {
  header?: unknown
  settings?: unknown
  variant?: 'default' | 'dark'
  locale: Locale
}

/**
 * OROS MACHAIRA header (Figma 156:1218): announcement bar + utility row
 * (search, phone, language, account, wishlist, cart) + nav row. Search /
 * wishlist are visual stubs; the cart pill (<CartBadge>) reads the client-side
 * honey cart. Content is locale-aware via getHomeContent(locale).
 */
export async function SiteHeader({ locale }: SiteHeaderProps) {
  const t = await getTranslations('header')
  const { NAV, ADOPT_LINK, CONTACT, MEGA_MENU } = getHomeContent(locale)

  return (
    <>
      {/* Announcement bar — scrolls away with the page; it is intentionally
          NOT part of the sticky header below. */}
      <HeaderReveal className="flex min-h-[46px] items-center justify-center gap-2 bg-accent px-4 py-2 text-white md:h-[46px] md:min-h-0 md:py-0">
        <Truck className="size-4 shrink-0" aria-hidden="true" />
        <p className="text-center text-[13px] leading-[21px] md:text-[14px]">
          <span className="font-display text-[15px] font-bold">{t('freeShippingBold')} </span>
          <span className="md:hidden">{t('freeShippingRestShort')}</span>
          <span className="hidden md:inline">{t('freeShippingRest')}</span>
        </p>
      </HeaderReveal>

      <header
        data-testid="site-header"
        className="sticky top-0 z-40 bg-white transition-shadow duration-300 data-[scrolled=true]:shadow-[0_6px_24px_-14px_rgba(35,31,32,0.22)]"
      >
        <HeaderScrollShadow />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-white"
        >
          {t('skipToContent')}
        </a>

        <div className="container-wide">
        {/* Utility row */}
        <HeaderReveal
          delay={0.08}
          className="flex items-center justify-between gap-6 border-b border-border py-[15px]"
        >
          <Link href="/" aria-label={t('logoHome')} className="shrink-0">
            <Image
              src="/images/home/logo.svg"
              alt={t('logoAlt')}
              width={165}
              height={59}
              priority
              className="h-[42px] w-auto lg:h-[59px]"
            />
          </Link>

          {/* Desktop utilities */}
          <div className="hidden items-center gap-5 lg:flex">
            <HeaderSearch className="w-[300px] xl:w-[463px]" />

            <a
              href={CONTACT.phoneHref}
              className="flex h-[47px] items-center justify-center gap-2.5 whitespace-nowrap rounded-[8px] border border-paper px-4 text-[14px] text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <Phone className="size-5 text-accent" aria-hidden="true" />
              {CONTACT.phone}
            </a>

            <LanguageSwitcher />

            <span className="h-9 w-px bg-border" aria-hidden="true" />

            <Link href="/account" aria-label={t('account')} className="text-foreground hover:text-accent">
              <User className="size-6" aria-hidden="true" />
            </Link>

            <button
              type="button"
              aria-label={t('wishlist')}
              className="relative text-foreground hover:text-accent"
            >
              <Heart className="size-6" aria-hidden="true" />
              <span className="absolute -right-1.5 -top-1 flex size-[15px] items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
                0
              </span>
            </button>

            <span className="h-9 w-px bg-border" aria-hidden="true" />

            <CartBadge variant="desktop" />
          </div>

          {/* Mobile utilities */}
          <div className="flex items-center gap-4 lg:hidden">
            <CartBadge variant="mobile" />
            <Link href="/account" aria-label={t('account')} className="text-foreground">
              <User className="size-6" aria-hidden="true" />
            </Link>
            <HeaderMobile
              nav={NAV}
              adopt={ADOPT_LINK}
              phone={{ label: CONTACT.phone, href: CONTACT.phoneHref }}
            />
          </div>
        </HeaderReveal>

        {/* Nav row with the Προϊόντα mega menu */}
        <HeaderReveal delay={0.16}>
          <HeaderNav nav={NAV} adopt={ADOPT_LINK} mega={MEGA_MENU} />
        </HeaderReveal>
        </div>
      </header>
    </>
  )
}
