import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, CalendarRange } from 'lucide-react'
import {
  getWorkshop,
  publishedWorkshops,
  seasonBadge,
} from '@/lib/data/workshops'
import { RevealUp } from '@/components/home/reveal-up'
import { SectionHead } from '@/components/shared/section-head'
import { GalleryCarousel } from '@/components/adopt/gallery-carousel'
import { CtaLink } from '@/components/home/cta-link'
import { RichText } from '@/components/activities/detail/rich-text'
import { WorkshopComboNotice } from '@/components/ergastiria/workshop-combo-notice'

const SITE = 'https://orosmaxaira.vercel.app'

export function generateStaticParams() {
  return publishedWorkshops().map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const w = getWorkshop(slug)
  if (!w) return { title: 'Εργαστήρι' }
  const url = `${SITE}/drastiriotites/ergastiria/${w.slug}`
  return {
    title: `${w.title} — Βιωματικά Εργαστήρια | Όρος Μαχαιρά`,
    description: w.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: `${w.title} — Όρος Μαχαιρά`,
      description: w.excerpt,
      url,
      images: [{ url: `${SITE}${w.image}` }],
      type: 'article',
    },
  }
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default async function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const w = getWorkshop(slug)
  if (!w) notFound()

  const gallery = (w.gallery ?? []).filter((g) => g?.src)

  // BreadcrumbList only — these workshops are seasonal with no fixed dates, so an
  // Event/Course node would just trigger "missing startDate" warnings.
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

  return (
    <>
      <script
        type="application/ld+json"
        // Escape `<` so a title containing `</script>` can't break out of the tag.
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
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-gold-strong">
              <CalendarRange className="size-3.5" aria-hidden="true" />
              {seasonBadge(w)}
            </span>
            <h1 className="font-display text-[32px] font-bold leading-[1.06] text-foreground md:text-[46px]">
              {w.title}
            </h1>
          </div>
        </RevealUp>

        {/* Hero image */}
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

        {/* Body */}
        <div className="mx-auto mt-8 flex max-w-[760px] flex-col gap-8">
          <div className="flex flex-col gap-4">
            {paragraphs(w.description).map((p, i) => (
              <p
                key={i}
                className="whitespace-pre-line text-[16px] leading-[1.8] text-muted md:text-[17px]"
              >
                <RichText text={p} />
              </p>
            ))}
          </div>

          <WorkshopComboNotice />

          <div className="flex flex-col items-start gap-3 rounded-[18px] bg-offwhite p-6 ring-1 ring-border/50 md:flex-row md:items-center md:justify-between md:p-7">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-[19px] font-bold text-foreground md:text-[21px]">
                Κλείστε την εμπειρία σας
              </h2>
              <p className="text-[14.5px] leading-[1.55] text-muted">
                Στείλτε το αίτημά σας και θα επικοινωνήσουμε για την επιβεβαίωση της διαθεσιμότητας.
              </p>
            </div>
            <CtaLink href="/drastiriotites/ergastiria#cta" variant="gold" className="shrink-0">
              Κλείστε την εμπειρία σας
            </CtaLink>
          </div>
        </div>
      </section>

      {/* Gallery (only when the workshop has one) */}
      {gallery.length ? (
        <section className="bg-offwhite py-12 md:py-[70px]">
          <div className="container-wide flex flex-col gap-8">
            <SectionHead eyebrow="Στιγμές" heading={`Στιγμές από «${w.title}»`} />
            <GalleryCarousel images={gallery} />
          </div>
        </section>
      ) : null}
    </>
  )
}
