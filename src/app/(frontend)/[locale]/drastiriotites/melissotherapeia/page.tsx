import type { Metadata } from 'next'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { CalendarRange, Check, ChevronRight, Clock, Info, Repeat } from 'lucide-react'
import { RevealUp } from '@/components/home/reveal-up'
import { SectionHead } from '@/components/shared/section-head'
import { RichText } from '@/components/activities/detail/rich-text'
import { GalleryCarousel } from '@/components/adopt/gallery-carousel'
import { MelissotherapeiaBooking } from '@/components/melissotherapeia/melissotherapeia-booking'
import { getActivity } from '@/lib/medusa/activities'
import { getExperiences } from '@/components/activities/experiences'
import { getActivitiesUi } from '@/components/activities/activities-content'
import { hreflangAlternates } from '@/lib/seo'

/** Page-level copy that isn't part of the shared UI chrome or the experiences bundle. */
function pageCopy(locale: string) {
  return locale === 'en'
    ? {
        eyebrow: 'Alternative Medicine',
        sessionWord: 'session',
        fallbackDuration: '20 min / session',
        fallbackCost: '€7 / session',
        fallbackSeasonPill: 'Available April–October',
        fallbackPeriod: 'April – October',
        fallbackFrequency: 'Every 2nd day, for 3 weeks',
      }
    : {
        eyebrow: 'Εναλλακτική Ιατρική',
        sessionWord: 'συνεδρία',
        fallbackDuration: '20 λεπτά / συνεδρία',
        fallbackCost: '7€ / συνεδρία',
        fallbackSeasonPill: 'Διαθέσιμη Απρίλιο–Οκτώβριο',
        fallbackPeriod: 'Απρίλιος – Οκτώβριος',
        fallbackFrequency: 'Κάθε 2η ημέρα, για 3 εβδομάδες',
      }
}

type MelissoView = {
  metaTitle: string
  metaDescription?: string
  title: string
  durationLabel?: string
  costLabel?: string // "7€ / συνεδρία"
  seasonPill?: string // "Διαθέσιμη Απρίλιο–Οκτώβριο"
  periodLabel?: string // "Απρίλιος – Οκτώβριος"
  seasonStart?: number
  seasonEnd?: number
  heroImage: string
  heroAlt: string
  body: string[]
  frequency?: string
  video?: string | null
  features: { title: string; text: string }[]
  benefits?: { intro?: string; items: string[] }
  disclaimer?: string
  gallery: { src: string; alt: string }[]
}

