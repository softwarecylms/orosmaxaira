import Image from 'next/image'
import { HERITAGE } from './home-content'
import { CtaLink } from './cta-link'
import { RevealUp } from './reveal-up'

/** Section 8 — "Από γενιά σε γενιά" heritage block (Figma 118:600). */
export function Heritage() {
  return (
    <section data-testid="heritage" className="bg-offwhite py-12 md:py-[70px]">
      <div className="container-wide">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10 xl:gap-[80px] xl:pr-[60px]">
          <RevealUp className="relative aspect-[843/625] w-full shrink-0 overflow-hidden rounded-[4px] lg:w-1/2">
            <Image
              src={HERITAGE.image}
              alt={HERITAGE.imageAlt}
              fill
              sizes="(min-width:1024px) 50vw, 100vw"
              className="home-img-breathe object-cover"
            />
          </RevealUp>
          <RevealUp delay={0.1} className="flex flex-col items-center gap-5 text-center lg:flex-1 lg:items-start lg:text-left">
            <h2 className="font-display text-[28px] font-semibold leading-[1.05] text-foreground md:text-[41px] md:leading-[40px]">
              {HERITAGE.heading}
            </h2>
            <div className="flex flex-col gap-4 text-[17px] leading-[24px] text-muted">
              {HERITAGE.paragraphs.map((para, i) => (
                <p key={i}>
                  {para.map((seg, j) =>
                    seg.bold ? (
                      <strong key={j} className="font-bold text-foreground">
                        {seg.text}
                      </strong>
                    ) : (
                      <span key={j}>{seg.text}</span>
                    ),
                  )}
                </p>
              ))}
            </div>
            <CtaLink href={HERITAGE.cta.href} variant="gold" className="mt-2">
              {HERITAGE.cta.label}
            </CtaLink>
          </RevealUp>
        </div>
      </div>
    </section>
  )
}
