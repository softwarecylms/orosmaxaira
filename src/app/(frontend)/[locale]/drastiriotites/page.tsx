import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ACTIVITIES_PAGE } from '@/components/activities/activities-content'
import { PageHero } from '@/components/shared/page-hero'
import { SectionHead } from '@/components/shared/section-head'
import { FactBand } from '@/components/activities/fact-band'
import { RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'

export const metadata: Metadata = {
  title: 'Δραστηριότητες — Όρος Μαχαιρά Academy',
  description:
    'Βιωματικές δραστηριότητες στο μελισσοκομείο του Όρους Μαχαιρά: ξεναγήσεις, εργαστήρια, επίσκεψη στις κυψέλες, μελισσοθεραπεία και εκπαιδευτικά προγράμματα για σχολεία & οργανισμούς.',
}

export default function ActivitiesPage() {
  const a = ACTIVITIES_PAGE

  return (
    <>
      {/* 1 · Hero */}
      <PageHero
        image={a.hero.image}
        imageAlt={a.hero.imageAlt}
        logo="/images/activities/bee-academy-white.svg"
        logoAlt="Bee Academy"
        title={a.hero.title}
        description={a.hero.description}
        overlayClassName="bg-black/45"
        className="py-12 md:py-16"
        buttons={[
          { label: 'Εμπειρίες', href: '#experiences' },
          { label: 'Προγράμματα', href: '#programs' },
        ]}
      />

      {/* 2 · Experiences */}
      <section id="experiences" className="scroll-mt-24 pt-12 pb-6 md:pt-[70px] md:pb-8">
        <div className="container-wide flex flex-col gap-10">
          <SectionHead
            eyebrow={a.experiences.eyebrow}
            heading={a.experiences.heading}
            sub={a.experiences.sub}
          />
          <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {a.experiences.items.map((item) => (
              <RevealStaggerItem key={item.title} hoverLift className="flex">
                <Link
                  href={item.href}
                  className="group flex w-full flex-col overflow-hidden rounded-[16px] bg-white shadow-card ring-1 ring-border/50 transition-shadow hover:shadow-card-lg"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.05]"
                    />
                    {item.badge ? (
                      <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[12px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(35,31,32,0.4)]">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="font-display text-[18px] font-bold leading-[1.25] text-foreground transition-colors group-hover:text-accent">
                      {item.title}
                    </h3>
                    <p className="text-[14px] leading-[1.55] text-muted">{item.text}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[14px] font-semibold text-accent">
                      Περισσότερα
                      <ArrowRight
                        className="size-4 transition-transform duration-300 ease-soft group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </RevealStaggerItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* 3 · "Ήξερες ότι…" — goal-band style with the honeybee video */}
      <FactBand />

      {/* 4 · Educational programs */}
      <section id="programs" className="scroll-mt-24 bg-offwhite py-12 md:py-[70px]">
        <div className="container-wide flex flex-col gap-10">
          <SectionHead
            eyebrow={a.programs.eyebrow}
            heading={a.programs.heading}
            sub={a.programs.sub}
            className="max-w-[960px]"
          />
          <RevealStagger className="grid gap-6 md:grid-cols-2" stagger={0.1}>
            {a.programs.items.map((item) => {
              const cardCls =
                'grid w-full grid-cols-1 overflow-hidden rounded-[16px] bg-white shadow-card ring-1 ring-border/50 sm:grid-cols-[42%_1fr]'
              const content = (
                <>
                  <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-auto sm:h-full sm:min-h-[220px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width:768px) 25vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="flex flex-col gap-2.5 p-6 md:p-7">
                    <h3 className="font-display text-[20px] font-bold leading-[1.25] text-foreground transition-colors group-hover:text-accent md:text-[22px]">
                      {item.title}
                    </h3>
                    <p className="text-[14.5px] leading-[1.6] text-muted">{item.text}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[14px] font-semibold text-accent">
                      {item.cta}
                      <ArrowRight
                        className="size-4 transition-transform duration-300 ease-soft group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </>
              )
              return (
                <RevealStaggerItem key={item.title} className="flex">
                  {item.disabled ? (
                    // Link temporarily disabled — renders as a non-clickable card.
                    <div className={cardCls}>{content}</div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`group transition-shadow hover:shadow-card-lg ${cardCls}`}
                    >
                      {content}
                    </Link>
                  )}
                </RevealStaggerItem>
              )
            })}
          </RevealStagger>
        </div>
      </section>

    </>
  )
}
