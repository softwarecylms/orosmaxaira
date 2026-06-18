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
        <RevealUp className="flex items-center justify-center gap-4 sm:justify-between">
          <h2 className="text-center font-display text-[28px] font-semibold leading-[1.05] text-foreground sm:text-left md:text-[41px] md:leading-[40px]">
            {CATEGORIES.heading}
          </h2>
          <CtaLink href={CATEGORIES.cta.href} variant="link" className="hidden shrink-0 sm:inline-flex">
            {CATEGORIES.cta.label}
          </CtaLink>
        </RevealUp>
        <RevealGroup className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {CATEGORIES.items.map((cat) => (
            <RevealItem key={cat.title}>
              <Link
                href={cat.href}
                className="group flex h-[248px] flex-col items-center justify-center gap-3 rounded-[4px] bg-offwhite px-4 sm:h-[360px] sm:gap-4 sm:px-6 md:h-[434px] md:gap-5"
              >
                <div className="relative h-[120px] w-full sm:h-[210px] sm:w-[270px] sm:max-w-full md:h-[255px] md:w-[301px]">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(min-width:1024px) 301px, (min-width:640px) 45vw, 40vw"
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-center text-[15px] font-medium leading-[20px] text-foreground sm:text-[20px] sm:leading-[26.4px] md:text-[22px]">
                  {cat.title}
                </h3>
                <ArrowRight className="size-[15px] text-accent transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:scale-110" />
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