/** Load from Medusa; fall back to the localized static `experiences.ts` if unavailable. */
async function loadView(locale: string): Promise<MelissoView> {
  const ui = getActivitiesUi(locale)
  const t = pageCopy(locale)
  const a = await getActivity('melissotherapeia')
  if (a) {
    const s = a.season_start_month ?? undefined
    const e = a.season_end_month ?? undefined
    // First price tier → "7€ / συνεδρία" (per-session, matching the duration).
    const tier = a.price_tiers?.[0]
    const price = tier?.price != null && tier.price !== '' ? Number(tier.price) : NaN
    const costLabel = Number.isFinite(price) ? `${price}€ / ${t.sessionWord}` : undefined
    return {
      metaTitle: a.meta_title ?? a.title,
      metaDescription: a.meta_description ?? undefined,
      title: a.title,
      durationLabel: a.duration_label ?? undefined,
      costLabel,
      seasonPill: s && e ? `${ui.availablePrefix} ${ui.monthsAcc[s - 1]}–${ui.monthsAcc[e - 1]}` : undefined,
      periodLabel: s && e ? `${ui.monthsNom[s - 1]} – ${ui.monthsNom[e - 1]}` : undefined,
      seasonStart: s,
      seasonEnd: e,
      heroImage: a.hero_image ?? '',
      heroAlt: a.hero_image_alt ?? a.title,
      body: (a.description ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      frequency: a.details ?? undefined,
      video: a.video_url,
      features: a.features ?? [],
      benefits: a.benefits ?? undefined,
      disclaimer: a.note ?? undefined,
      gallery: (a.gallery ?? [])
        .filter((g) => g?.url)
        .map((g) => ({ src: g.url, alt: g.alt ?? a.title })),
    }
  }
  // Static fallback (localized).
  const d = getExperiences(locale).melissotherapeia
  return {
    metaTitle: d.metaTitle,
    metaDescription: d.metaDescription,
    title: d.hero.title,
    durationLabel: t.fallbackDuration,
    costLabel: t.fallbackCost,
    seasonPill: t.fallbackSeasonPill,
    periodLabel: t.fallbackPeriod,
    seasonStart: d.booking.seasonStartMonth,
    seasonEnd: d.booking.seasonEndMonth,
    heroImage: d.hero.image,
    heroAlt: d.hero.imageAlt,
    body: d.intro.body,
    frequency: t.fallbackFrequency,
    video: d.intro.video,
    features: d.features?.items ?? [],
    benefits: d.benefits ? { intro: d.benefits.intro, items: d.benefits.items } : undefined,
    disclaimer: d.intro.note,
    gallery: d.gallery ? [...d.gallery.images] : [],
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const v = await loadView(locale)
  return {
    title: v.metaTitle,
    description: v.metaDescription,
    alternates: hreflangAlternates(locale, '/drastiriotites/melissotherapeia'),
  }
}

export default async function MelissotherapeiaPage() {
  const locale = await getLocale()
  const ui = getActivitiesUi(locale)
  const t = pageCopy(locale)
  const v = await loadView(locale)
  const pills = [
    v.durationLabel ? { icon: Clock, label: v.durationLabel } : null,
    v.seasonPill ? { icon: CalendarRange, label: v.seasonPill } : null,
  ].filter(Boolean) as { icon: typeof Clock; label: string }[]

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
              {ui.breadcrumbHome}
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <Link href="/drastiriotites" className="transition-colors hover:text-accent">
              {ui.breadcrumbActivities}
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="text-foreground">{v.title}</span>
          </nav>
        </RevealUp>
      </div>

      <section className="container-page pb-12 pt-2 md:pb-[60px]">
        {/* Header */}
        <RevealUp>
          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t.eyebrow}
            </span>
            <h1 className="font-display text-[32px] font-bold leading-[1.06] text-foreground md:text-[46px]">
              {v.title}
            </h1>
            {pills.length ? (
              <ul className="flex flex-wrap items-center gap-2">
                {pills.map((p) => (
                  <li
                    key={p.label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-[13px] font-semibold text-gold-strong"
                  >
                    <p.icon className="size-3.5" aria-hidden="true" />
                    {p.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </RevealUp>

        {/* Hero image */}
        {v.heroImage ? (
          <RevealUp className="mt-6">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-offwhite shadow-card md:aspect-[16/7]">
              <Image
                src={v.heroImage}
                alt={v.heroAlt}
                fill
                priority
                sizes="(min-width:1280px) 1216px, 100vw"
                className="object-cover"
              />
            </div>
          </RevealUp>
        ) : null}

        {/* Content + sticky booking card */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-12">
          <div className="flex min-w-0 flex-col gap-11">
            {/* Περιγραφή */}
            <section className="flex flex-col gap-5">
              <h2 className="font-display text-[22px] font-bold leading-[1.2] text-foreground md:text-[26px]">
                {ui.sectionDescription}
              </h2>
              {v.body.map((p, i) => (
                <p key={i} className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
                  <RichText text={p} />
                </p>
              ))}
              {v.frequency ? (
                <p className="flex items-center gap-2.5 rounded-[12px] bg-offwhite px-4 py-3 text-[15px] leading-[1.5] text-foreground ring-1 ring-border/50">
                  <Repeat className="size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>
                    <span className="font-semibold">{ui.frequency}</span> {v.frequency}.
                  </span>
                </p>
              ) : null}
              {v.video ? (
                <div className="relative mt-1 aspect-video w-full overflow-hidden rounded-[16px] bg-foreground shadow-card">
                  <iframe
                    src={v.video}
                    title={v.title}
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
            {v.features.length ? (
              <section className="flex flex-col gap-6">
                <h2 className="font-display text-[22px] font-bold leading-[1.2] text-foreground md:text-[26px]">
                  {ui.sectionHowItWorks}
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {v.features.map((f, i) => (
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

            {/* Οφέλη — benefits */}
            {v.benefits?.items?.length ? (
              <section className="flex flex-col gap-5">
                <h2 className="font-display text-[22px] font-bold leading-[1.2] text-foreground md:text-[26px]">
                  {ui.sectionBenefits}
                </h2>
                {v.benefits.intro ? (
                  <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
                    {v.benefits.intro}
                  </p>
                ) : null}
                <ul className="grid gap-3 sm:grid-cols-2">
                  {v.benefits.items.map((item) => (
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
            {v.disclaimer ? (
              <p className="flex items-start gap-2.5 rounded-[14px] bg-accent-soft p-4 text-[14px] leading-[1.6] text-foreground/80 ring-1 ring-accent/15">
                <Info className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-foreground/90">{ui.importantNote} </span>
                  {v.disclaimer}
                </span>
              </p>
            ) : null}
          </div>

          {/* Sticky booking card */}
          <div className="lg:sticky lg:top-[150px] lg:self-start">
            <MelissotherapeiaBooking
              durationLabel={v.durationLabel}
              periodLabel={v.periodLabel}
              costLabel={v.costLabel}
              seasonStartMonth={v.seasonStart}
              seasonEndMonth={v.seasonEnd}
              seasonLabel={v.seasonPill ? `${v.seasonPill}` : undefined}
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      {v.gallery.length ? (
        <section className="bg-offwhite py-12 md:py-[70px]">
          <div className="container-wide flex flex-col gap-8">
            <SectionHead eyebrow={ui.moments} heading={getExperiences(locale).melissotherapeia.gallery!.heading} />
            <GalleryCarousel images={v.gallery} />
          </div>
        </section>
      ) : null}
    </>
  )
}
