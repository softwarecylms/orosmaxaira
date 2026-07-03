import Image from 'next/image'
import { PageHero } from '@/components/shared/page-hero'
import { SectionHead } from '@/components/shared/section-head'
import { BoldText } from '@/components/shared/bold-text'
import { BookingForm } from '@/components/booking/booking-form'
import { FormVideoBg } from '@/components/adopt/form-video-bg'
import { GalleryCarousel } from '@/components/adopt/gallery-carousel'
import { CtaLink } from '@/components/home/cta-link'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { Calendar, Check, Info } from 'lucide-react'

export type ActivityExperienceData = {
  slug: string
  metaTitle: string
  metaDescription: string
  hero: { title: string; description: string; image: string; imageAlt: string }
  intro: {
    eyebrow: string
    heading: string
    body: string[]
    bold?: string[]
    /** Optional subtle disclaimer shown below the paragraphs. */
    note?: string
    /** Optional pill label (e.g. a season/duration). */
    label?: string
    /** When `video` or `image` is set the intro renders as a 2-column layout. */
    video?: string
    image?: string
    imageAlt?: string
    book?: { label: string; href: string }
  }
  features?: { eyebrow: string; heading: string; items: { title: string; text: string }[] }
  benefits?: { eyebrow: string; heading: string; intro: string; items: string[] }
  note?: { title?: string; text: string }
  gallery?: { eyebrow: string; heading: string; images: { src: string; alt: string }[] }
  booking: {
    activityName: string
    eyebrow: string
    heading: string
    body: string
    bold?: string[]
    startHour?: number
    endHour?: number
    seasonStartMonth?: number
    seasonEndMonth?: number
    seasonLabel?: string
  }
}

/** Shared layout for an individual activity page (hero → intro → feature cards →
 *  note callout → booking form). Modelled on the "Γνωρίζω τη Μέλισσα" (/drastiriotites/xenagiseis) page. */
