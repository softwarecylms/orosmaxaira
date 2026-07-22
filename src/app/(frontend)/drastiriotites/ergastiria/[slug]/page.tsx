import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, CalendarRange, Clock, Users } from 'lucide-react'
import {
  getWorkshop as getMedusaWorkshop,
  workshopIsBookable,
} from '@/lib/medusa/workshops'
import type { PriceTier } from '@/lib/medusa/activities'
import { getWorkshop as getStaticWorkshop } from '@/lib/data/workshops'
import { RevealUp } from '@/components/home/reveal-up'
import { SectionHead } from '@/components/shared/section-head'
import { GalleryCarousel } from '@/components/adopt/gallery-carousel'
import { RichText } from '@/components/activities/detail/rich-text'
import { WorkshopComboNotice } from '@/components/ergastiria/workshop-combo-notice'
import { WorkshopBooking } from '@/components/ergastiria/workshop-booking'
import { WorkshopSeatBooking } from '@/components/ergastiria/workshop-seat-booking'

// Live so admin edits reflect immediately; falls back to static data if Medusa
// is unavailable.
export const dynamic = 'force-dynamic'

const SITE = 'https://orosmaxaira.vercel.app'
const MONTHS_NOM = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
]
// Fallback combos (match the seed's DEMO prices) when Medusa has no tiers.
const DEFAULT_COMBOS: PriceTier[] = [
  { key: 'gnorizw', label: 'Γνωρίζω τη Μέλισσα', price: 12, note: 'ανά άτομο · ενδεικτική τιμή' },
  {
    key: 'gnorizw-peripeteies',
    label: 'Γνωρίζω τη Μέλισσα + Περιπέτειες στις Κυψέλες',
    price: 20,
    note: 'ανά άτομο · ενδεικτική τιμή',
  },
]

type WView = {
  slug: string
  title: string
  excerpt?: string
  description: string
  seasonBadge: string
  durationLabel?: string
  ageLabel?: string
  image: string
  gallery: { src: string; alt: string }[]
  tiers: PriceTier[]
  currency: string
  metaTitle: string
  metaDescription?: string
}

function badge(seasonLabel: string | null | undefined, months: number[] | null | undefined): string {
  if (months && months.length) {
    const a = MONTHS_NOM[months[0] - 1]
    const b = MONTHS_NOM[months[months.length - 1] - 1]
    return `${seasonLabel ?? ''} · ${a}${a !== b ? ` – ${b}` : ''}`.trim().replace(/^· /, '')
  }
  return seasonLabel ?? ''
}

async function loadWorkshop(slug: string): Promise<WView | null> {
  const m = await getMedusaWorkshop(slug)
  if (m) {
    return {
      slug: m.slug,
      title: m.title,
      excerpt: m.excerpt ?? undefined,
      description: m.description ?? '',
      seasonBadge: badge(m.season_label, m.months),
      durationLabel: m.duration_label ?? undefined,
      ageLabel: m.age_label ?? undefined,
      image: m.image ?? '',
      gallery: (m.gallery ?? []).filter((g) => g?.url).map((g) => ({ src: g.url, alt: g.alt ?? m.title })),
      tiers: m.price_tiers?.length ? m.price_tiers : DEFAULT_COMBOS,
      currency: m.currency ?? 'eur',
      metaTitle: m.meta_title ?? `${m.title} — Βιωματικά Εργαστήρια | Όρος Μαχαιρά`,
      metaDescription: m.meta_description ?? m.excerpt ?? undefined,
    }
  }
  const s = getStaticWorkshop(slug)
  if (!s) return null
  return {
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    description: s.description,
    seasonBadge: badge(s.seasonLabel, s.months),
    durationLabel: '45 λεπτά',
    ageLabel: 'Για όλες τις ηλικίες',
    image: s.image,
    gallery: (s.gallery ?? []).filter((g) => g?.src),
    tiers: DEFAULT_COMBOS,
    currency: 'eur',
    metaTitle: `${s.title} — Βιωματικά Εργαστήρια | Όρος Μαχαιρά`,
    metaDescription: s.excerpt,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const w = await loadWorkshop(slug)
  if (!w) return { title: 'Εργαστήρι' }
  const url = `${SITE}/drastiriotites/ergastiria/${w.slug}`
  return {
    title: w.metaTitle,
    description: w.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${w.title} — Όρος Μαχαιρά`,
      description: w.metaDescription,
      url,
      images: w.image ? [{ url: `${SITE}${w.image}` }] : undefined,
      type: 'article',
    },
  }
}

export default async function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [w, bookable] = await Promise.all([loadWorkshop(slug), workshopIsBookable(slug)])
  if (!w) notFound()

  const pills = [
    w.seasonBadge ? { icon: CalendarRange, label: w.seasonBadge } : null,
    w.durationLabel ? { icon: Clock, label: w.durationLabel } : null,
    w.ageLabel ? { icon: Users, label: w.ageLabel } : null,
  ].filter(Boolean) as { icon: typeof Clock; label: string }[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Αρχική', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Δραστηριότητες', item: `${SITE}/drastiriotites` },
      { '@type': 'ListItem', position: 3, name: 'Εργαστήρια', item: `${SITE}/drastiriotites/ergastiria` },
      { '@type': 'ListItem', position: 4, name: w.title },
    ],
  }

  const paragraphs = w.description.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

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
            <Link href="/drastiriotites/ergastiria" className="transition-colors hover:text-accent">
              Εργαστήρια
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="text-foreground">{w.title}</span>
          </nav>
        </RevealUp>
      </div>

      <section className="container-page pb-12 pt-2 md:pb-[60px]">
        {/* Header */}
        <RevealUp>
          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
              Βιωματικό Εργαστήρι
            </span>
            <h1 className="font-display text-[32px] font-bold leading-[1.06] text-foreground md:text-[46px]">
              {w.title}
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
        {w.image ? (
          <RevealUp className="mt-6">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-offwhite shadow-card md:aspect-[16/7]">
              <Image
                src={w.image}
                alt={w.title}
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
          <div className="flex min-w-0 flex-col gap-8">
            <section className="flex flex-col gap-5">
              <h2 className="font-display text-[22px] font-bold leading-[1.2] text-foreground md:text-[26px]">
                Περιγραφή
              </h2>
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="whitespace-pre-line text-[16px] leading-[1.8] text-muted md:text-[17px]"
                >
                  <RichText text={p} />
                </p>
              ))}
            </section>
            <WorkshopComboNotice />
          </div>

          {/* Sticky booking card — real seat booking when the workshop has
              scheduled dates, otherwise the enquiry form. */}
          <div className="lg:sticky lg:top-[150px] lg:self-start">
            {bookable ? (
              <WorkshopSeatBooking
                slug={w.slug}
                workshopTitle={w.title}
                combos={w.tiers}
                currency={w.currency}
              />
            ) : (
              <WorkshopBooking workshopTitle={w.title} tiers={w.tiers} />
            )}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {w.gallery.length ? (
        <section className="bg-offwhite py-12 md:py-[70px]">
          <div className="container-wide flex flex-col gap-8">
            <SectionHead eyebrow="Στιγμές" heading={`Στιγμές από «${w.title}»`} />
            <GalleryCarousel images={w.gallery} />
          </div>
        </section>
      ) : null}
    </>
  )
}
