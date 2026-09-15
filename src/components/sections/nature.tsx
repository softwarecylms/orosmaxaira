import Image from 'next/image'
import type { NatureContent, NatureSection } from '@/components/nature/nature-content'
import { CtaLink } from '@/components/home/cta-link'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { Counter } from '@/components/motion/counter'
import { BoldText } from '@/components/shared/bold-text'
import { cn } from '@/lib/utils'

/**
 * «Αφανείς ήρωες της φύσης» sections. Each takes its slice of the page copy as
 * `content` and fetches nothing, so the same component renders the live page
 * and the visual editor. (The hero is PageHero; the adopt banner is the home
 * page's AdoptHiveBanner with tailored text.)
 */

/** One alternating image/text story block. */
export function NatureStory({ content: s }: { content: NatureSection }) {
  return (
    <section className="container-wide py-12 md:py-[70px]">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className={cn(s.reversed && 'lg:order-2')}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-offwhite shadow-card">
            <Image
              src={s.image}
              alt={s.imageAlt}
              fill
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <RevealStagger className={cn('flex flex-col gap-4', s.reversed && 'lg:order-1')} stagger={0.08}>
          <RevealStaggerItem>
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
              {s.eyebrow}
            </span>
          </RevealStaggerItem>
          <RevealStaggerItem>
            <h2 className="font-display text-[26px] font-bold leading-[1.14] text-foreground md:text-[33px]">
              {s.heading}
            </h2>
          </RevealStaggerItem>
          {s.body.map((p, i) => (
            <RevealStaggerItem key={i}>
              <p className="text-[16px] leading-[1.7] text-muted">
                <BoldText text={p} bold={s.bold} />
              </p>
            </RevealStaggerItem>
          ))}
          {s.link ? (
            <RevealStaggerItem className="mt-2">
              <CtaLink href={s.link.href} variant="gold">
                {s.link.label}
              </CtaLink>
            </RevealStaggerItem>
          ) : null}
        </RevealStagger>
      </div>
    </section>
  )
}

/** Stats band. */
export function NatureStats({ content }: { content: NatureContent['stats'] }) {
  return (
    <section data-edit="stats" className="bg-cream py-10 md:py-12">
      <RevealStagger className="container-wide grid grid-cols-1 gap-y-8 sm:grid-cols-3 lg:divide-x lg:divide-accent/40">
        {content.map((s) => (
          <RevealStaggerItem
            key={s.label}
            className="flex flex-col items-center gap-2 px-6 text-center"
          >
            <Counter
              value={s.value}
              className="font-display text-[38px] font-bold leading-none text-accent md:text-[46px]"
            />
            <span className="max-w-[240px] text-[14px] leading-[1.4] text-foreground">{s.label}</span>
          </RevealStaggerItem>
        ))}
      </RevealStagger>
    </section>
  )
}

/** Why every bee matters — image left, content right. */
export function NatureMatters({ content }: { content: NatureContent['matters'] }) {
  return (
    <section data-edit="matters" className="container-wide py-12 md:py-[70px]">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-offwhite shadow-card">
            <Image
              src={content.image}
              alt={content.imageAlt}
              fill
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <RevealStagger className="flex flex-col gap-4" stagger={0.08}>
          <RevealStaggerItem>
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
              {content.eyebrow}
            </span>
          </RevealStaggerItem>
          <RevealStaggerItem>
            <h2 className="font-display text-[26px] font-bold leading-[1.14] text-foreground md:text-[33px]">
              {content.heading}
            </h2>
          </RevealStaggerItem>
          {content.body.map((p, i) => (
            <RevealStaggerItem key={i}>
              <p className="text-[16px] leading-[1.7] text-muted">
                <BoldText text={p} bold={content.emphasis} />
              </p>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}
