import Image from 'next/image'
import { ADOPT } from './home-content'
import { CtaLink } from './cta-link'
import { RevealUp } from './reveal-up'

/** Section 7 — "Υιοθετώ μια κυψέλη" gold banner (Figma 118:547). */
export function AdoptHiveBanner() {
  return (
    <section data-testid="adopt-hive" className="bg-white pb-12 pt-6 md:pb-[70px] md:pt-[35px]">
      <div className="container-wide">
        <div className="relative isolate overflow-hidden rounded-[4px] bg-accent">
          {/* Bee photo bleeding from the left, fading into the gold */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[58%] lg:block">
            <Image
              src={ADOPT.image}
              alt={ADOPT.imageAlt}
              fill
              sizes="58vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-accent" />
          </div>

          <RevealUp className="relative z-10 flex flex-col items-start gap-5 px-7 py-10 md:px-12 md:py-[40px] lg:ml-auto lg:w-[50%] lg:pl-0 lg:pr-[80px]">
            <p className="text-[14px] uppercase leading-[21px] text-cream">{ADOPT.eyebrow}</p>
            <div className="flex flex-col gap-2.5">
              <h2 className="font-display text-[28px] font-semibold leading-[1.05] text-white md:text-[41px] md:leading-[40px]">
                {ADOPT.heading}
              </h2>
              <p className="max-w-[600px] text-[17px] leading-[24px] text-cream">{ADOPT.body}</p>
            </div>
            <CtaLink href={ADOPT.cta.href} variant="white" className="mt-1">
              {ADOPT.cta.label}
            </CtaLink>
          </RevealUp>
        </div>
      </div>
    </section>
  )
}
