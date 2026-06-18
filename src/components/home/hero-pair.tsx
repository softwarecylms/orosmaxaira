import Image from 'next/image'
import { HERO } from './home-content'
import { CtaLink } from './cta-link'
import { RevealUp } from './reveal-up'

/**
 * Section 2 — two side-by-side hero cards (Figma 181:1298).
 * Left: off-white card, honey-jars photo. Right: gold card, bee photo.
 */
export function HeroPair() {
  return (
    <section data-testid="hero-pair" className="bg-white pt-6 md:pt-9">
      <div className="container-wide">
        <div className="grid gap-[30px] lg:grid-cols-2">
          {/* Left — off-white card */}
          <article className="group relative flex flex-col overflow-hidden rounded-[4px] bg-offwhite px-7 py-8 sm:min-h-[430px] sm:flex-row sm:items-center md:min-h-[490px] md:py-5 md:pl-[50px] md:pr-[25px]">
            <RevealUp className="relative z-10 flex flex-col gap-5 sm:max-w-[345px]">
              <div className="flex flex-col gap-2.5">
                <p className="text-[14px] uppercase leading-[21px] tracking-[0.01em] text-muted">
                  {HERO.left.eyebrow}
                </p>
                <h1 className="font-display text-[32px] font-bold leading-[1.14] text-foreground md:text-[45px] md:leading-[55px]">
                  {HERO.left.heading}
                </h1>
              </div>
              <p className="text-[17px] leading-[24px] text-muted">{HERO.left.body}</p>
              <CtaLink href={HERO.left.cta.href} variant="gold" className="mt-1 self-start">
                {HERO.left.cta.label}
              </CtaLink>
            </RevealUp>
            <RevealUp
              delay={0.15}
              className="pointer-events-none relative mt-3 h-[300px] w-full sm:absolute sm:inset-y-5 sm:right-5 sm:mt-0 sm:h-auto sm:w-1/2 md:w-[430px]"
            >
              <Image
                src={HERO.left.image}
                alt={HERO.left.imageAlt}
                fill
                sizes="(min-width: 1024px) 430px, (min-width: 640px) 50vw, 100vw"
                className="object-contain object-center transition-transform duration-500 group-hover:scale-105"
                priority
              />
            </RevealUp>
          </article>

          {/* Right — gold card */}
          <article className="group relative flex flex-col overflow-hidden rounded-[4px] bg-accent px-7 py-8 sm:min-h-[430px] sm:flex-row sm:items-center md:min-h-[490px] md:py-5 md:pl-[50px] md:pr-0">
            <RevealUp delay={0.1} className="relative z-10 flex flex-col gap-5 sm:max-w-[345px]">
              <div className="flex flex-col gap-2.5">
                <p className="text-[14px] uppercase leading-[21px] tracking-[0.01em] text-cream">
                  {HERO.right.eyebrow}
                </p>
                <h1 className="font-display text-[32px] font-bold leading-[1.14] text-white md:text-[45px] md:leading-[55px]">
                  {HERO.right.heading}
                </h1>
              </div>
              <p className="text-[17px] leading-[24px] text-cream">{HERO.right.body}</p>
              <CtaLink href={HERO.right.cta.href} variant="white" className="mt-1 self-start">
                {HERO.right.cta.label}
              </CtaLink>
            </RevealUp>
            <RevealUp
              delay={0.25}
              className="pointer-events-none relative mt-3 h-[300px] w-full overflow-hidden rounded-[4px] sm:absolute sm:inset-y-0 sm:right-[-6%] sm:mt-0 sm:h-auto sm:w-[64%] sm:overflow-visible sm:rounded-none"
            >
              <Image
                src={HERO.right.image}
                alt={HERO.right.imageAlt}
                fill
                sizes="(min-width: 1024px) 560px, (min-width: 640px) 55vw, 100vw"
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
