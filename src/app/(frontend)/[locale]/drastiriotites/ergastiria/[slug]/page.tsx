import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ChevronRight, CalendarRange, Clock, Users } from 'lucide-react'
import {
  getWorkshop as getMedusaWorkshop,
  workshopIsBookable,
} from '@/lib/medusa/workshops'
import type { PriceTier } from '@/lib/medusa/activities'
import { getWorkshop as getStaticWorkshop } from '@/lib/data/workshops'
import { getActivitiesUi } from '@/components/activities/activities-content'
import { RevealUp } from '@/components/home/reveal-up'
import { SectionHead } from '@/components/shared/section-head'
import { GalleryCarousel } from '@/components/adopt/gallery-carousel'
import { RichText } from '@/components/activities/detail/rich-text'
import { WorkshopComboNotice } from '@/components/ergastiria/workshop-combo-notice'
import { WorkshopBooking } from '@/components/ergastiria/workshop-booking'
import { WorkshopSeatBooking } from '@/components/ergastiria/workshop-seat-booking'
import { WorkshopClosedNotice } from '@/components/ergastiria/workshop-closed-notice'
import { CertificationsNote } from '@/components/certificates/certifications-note'

// Live so admin edits reflect immediately; falls back to static data if Medusa
// is unavailable.
export const dynamic = 'force-dynamic'

const SITE = 'https://orosmaxaira.vercel.app'

/** Page-level chrome copy not part of the shared UI or the workshops data. */
function pageCopy(locale: string) {
  return locale === 'en'
    ? {
        eyebrow: 'Hands-on Workshop',
        workshopWord: 'Workshop',
        metaSuffix: 'Hands-on Workshops | Oros Machaira',
        fallbackDuration: '45 min',
        fallbackAge: 'For all ages',
      }
    : {
        eyebrow: 'Βιωματικό Εργαστήρι',
        workshopWord: 'Εργαστήρι',
        metaSuffix: 'Βιωματικά Εργαστήρια | Όρος Μαχαιρά',
        fallbackDuration: '45 λεπτά',
        fallbackAge: 'Για όλες τις ηλικίες',
      }
}

// Fallback combos (match the seed's DEMO prices) when Medusa has no tiers.
function getDefaultCombos(locale: string): PriceTier[] {
  return locale === 'en'
    ? [
        { key: 'gnorizw', label: 'Getting to Know the Bee', price: 12, note: 'per person · indicative price' },
        {
          key: 'gnorizw-peripeteies',
          label: 'Getting to Know the Bee + Adventures in the Beehives',
          price: 20,
          note: 'per person · indicative price',
        },
      ]
    : [
        { key: 'gnorizw', label: 'Γνωρίζω τη Μέλισσα', price: 12, note: 'ανά άτομο · ενδεικτική τιμή' },
        {
          key: 'gnorizw-peripeteies',
          label: 'Γνωρίζω τη Μέλισσα + Περιπέτειες στις Κυψέλες',
          price: 20,
          note: 'ανά άτομο · ενδεικτική τιμή',
        },
      ]
}

type WView = {
  slug: string
  title: string
  excerpt?: string
  description: string
  seasonBadge: string
  seasonLabel?: string | null
  bookingClosed: boolean
  durationLabel?: string
  ageLabel?: string
  image: string
  gallery: { src: string; alt: string }[]
  tiers: PriceTier[]
  currency: string
  metaTitle: string
  metaDescription?: string
}

function badge(
  seasonLabel: string | null | undefined,
  months: number[] | null | undefined,
  monthsNom: string[],
): string {
  if (months && months.length) {
    const a = monthsNom[months[0] - 1]
    const b = monthsNom[months[months.length - 1] - 1]
    return `${seasonLabel ?? ''} · ${a}${a !== b ? ` – ${b}` : ''}`.trim().replace(/^· /, '')
  }
  return seasonLabel ?? ''
}