export function ActivityExperience({ data }: { data: ActivityExperienceData }) {
  return (
    <>
      {/* 1 · Hero */}
      <PageHero
        image={data.hero.image}
        imageAlt={data.hero.imageAlt}
        title={data.hero.title}
        description={data.hero.description}
        overlayClassName="bg-black/25"
      />

      {/* 2 · Intro */}
      {data.intro.video || data.intro.image ? (
        <section className="container-wide py-12 md:py-[70px]">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <RevealStagger
              className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left"
              stagger={0.08}
            >
              <RevealStaggerItem>
                <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
                  {data.intro.eyebrow}
                </span>
              </RevealStaggerItem>
              <RevealStaggerItem>
                <h2 className="font-display text-[28px] font-bold leading-[1.14] text-foreground md:text-[35px]">
                  {data.intro.heading}
                </h2>
              </RevealStaggerItem>
              {data.intro.label ? (
                <RevealStaggerItem>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1.5 text-[13px] font-semibold text-gold-strong">
                    <Calendar className="size-4" aria-hidden="true" />
                    {data.intro.label}
                  </span>
                </RevealStaggerItem>
              ) : null}
              {data.intro.body.map((p, i) => (
                <RevealStaggerItem key={i}>
                  <p className="text-[16px] leading-[1.75] text-muted md:text-[17px]">
                    <BoldText text={p} bold={data.intro.bold} />
                  </p>
                </RevealStaggerItem>
              ))}
              {data.intro.note ? (
                <RevealStaggerItem>
                  <p className="flex items-start gap-2 text-[13px] leading-[1.55] text-muted">
                    <Info className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
                    <span>
                      <span className="font-semibold text-foreground/80">Σημαντική σημείωση:</span>{' '}
                      {data.intro.note}
                    </span>
                  </p>
                </RevealStaggerItem>
              ) : null}
              {data.intro.book ? (
                <RevealStaggerItem>
                  <CtaLink
                    href={data.intro.book.href}
                    variant="gold"
                    className="mt-1 self-center lg:self-start"
                  >
                    {data.intro.book.label}
                  </CtaLink>
                </RevealStaggerItem>
              ) : null}
            </RevealStagger>
            <Reveal>
              {data.intro.video ? (
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[16px] bg-foreground shadow-card">
                  <iframe
                    src={data.intro.video}
                    title={data.intro.heading}
                    className="absolute left-1/2 top-1/2 aspect-video h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[16px] bg-offwhite shadow-card">
                  <Image
                    src={data.intro.image ?? ''}
                    alt={data.intro.imageAlt ?? ''}
                    fill
                    sizes="(min-width:1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
            </Reveal>
          </div>
        </section>
      ) : (
        <section className="container-wide py-12 md:py-[70px]">
          <RevealStagger
            className="mx-auto flex max-w-[820px] flex-col items-center gap-5 text-center"
            stagger={0.08}
          >
            <RevealStaggerItem>
              <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
                {data.intro.eyebrow}
              </span>
            </RevealStaggerItem>
            <RevealStaggerItem>
              <h2 className="font-display text-[28px] font-bold leading-[1.14] text-foreground md:text-[36px]">
                {data.intro.heading}
              </h2>
            </RevealStaggerItem>
            {data.intro.body.map((p, i) => (
              <RevealStaggerItem key={i}>
                <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
                  <BoldText text={p} bold={data.intro.bold} />
                </p>
              </RevealStaggerItem>
            ))}
          </RevealStagger>
        </section>
      )}

      {/* 3 · Feature cards */}
      {data.features ? (
        <section className="bg-offwhite py-12 md:py-[70px]">
          <div className="container-wide flex flex-col gap-10">
            <SectionHead eyebrow={data.features.eyebrow} heading={data.features.heading} />
            <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {data.features.items.map((it, i) => (
                <RevealStaggerItem
                  key={it.title}
                  hoverLift
                  className="group flex h-full flex-col gap-4 rounded-[16px] bg-white p-7 shadow-card ring-1 ring-border/50 transition-shadow hover:shadow-card-lg"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold-strong text-[15px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(241,172,16,0.75)]">
                    {i + 1}
                  </span>
                  <h3 className="font-display text-[19px] font-bold leading-[1.25] text-foreground">
                    {it.title}
                  </h3>
                  <p className="text-[14.5px] leading-[1.6] text-muted">{it.text}</p>
                </RevealStaggerItem>
              ))}
            </RevealStagger>
          </div>
        </section>
      ) : null}

      {/* 3.5 · Benefits / conditions */}
      {data.benefits ? (
        <section className="container-wide py-12 md:py-[70px]">
          <div className="flex flex-col gap-9">
            <RevealStagger
              className="mx-auto flex max-w-[880px] flex-col items-center gap-4 text-center"
              stagger={0.08}
            >
              <RevealStaggerItem>
                <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
                  {data.benefits.eyebrow}
                </span>
              </RevealStaggerItem>
              <RevealStaggerItem>
                <h2 className="font-display text-[28px] font-bold leading-[1.14] text-foreground md:text-[35px]">
                  {data.benefits.heading}
                </h2>
              </RevealStaggerItem>
              <RevealStaggerItem>
                <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
                  {data.benefits.intro}
                </p>
              </RevealStaggerItem>
            </RevealStagger>
            <RevealStagger
              className="mx-auto grid w-full max-w-[920px] gap-3 sm:grid-cols-2 lg:grid-cols-3"
              stagger={0.05}
            >
              {data.benefits.items.map((item) => (
                <RevealStaggerItem
                  key={item}
                  className="flex items-center gap-3 rounded-[12px] bg-white p-4 shadow-card ring-1 ring-border/50"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold-strong text-white">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-[15px] font-medium leading-snug text-foreground">
                    {item}
                  </span>
                </RevealStaggerItem>
              ))}
            </RevealStagger>
          </div>
        </section>
      ) : null}

      {/* 4 · Note callout */}
      {data.note ? (
        <section className="container-wide py-8 md:py-10">
          <Reveal className="mx-auto flex max-w-[880px] items-start gap-4 rounded-[16px] bg-accent-soft p-6 ring-1 ring-accent/15 md:p-7">
            <Info className="mt-0.5 size-5 shrink-0 text-gold-strong" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              {data.note.title ? (
                <p className="font-display text-[16px] font-bold text-foreground">{data.note.title}</p>
              ) : null}
              <p className="text-[15px] leading-[1.6] text-foreground/80">{data.note.text}</p>
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* 5 · Gallery carousel */}
      {data.gallery ? (
        <section className="py-12 md:py-[70px]">
          <div className="container-wide flex flex-col gap-8">
            <SectionHead eyebrow={data.gallery.eyebrow} heading={data.gallery.heading} />
            <GalleryCarousel images={[...data.gallery.images]} />
          </div>
        </section>
      ) : null}

      {/* 6 · Booking CTA + form */}
      <section id="cta" className="scroll-mt-24 py-12 md:py-[70px]">
        <div className="container-wide">
          <Reveal className="relative isolate overflow-hidden rounded-[30px] bg-accent p-8 text-white md:p-14">
            <FormVideoBg />
            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
              <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cream">
                  {data.booking.eyebrow}
                </span>
                <h2 className="font-display text-[28px] font-bold leading-[1.15] text-white md:text-[38px]">
                  {data.booking.heading}
                </h2>
                <p className="max-w-[520px] text-[16px] leading-[1.6] text-white/85">
                  <BoldText
                    text={data.booking.body}
                    bold={data.booking.bold}
                    links={{ '25622305': 'tel:+35725622305' }}
                    className="font-semibold text-white"
                  />
                </p>
              </div>
              <BookingForm
                activityName={data.booking.activityName}
                startHour={data.booking.startHour ?? 8}
                endHour={data.booking.endHour ?? 16}
                seasonStartMonth={data.booking.seasonStartMonth}
                seasonEndMonth={data.booking.seasonEndMonth}
                seasonLabel={data.booking.seasonLabel}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
