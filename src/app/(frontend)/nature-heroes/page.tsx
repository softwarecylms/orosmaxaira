import type { Metadata } from 'next'
import Image from 'next/image'
import { NATURE_PAGE } from '@/components/nature/nature-content'
import { PageHero } from '@/components/shared/page-hero'
import { CtaLink } from '@/components/home/cta-link'
import { AdoptHiveBanner } from '@/components/home/adopt-hive-banner'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { Counter } from '@/components/motion/counter'
import { BoldText } from '@/components/shared/bold-text'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Μέλισσες, οι Αφανείς Ήρωες της Φύσης',
  description:
    'Οι μέλισσες είναι απαραίτητες για την ισορροπία του περιβάλλοντος και τη βιοποικιλότητα. Μάθετε γιατί κάθε μέλισσα μετράει και πώς μπορείτε να βοηθήσετε.',
}

/** One alternating image/text story block. */
function StorySection({ s }: { s: (typeof NATURE_PAGE.sections)[number] }) {
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

export default function NatureHeroesPage() {
  const n = NATURE_PAGE

  return (
    <>
      {/* 1 · Hero */}
      <PageHero
        image={n.hero.image}
        imageAlt={n.hero.imageAlt}
        eyebrow={n.hero.eyebrow}
        title={n.hero.title}
        description={n.hero.description}
      />

      {/* 2 · First story section */}
      <StorySection s={n.sections[0]} />

      {/* 3 · Stats band */}
      <section className="bg-cream py-10 md:py-12">
        <RevealStagger className="container-wide grid grid-cols-1 gap-y-8 sm:grid-cols-3 lg:divide-x lg:divide-accent/40">
          {n.stats.map((s) => (
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

      {/* 4 · Remaining story sections */}
      {n.sections.slice(1).map((s) => (
        <StorySection key={s.heading} s={s} />
      ))}

      {/* 5 · Adopt-a-hive banner (homepage section, tailored copy) */}
      <AdoptHiveBanner body="Το πρόγραμμα «Υιοθετώ μια κυψέλη» είναι ένα σημαντικό βήμα προς αυτήν την κατεύθυνση, προσφέροντας έναν τρόπο στους ανθρώπους να συνεισφέρουν άμεσα στη διατήρηση αυτών των ζωτικής σημασίας πλασμάτων." />

      {/* 6 · Why every bee matters — editorial manifesto (only the real copy, white) */}
      <section className="container-wide py-16 md:py-24">
        <div className="mx-auto max-w-[860px]">
          <RevealStagger className="flex flex-col items-center gap-6 text-center" stagger={0.1}>
            <RevealStaggerItem>
              <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
                {n.matters.eyebrow}
              </span>
            </RevealStaggerItem>
            <RevealStaggerItem>
              <h2 className="font-display text-[30px] font-bold leading-[1.12] text-foreground md:text-[42px]">
                {n.matters.heading}
              </h2>
            </RevealStaggerItem>

            {/* Paragraph 1 — the pressures (threat terms emphasised) */}
            <RevealStaggerItem>
              <p className="max-w-[720px] text-[16px] leading-[1.85] text-muted md:text-[17px]">
                <BoldText text={n.matters.body[0]} bold={n.matters.emphasis} />
              </p>
            </RevealStaggerItem>

            {/* Paragraph 2 — the risk, emphasised between accent rules */}
            <RevealStaggerItem className="flex w-full items-center justify-center gap-4 pt-1">
              <span className="hidden h-px w-8 shrink-0 bg-accent/40 sm:block md:w-12" aria-hidden="true" />
              <p className="max-w-[520px] text-[17px] font-semibold leading-[1.4] text-gold-strong md:text-[19px]">
                {n.matters.body[1]}
              </p>
              <span className="hidden h-px w-8 shrink-0 bg-accent/40 sm:block md:w-12" aria-hidden="true" />
            </RevealStaggerItem>
          </RevealStagger>

          {/* Paragraph 3 — the heart of it, as a display pull-quote */}
          <Reveal className="mt-12 flex flex-col items-center gap-2 md:mt-16">
            <span className="font-display text-[72px] leading-[0.4] text-accent/70" aria-hidden="true">
              &ldquo;
            </span>
            <blockquote className="max-w-[780px] text-center font-display text-[24px] font-bold leading-[1.32] text-foreground md:text-[32px]">
              {n.matters.body[2]}
            </blockquote>
          </Reveal>

          {/* Paragraph 4 — the call to protect */}
          <Reveal className="mx-auto mt-9 max-w-[660px] text-center md:mt-11">
            <p className="text-[16px] leading-[1.85] text-muted md:text-[17px]">{n.matters.body[3]}</p>
          </Reveal>
        </div>
      </section>

    </>
  )
}
