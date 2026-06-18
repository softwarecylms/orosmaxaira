import Image from 'next/image'
import { HERO } from './home-content'
import { CtaLink } from './cta-link'
import { RevealUp } from './reveal-up'

/**
 * Section 2 — two hero cards (Figma 181:1298 desktop / 367:2194 tablet+mobile).
 * Up to lg: centered text + button with the photo centered below (no overlap).
 * lg+: text left + photo absolutely overlapping on the right.
 * Left: off-white card, honey-jars photo. Right: gold card, bee photo.
 */
export function HeroPair() {
  return (
    <section data-testid="hero-pair" className="bg-white pt-6 md:pt-9">
      <div className="container-wide">
        <div className="grid gap-[30px] lg:grid-cols-2">
          {/* Left — off-white card */}
          <article className="group relative flex flex-col items-center overflow-hidden rounded-[4px] bg-offwhite px-7 py-8 text-center lg:min-h-[490px] lg:flex-row lg:items-center lg:py-5 lg:pl-[50px] lg:pr-[25px] lg:text-left">
            <RevealUp className="relative z-10 flex w-full flex-col items-center gap-5 lg:w-auto lg:max-w-[345px] lg:items-start">
              <div className="flex flex-col gap-2.5">
                <p className="text-[14px] uppercase leading-[21px] tracking-[0.01em] text-muted">
                  {HERO.left.eyebrow}
                </p>
                <h1 className="font-display text-[32px] font-bold leading-[1.14] text-foreground md:text-[45px] md:leading-[55px]">
                  {HERO.left.heading}
                </h1>
              </div>
              <p className="max-w-[465px] text-[17px] leading-[24px] text-muted">{HERO.left.body}</p>
              <CtaLink href={HERO.left.cta.href} variant="gold" className="mt-1">
                {HERO.left.cta.label}
              </CtaLink>
            </RevealUp>
            <RevealUp
              delay={0.15}
              className="pointer-events-none relative -mx-7 -mb-8 mt-1 aspect-[10/9] w-[calc(100%+3.5rem)] lg:absolute lg:inset-y-5 lg:right-5 lg:mx-0 lg:mb-0 lg:mt-0 lg:aspect-auto lg:h-auto lg:w-[430px]"
            >
              <Image
                src={HERO.left.image}
                alt={HERO.left.imageAlt}
                fill
                sizes="(min-width: 1024px) 430px, 100vw"
                className="object-cover object-bottom transition-transform duration-500 group-hover:scale-105 lg:object-contain lg:object-center"
                priority
              />
            </RevealUp>
          </article>

          {/* Right — gold card */}
          <article className="group relative flex flex-col items-center overflow-hidden rounded-[4px] bg-accent px-7 py-8 text-center lg:min-h-[490px] lg:flex-row lg:items-center lg:py-5 lg:pl-[50px] lg:pr-0 lg:text-left">
            <RevealUp
              delay={0.1}
              className="relative z-10 flex w-full flex-col items-center gap-5 lg:w-auto lg:max-w-[345px] lg:items-start"
            >
              <div className="flex flex-col gap-2.5">
                <p className="text-[14px] uppercase leading-[21px] tracking-[0.01em] text-cream">
                  {HERO.right.eyebrow}
                </p>
                <h1 className="font-display text-[32px] font-bold leading-[1.14] text-white md:text-[45px] md:leading-[55px]">
                  {HERO.right.heading}
                </h1>
              </div>
              <p className="max-w-[465px] text-[17px] leading-[24px] text-cream">{HERO.right.body}</p>
              <CtaLink href={HERO.right.cta.href} variant="white" className="mt-1">
                {HERO.right.cta.label}
              </CtaLink>
            </RevealUp>
            <RevealUp
              delay={0.25}
              className="pointer-events-none relative -mx-7 -mb-8 mt-1 aspect-[3/2] w-[calc(100%+3.5rem)] lg:absolute lg:inset-y-0 lg:right-[-6%] lg:mx-0 lg:mb-0 lg:mt-0 lg:aspect-auto lg:h-auto lg:w-[64%]"
            >
              <Image
                src={HERO.right.image}
                alt={HERO.right.imageAlt}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="-scale-x-100 object-cover object-[46%_44%] transition-transform duration-500 group-hover:scale-x-[-1.05] group-hover:scale-y-105"
                priority
              />
            </RevealUp>
          </article>
        </div>
      </div>
    </section>
  )
}
