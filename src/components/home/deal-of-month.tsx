import Image from 'next/image'
import Link from 'next/link'
import { DEAL, type HoneyProduct } from './home-content'
import { CtaLink } from './cta-link'
import { ProductCardHoney } from './product-card-honey'
import { ArrowRight } from './icons'
import { RevealUp, RevealGroup, RevealItem } from './reveal-up'

/** Section 4 — "Τα Διαμάντια του Μαχαιρά" (Figma 118:456). */
export function DealOfMonth({ products }: { products?: HoneyProduct[] }) {
  const items = (products?.length ? products : DEAL.products).slice(0, 5)

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
              <h3 className="font-display text-[22px] font-bold capitalize leading-[28px] text-white">
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
            <RevealGroup
              className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:flex lg:justify-between lg:gap-0 [&::-webkit-scrollbar]:hidden"
              stagger={0.07}
            >
              {items.map((p, i) => (
                <RevealItem
                  key={i}
                  className="w-[calc(50%-0.5rem)] shrink-0 snap-start sm:w-auto sm:shrink lg:w-[216.8px] lg:shrink-0"
                >
                  <ProductCardHoney product={p} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  )
}
