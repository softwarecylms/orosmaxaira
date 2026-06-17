import Image from 'next/image'
import Link from 'next/link'
import { CATEGORIES } from './home-content'
import { CtaLink } from './cta-link'
import { ArrowRight } from './icons'
import { RevealUp, RevealGroup, RevealItem } from './reveal-up'

/** Section 6 — "Τα προϊόντα μας" category cards (Figma 156:1122). */
export function ProductCategories() {
  return (
    <section data-testid="product-categories" className="bg-white py-14 md:py-20">
      <div className="container-wide flex flex-col gap-7 md:gap-[30px]">
        <RevealUp className="flex items-center justify-between gap-4">
          <h2 className="font-display text-[28px] font-semibold leading-[1.05] text-foreground md:text-[41px] md:leading-[40px]">
            {CATEGORIES.heading}
          </h2>
          <CtaLink href={CATEGORIES.cta.href} variant="link" className="hidden shrink-0 sm:inline-flex">
            {CATEGORIES.cta.label}
          </CtaLink>
        </RevealUp>
        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.items.map((cat) => (
            <RevealItem key={cat.title}>
              <Link
                href={cat.href}
                className="group flex h-[320px] flex-col items-center justify-center gap-4 rounded-[4px] bg-offwhite px-6 md:h-[394px] md:gap-5"
              >
                <div className="relative h-[210px] w-[270px] max-w-full md:h-[255px] md:w-[301px]">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(min-width:1024px) 301px, (min-width:640px) 45vw, 80vw"
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-center text-[20px] font-medium leading-[26.4px] text-foreground md:text-[22px]">
                  {cat.title}
                </h3>
                <ArrowRight className="size-[15px] text-accent" />
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
