import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarRange, Check, ChevronRight, Clock, Info, Repeat } from 'lucide-react'
import { RevealUp } from '@/components/home/reveal-up'
import { SectionHead } from '@/components/shared/section-head'
import { BoldText } from '@/components/shared/bold-text'
import { GalleryCarousel } from '@/components/adopt/gallery-carousel'
import { MelissotherapeiaBooking } from '@/components/melissotherapeia/melissotherapeia-booking'
import { EXPERIENCES } from '@/components/activities/experiences'

const data = EXPERIENCES.melissotherapeia

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
}

const PILLS = [
  { icon: Clock, label: '20 λεπτά / συνεδρία' },
  { icon: CalendarRange, label: 'Διαθέσιμη Απρίλιο–Οκτώβριο' },
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[22px] font-bold leading-[1.2] text-foreground md:text-[26px]">
      {children}
    </h2>
  )
}

export default function MelissotherapeiaPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="container-page pb-2.5 pt-4">
        <RevealUp>
          <nav
            aria-label="breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-[15px] text-muted md:text-[17px]"
          >
            <Link href="/" className="transition-colors hover:text-accent">
              Αρχική
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <Link href="/drastiriotites" className="transition-colors hover:text-accent">
              Δραστηριότητες
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="text-foreground">{data.hero.title}</span>
          </nav>
        </RevealUp>
      </div>

      <section className="container-page pb-12 pt-2 md:pb-[60px]">
        {/* Header */}
        <RevealUp>
          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
              {data.intro.eyebrow}
            </span>
            <h1 className="font-display text-[32px] font-bold leading-[1.06] text-foreground md:text-[46px]">
              {data.hero.title}
            </h1>
            <ul className="flex flex-wrap items-center gap-2">
              {PILLS.map((p) => (
                <li
                  key={p.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-[13px] font-semibold text-gold-strong"
                >
                  <p.icon className="size-3.5" aria-hidden="true" />
                  {p.label}
                </li>
              ))}
            </ul>
          </div>
        </RevealUp>

        {/* Hero image */}
        <RevealUp className="mt-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-offwhite shadow-card md:aspect-[16/7]">
            <Image
              src={data.hero.image}
              alt={data.hero.imageAlt}
              fill
              priority
              sizes="(min-width:1280px) 1216px, 100vw"
              className="object-cover"
            />
          </div>
        </RevealUp>

        {/* Content + sticky booking card */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-12">
          <div className="flex min-w-0 flex-col gap-11">
            {/* Περιγραφή */}
            <section className="flex flex-col gap-5">
              <SectionHeading>{data.intro.heading}</SectionHeading>
              {data.intro.body.map((p, i) => (
                <p key={i} className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
                  <BoldText text={p} bold={data.intro.bold} />
                </p>
              ))}
              <p className="flex items-center gap-2.5 rounded-[12px] bg-offwhite px-4 py-3 text-[15px] leading-[1.5] text-foreground ring-1 ring-border/50">
                <Repeat className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <span>
                  <span className="font-semibold">Συχνότητα:</span> Κάθε 2η ημέρα, για 3 εβδομάδες.
                </span>
              </p>
              {data.intro.video ? (
                <div className="relative mt-1 aspect-video w-full overflow-hidden rounded-[16px] bg-foreground shadow-card">
                  <iframe
                    src={data.intro.video}
                    title={data.intro.heading}
                    className="absolute inset-0 size-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ) : null}
            </section>

            {/* Πώς Λειτουργεί — features */}
            {data.features ? (
              <section className="flex flex-col gap-6">
                <SectionHeading>{data.features.heading}</SectionHeading>
                <div className="grid gap-3 sm:grid-cols-3">
                  {data.features.items.map((f, i) => (
                    <div
                      key={f.title}
                      className="flex flex-col gap-3 rounded-[16px] bg-offwhite p-5 ring-1 ring-border/50"
                    >
                      <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold-strong text-[14px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(241,172,16,0.75)]">
                        {i + 1}
                      </span>
                      <h3 className="font-display text-[17px] font-bold leading-[1.25] text-foreground">
                        {f.title}
                      </h3>
                      <p className="text-[14.5px] leading-[1.6] text-muted">{f.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Οφέλη — benefits / conditions */}
            {data.benefits ? (
              <section className="flex flex-col gap-5">
                <SectionHeading>{data.benefits.heading}</SectionHeading>
                <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
                  {data.benefits.intro}
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {data.benefits.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 rounded-[12px] bg-offwhite p-3.5 ring-1 ring-border/50"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold-strong text-white">
                        <Check className="size-4" aria-hidden="true" />
                      </span>
                      <span className="text-[14.5px] font-medium leading-snug text-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Disclaimer note */}
            {data.intro.note ? (
              <p className="flex items-start gap-2.5 rounded-[14px] bg-accent-soft p-4 text-[14px] leading-[1.6] text-foreground/80 ring-1 ring-accent/15">
                <Info className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-foreground/90">Σημαντική σημείωση: </span>
                  {data.intro.note}
                </span>
              </p>
            ) : null}
          </div>

          {/* Offset clears the sticky header (~150px). */}
          <div className="lg:sticky lg:top-[150px] lg:self-start">
            <MelissotherapeiaBooking />
          </div>
        </div>
      </section>

      {/* Gallery */}
      {data.gallery ? (
        <section className="bg-offwhite py-12 md:py-[70px]">
          <div className="container-wide flex flex-col gap-8">
            <SectionHead eyebrow={data.gallery.eyebrow} heading={data.gallery.heading} />
            <GalleryCarousel images={[...data.gallery.images]} />
          </div>
        </section>
      ) : null}
    </>
  )
}