async function loadWorkshop(slug: string, locale: string): Promise<WView | null> {
  const ui = getActivitiesUi(locale)
  const t = pageCopy(locale)
  const monthsNom = ui.monthsNom
  const m = await getMedusaWorkshop(slug, locale)
  // Use Medusa unless we're on /en and the backend hasn't been redeployed to
  // serve `translations` yet — then fall through to the static English content
  // so the page never regresses to Greek during a deploy window.
  if (m && (locale !== 'en' || m.translations?.en)) {
    return {
      slug: m.slug,
      title: m.title,
      excerpt: m.excerpt ?? undefined,
      description: m.description ?? '',
      seasonBadge: badge(m.season_label, m.months, monthsNom),
      seasonLabel: m.season_label,
      bookingClosed: !!m.booking_closed,
      durationLabel: m.duration_label ?? undefined,
      ageLabel: m.age_label ?? undefined,
      image: m.image ?? '',
      gallery: (m.gallery ?? []).filter((g) => g?.url).map((g) => ({ src: g.url, alt: g.alt ?? m.title })),
      tiers: m.price_tiers?.length ? m.price_tiers : getDefaultCombos(locale),
      currency: m.currency ?? 'eur',
      metaTitle: m.meta_title ?? `${m.title} — ${t.metaSuffix}`,
      metaDescription: m.meta_description ?? m.excerpt ?? undefined,
    }
  }
  const s = getStaticWorkshop(slug, locale)
  if (!s) return null
  return {
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    description: s.description,
    seasonBadge: badge(s.seasonLabel, s.months, monthsNom),
    seasonLabel: s.seasonLabel,
    bookingClosed: !!s.bookingClosed,
    durationLabel: t.fallbackDuration,
    ageLabel: t.fallbackAge,
    image: s.image,
    gallery: (s.gallery ?? []).filter((g) => g?.src),
    tiers: getDefaultCombos(locale),
    currency: 'eur',
    metaTitle: `${s.title} — ${t.metaSuffix}`,
    metaDescription: s.excerpt,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const w = await loadWorkshop(slug, locale)
  if (!w) return { title: pageCopy(locale).workshopWord }
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
  const locale = await getLocale()
  const ui = getActivitiesUi(locale)
  const t = pageCopy(locale)
  const [w, bookable] = await Promise.all([loadWorkshop(slug, locale), workshopIsBookable(slug)])
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
      { '@type': 'ListItem', position: 1, name: ui.breadcrumbHome, item: SITE },
      { '@type': 'ListItem', position: 2, name: ui.breadcrumbActivities, item: `${SITE}/drastiriotites` },
      { '@type': 'ListItem', position: 3, name: ui.breadcrumbWorkshops, item: `${SITE}/drastiriotites/ergastiria` },
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
              {ui.breadcrumbHome}
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <Link href="/drastiriotites" className="transition-colors hover:text-accent">
              {ui.breadcrumbActivities}
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <Link href="/drastiriotites/ergastiria" className="transition-colors hover:text-accent">
              {ui.breadcrumbWorkshops}
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
              {t.eyebrow}
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
                {ui.sectionDescription}
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
          <div className="flex flex-col gap-4 lg:sticky lg:top-[150px] lg:self-start">
            {w.bookingClosed ? (
              <WorkshopClosedNotice seasonLabel={w.seasonLabel} />
            ) : bookable ? (
              <WorkshopSeatBooking
                slug={w.slug}
                workshopTitle={w.title}
                combos={w.tiers}
                currency={w.currency}
              />
            ) : (
              <WorkshopBooking workshopTitle={w.title} tiers={w.tiers} />
            )}
            <CertificationsNote />
          </div>
        </div>
      </section>

      {/* Gallery */}
      {w.gallery.length ? (
        <section className="bg-offwhite py-12 md:py-[70px]">
          <div className="container-wide flex flex-col gap-8">
            <SectionHead eyebrow={ui.moments} heading={ui.momentsFrom(w.title)} />
            <GalleryCarousel images={w.gallery} />
          </div>
        </section>
      ) : null}
    </>
  )
}
