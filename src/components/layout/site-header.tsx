import Link from 'next/link'
import Image from 'next/image'
import { Phone, ChevronDown, User, Heart, ShoppingBag, Truck } from 'lucide-react'
import { retrieveCart } from '@/lib/medusa/actions'
import { formatPrice } from '@/lib/medusa/prices'
import { NAV, ADOPT_LINK, CONTACT, MEGA_MENU } from '@/components/home/home-content'
import { HeaderSearch } from './header-search'
import { HeaderMobile } from './header-mobile'
import { HeaderNav } from './header-nav'
import { HeaderScrollShadow } from './header-scroll-shadow'
import { HeaderReveal } from './header-reveal'

type SiteHeaderProps = {
  header?: unknown
  settings?: unknown
  variant?: 'default' | 'dark'
}

/**
 * OROS MACHAIRA header (Figma 156:1218): announcement bar + utility row
 * (search, phone, language, account, wishlist, cart) + nav row. Search /
 * language / wishlist are visual stubs; the cart pill reads the live Medusa cart.
 */
export async function SiteHeader(_props: SiteHeaderProps) {
  const cart = await retrieveCart().catch(() => null)
  const currency = cart?.currency_code ?? cart?.region?.currency_code ?? 'eur'
  const total = formatPrice(cart?.total ?? 0, currency, 'en-US')
  const count = cart?.items?.reduce((n, i) => n + (i.quantity ?? 0), 0) ?? 0

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 bg-white transition-shadow duration-300 data-[scrolled=true]:shadow-[0_6px_24px_-14px_rgba(35,31,32,0.22)]"
    >
      <HeaderScrollShadow />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-white"
      >
        Μετάβαση στο περιεχόμενο
      </a>

      {/* Announcement bar */}
      <HeaderReveal className="flex h-[46px] items-center justify-center gap-2 bg-accent px-4 text-white">
        <Truck className="size-4 shrink-0" aria-hidden="true" />
        <p className="text-center text-[13px] leading-[21px] md:text-[14px]">
          <span className="font-display text-[15px] font-bold">ΔΩΡΕΑΝ </span>
          αποστολή σε όλες τις παραγγελίες άνω των €70
        </p>
      </HeaderReveal>

      <div className="container-wide">
        {/* Utility row */}
        <HeaderReveal
          delay={0.08}
          className="flex items-center justify-between gap-6 border-b border-border py-[15px]"
        >
          <Link href="/" aria-label="Όρος Μαχαιρά — Αρχική" className="shrink-0">
            <Image
              src="/images/home/logo.svg"
              alt="Όρος Μαχαιρά"
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
              className="flex h-[47px] items-center justify-center gap-2.5 whitespace-nowrap rounded-[8px] border border-paper px-4 text-[14px] text-foreground transition-colors hover:border-accent"
            >
              <Phone className="size-5 text-accent" aria-hidden="true" />
              {CONTACT.phone}
            </a>

            <button
              type="button"
              className="flex items-center gap-1 text-[17px] text-foreground"
              aria-label="Επιλογή γλώσσας"
            >
              ΕΛ <ChevronDown className="size-3" aria-hidden="true" />
            </button>

            <span className="h-9 w-px bg-border" aria-hidden="true" />

            <button type="button" aria-label="Λογαριασμός" className="text-foreground hover:text-accent">
              <User className="size-6" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label="Λίστα επιθυμιών"
              className="relative text-foreground hover:text-accent"
            >
              <Heart className="size-6" aria-hidden="true" />
              <span className="absolute -right-1.5 -top-1 flex size-[15px] items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
                0
              </span>
            </button>

            <span className="h-9 w-px bg-border" aria-hidden="true" />

            <Link
              href="/"
              data-testid="header-cart"
              className="flex items-center gap-3 text-foreground hover:text-accent"
            >
              <span className="relative">
                <ShoppingBag className="size-6" aria-hidden="true" />
                <span className="absolute -right-1.5 -top-1 flex size-[15px] items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
                  {count}
                </span>
              </span>
              <span className="text-[17px]">{total}</span>
            </Link>
          </div>

          {/* Mobile utilities */}
          <div className="flex items-center gap-4 lg:hidden">
            <Link href="/" data-testid="header-cart" className="relative text-foreground">
              <ShoppingBag className="size-6" aria-hidden="true" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1 flex size-[15px] items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
                  {count}
                </span>
              )}
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
  )
}
