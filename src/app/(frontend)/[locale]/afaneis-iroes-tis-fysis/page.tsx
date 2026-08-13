import type { Metadata } from 'next'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { getNatureContent, type NatureSection } from '@/components/nature/nature-content'
import { PageHero } from '@/components/shared/page-hero'
import { CtaLink } from '@/components/home/cta-link'
import { AdoptHiveBanner } from '@/components/home/adopt-hive-banner'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { Counter } from '@/components/motion/counter'
import { BoldText } from '@/components/shared/bold-text'
import { hreflangAlternates } from '@/lib/seo'
import { cn } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const en = locale === 'en'
  return {
    title: en ? 'Bees, Nature’s Unsung Heroes' : 'Μέλισσες, οι Αφανείς Ήρωες της Φύσης',
    description: en
      ? 'Bees are essential to the balance of the environment and to biodiversity. Learn why every single bee matters and how you can help.'
      : 'Οι μέλισσες είναι απαραίτητες για την ισορροπία του περιβάλλοντος και τη βιοποικιλότητα. Μάθετε γιατί κάθε μέλισσα μετράει και πώς μπορείτε να βοηθήσετε.',
    alternates: hreflangAlternates(locale, '/afaneis-iroes-tis-fysis'),
  }
}

/** One alternating image/text story block. */
function StorySection({ s }: { s: NatureSection }) {
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

export default async function NatureHeroesPage() {
  const n = getNatureContent(await getLocale())

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
      <AdoptHiveBanner body={n.adoptBody} />

      {/* 6 · Why every bee matters — image left, content right */}
      <section className="container-wide py-12 md:py-[70px]">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-offwhite shadow-card">
              <Image
                src={n.matters.image}
                alt={n.matters.imageAlt}
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <RevealStagger className="flex flex-col gap-4" stagger={0.08}>
            <RevealStaggerItem>
              <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
                {n.matters.eyebrow}
              </span>
            </RevealStaggerItem>
            <RevealStaggerItem>
              <h2 className="font-display text-[26px] font-bold leading-[1.14] text-foreground md:text-[33px]">
                {n.matters.heading}
              </h2>
            </RevealStaggerItem>
            {n.matters.body.map((p, i) => (
              <RevealStaggerItem key={i}>
                <p className="text-[16px] leading-[1.7] text-muted">
                  <BoldText text={p} bold={n.matters.emphasis} />
                </p>
              </RevealStaggerItem>
            ))}
          </RevealStagger>
        </div>
      </section>

    </>
  )
}
