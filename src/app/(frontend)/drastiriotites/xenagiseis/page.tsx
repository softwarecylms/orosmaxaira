import type { Metadata } from 'next'
import Image from 'next/image'
import { Coins, Clock } from 'lucide-react'
import { TOURS_PAGE } from '@/components/xenagiseis/tours-content'
import { PageHero } from '@/components/shared/page-hero'
import { SectionHead } from '@/components/shared/section-head'
import { GalleryCarousel } from '@/components/adopt/gallery-carousel'
import { BookingForm } from '@/components/booking/booking-form'
import { FormVideoBg } from '@/components/adopt/form-video-bg'
import { CtaLink } from '@/components/home/cta-link'
import { BoldText } from '@/components/shared/bold-text'
import { StepsCarousel } from '@/components/xenagiseis/steps-carousel'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'

export const metadata: Metadata = {
  title: 'Γνωρίζω τη Μέλισσα — Ξεναγήσεις',
  description:
    'Βιωματική ξενάγηση στο μελισσοκομείο του Όρους Μαχαιρά: μελισσοθεραπεία, γνωριμία με τις μέλισσες, ζωντανή εμφιάλωση και γευσιγνωσία μελιού. Κλείστε την εμπειρία σας.',
}

export default function ToursPage() {
  const t = TOURS_PAGE

  return (
    <>
      {/* 1 · Hero */}
      <PageHero
        image={t.hero.image}
        imageAlt={t.hero.imageAlt}
        title={t.hero.title}
        description={t.hero.description}
        overlayClassName="bg-black/25"
      />

      {/* 2 · Intro */}
      <section className="container-wide py-12 md:py-[70px]">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
              {t.intro.eyebrow}
            </span>
            <h2 className="font-display text-[28px] font-bold leading-[1.14] text-foreground md:text-[35px]">
              {t.intro.heading}
            </h2>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1.5 text-[13px] font-semibold text-gold-strong">
              <Clock className="size-4" aria-hidden="true" />
              {t.intro.label}
            </span>
            {t.intro.body.map((p, i) => (
              <p key={i} className="text-[16px] leading-[1.7] text-muted">
                <BoldText text={p} bold={t.intro.bold} />
              </p>
            ))}
            <CtaLink href={t.intro.book.href} variant="gold" className="mt-2 self-center lg:self-start">
              {t.intro.book.label}
            </CtaLink>
          </Reveal>
          <Reveal>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[16px] bg-offwhite shadow-card">
              <Image
                src={t.intro.image}
                alt={t.intro.imageAlt}
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 · Tour steps (carousel, 4 per view) */}
      <section className="bg-offwhite py-12 md:py-[70px]">
        <div className="container-wide flex flex-col gap-10">
          <SectionHead eyebrow={t.steps.eyebrow} heading={t.steps.heading} />
          <Reveal>
            <StepsCarousel items={t.steps.items} />
          </Reveal>
        </div>
      </section>

      {/* 4 · Cost + schedule */}
      <section className="container-wide flex flex-col gap-10 py-12 md:py-[70px]">
        <SectionHead
          eyebrow={t.info.header.eyebrow}
          heading={t.info.header.heading}
          sub={t.info.header.sub}
        />
        <RevealStagger className="grid gap-6 md:grid-cols-2" stagger={0.1}>
          {[
            { icon: Coins, ...t.info.cost },
            { icon: Clock, ...t.info.schedule },
          ].map((card) => {
            const Icon = card.icon
            return (
              <RevealStaggerItem
                key={card.heading}
                className="flex flex-col gap-5 rounded-[16px] bg-white p-7 shadow-card ring-1 ring-border/50 md:p-9"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/12 text-gold-strong">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-[21px] font-bold text-foreground">{card.heading}</h3>
                </div>
                <ul className="flex flex-col divide-y divide-border">
                  {card.items.map((row) => (
                    <li key={row.label} className="flex items-center justify-between gap-4 py-3">
                      <span className="text-[15px] text-muted">{row.label}</span>
                      <span className="text-[16px] font-semibold text-foreground">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </RevealStaggerItem>
            )
          })}
        </RevealStagger>
      </section>

      {/* 5 · Gallery */}
      <section className="bg-offwhite py-12 md:py-[70px]">
        <div className="container-wide flex flex-col gap-8">
          <SectionHead eyebrow={t.gallery.eyebrow} heading={t.gallery.heading} />
          <GalleryCarousel images={[...t.gallery.images]} />
        </div>
      </section>

      {/* 6 · Booking CTA + form */}
      <section id="cta" className="scroll-mt-24 py-12 md:py-[70px]">
        <div className="container-wide">
          <Reveal className="relative isolate overflow-hidden rounded-[30px] bg-accent p-8 text-white md:p-14">
            <FormVideoBg />
            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
              <div className="flex flex-col gap-5">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cream">
                  {t.cta.eyebrow}
                </span>
                <h2 className="font-display text-[28px] font-bold leading-[1.15] text-white md:text-[38px]">
                  {t.cta.heading}
                </h2>
                <p className="max-w-[520px] text-[16px] leading-[1.6] text-white/85">
                  <BoldText text={t.cta.body} bold={t.cta.bold} className="font-semibold text-white" />
                </p>
              </div>
              <BookingForm activityName="Γνωρίζω τη μέλισσα" startHour={8} endHour={16} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
