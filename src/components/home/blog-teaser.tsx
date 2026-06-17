import Image from 'next/image'
import Link from 'next/link'
import { BLOG } from './home-content'
import { CtaLink } from './cta-link'
import { RevealUp, RevealGroup, RevealItem } from './reveal-up'

/** Section 10 — "Ο Κόσμος της Μέλισσας & της Φύσης" blog teaser (Figma 118:631). */
export function BlogTeaser() {
  return (
    <section data-testid="blog-teaser" className="bg-offwhite py-12 md:py-[70px]">
      <div className="container-wide flex flex-col gap-7 md:gap-[30px]">
        <RevealUp className="flex items-center justify-between gap-4">
          <h2 className="font-display text-[22px] font-semibold leading-[1.12] text-foreground md:text-[41px] md:leading-[40px]">
            {BLOG.heading}
          </h2>
          <CtaLink href={BLOG.cta.href} variant="link" className="hidden shrink-0 sm:inline-flex">
            {BLOG.cta.label}
          </CtaLink>
        </RevealUp>

        <RevealGroup
          className="grid gap-7 lg:grid-cols-[1040fr_610fr] lg:gap-[30px]"
          stagger={0.12}
        >
          {/* Featured article */}
          <RevealItem className="h-full">
            <Link
              href={BLOG.featured.href}
              className="group flex h-full w-full flex-col overflow-hidden rounded-[4px] bg-white sm:flex-row sm:items-center sm:gap-[50px]"
            >
              <div className="relative aspect-[471/427] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-[427px] sm:w-[471px]">
                <Image
                  src={BLOG.featured.image}
                  alt={BLOG.featured.imageAlt}
                  fill
                  sizes="(min-width:1024px) 471px, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-col items-start gap-5 p-6 sm:max-w-[418px] sm:p-0 sm:pr-6">
                <span className="rounded-[20px] bg-accent px-[11px] py-[5px] text-[14px] leading-[21px] text-white">
                  {BLOG.badge}
                </span>
                <h3 className="text-[22px] font-medium leading-[26.4px] text-foreground">
                  {BLOG.featured.title}
                </h3>
                <p className="text-[17px] leading-[24px] text-muted">{BLOG.featured.excerpt}</p>
                <div className="flex items-center gap-2.5">
                  <Image
                    src={BLOG.featured.avatar}
                    alt={BLOG.featured.author}
                    width={20}
                    height={20}
                    className="size-5 rounded-full object-cover"
                  />
                  <p className="text-[14px] leading-[21px]">
                    <span className="text-muted">by</span>{' '}
                    <span className="text-foreground">{BLOG.featured.author}</span>
                  </p>
                </div>
              </div>
            </Link>
          </RevealItem>

          {/* Two stacked articles */}
          <RevealItem className="h-full">
            <div className="flex h-full flex-col justify-between gap-5">
              {BLOG.items.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="group flex items-stretch gap-4 overflow-hidden rounded-[4px] bg-white sm:gap-[25px]"
                >
                  <div className="relative aspect-[262/203] w-[130px] shrink-0 overflow-hidden sm:aspect-auto sm:h-[203px] sm:w-[262px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="262px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-col items-start justify-center gap-3 py-4 pr-4 sm:w-[288px] sm:gap-[17px] sm:py-0">
                    <span className="rounded-[20px] bg-accent px-[11px] py-[5px] text-[13px] leading-[13px] text-white">
                      {BLOG.badge}
                    </span>
                    <h3 className="text-[17px] font-semibold leading-[24px] text-foreground">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  )
}
