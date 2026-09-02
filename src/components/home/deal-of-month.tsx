import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getHomeContent, type HoneyProduct } from './home-content'
import { listShopProducts } from '@/lib/medusa/shop'
import { categoryLabel } from '@/components/shop/shop-content'
import { CtaLink } from './cta-link'
import { DealCarousel } from './deal-carousel'
import { ArrowRight } from './icons'
import { RevealUp } from './reveal-up'

/** Section 4 — "Τα Διαμάντια του Μαχαιρά" (Figma 118:456). */
export async function DealOfMonth({ products }: { products?: HoneyProduct[] }) {
  const locale = await getLocale()
  const { DEAL } = getHomeContent(locale)
  const curated = (products?.length ? products : DEAL.products).slice(0, 5)

  // Prices come from Medusa (the shop is the source of truth) so a card can never
  // advertise a different price from the product page. The curated list keeps its
  // own order, images and titles; only the price is taken live. If Medusa is
  // unreachable the static price stays as the fallback.
  const catalogue = await listShopProducts().catch(() => null)
  const items = catalogue
    ? curated.map((p) => {
        const handle = p.href.match(/\/product\/([^/]+)/)?.[1]
        const live = handle ? catalogue.products.find((x) => x.handle === handle) : undefined
        // Category too: Royal Jelly and Mead are Bee Products, not Honey.
        return live
          ? { ...p, price: live.price, category: categoryLabel(live.category, locale) }
          : p
      })
    : curated

  return (
    <section data-testid="deal-of-month" className="bg-offwhite py-12 md:py-[70px]">
      <div className="container-wide">
        <div className="flex flex-col overflow-hidden rounded-[4px] lg:flex-row">
          {/* Featured photo card */}
          <Link
            href={DEAL.featured.href}
            className="group relative flex min-h-[340px] items-end justify-center overflow-hidden lg:min-h-[492px] lg:w-[396px] lg:shrink-0"
          >
            <Image
              src={DEAL.featured.image}
              alt={DEAL.featured.imageAlt}
              fill
              sizes="(min-width:1024px) 396px, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
            <RevealUp className="relative z-10 mb-12 flex flex-col items-center gap-2 px-6 text-center">
              <h3 className="font-display text-[22px] font-bold leading-[28px] text-white">
                {DEAL.featured.title}
              </h3>
              <ArrowRight className="size-4 text-white" />
            </RevealUp>
          </Link>

          {/* White panel */}
          <div className="flex flex-1 flex-col justify-center gap-7 bg-white px-5 py-8 sm:px-8 lg:gap-[30px] lg:py-10 lg:pl-10 lg:pr-[50px]">
            <RevealUp className="flex items-center justify-between gap-4">
              <h2 className="font-display text-[26px] font-semibold leading-[1.08] text-foreground md:text-[36px] lg:text-[41px] lg:leading-[40px]">
                {DEAL.heading}
              </h2>
              <CtaLink href={DEAL.cta.href} variant="link" className="hidden shrink-0 sm:inline-flex">
                {DEAL.cta.label}
              </CtaLink>
            </RevealUp>
            <DealCarousel products={items} />
          </div>
        </div>
      </div>
    </section>
  )
}
