import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ChevronRight, Clock, Users, CalendarRange } from 'lucide-react'
import type { Activity } from '@/lib/medusa/activities'
import { RevealUp } from '@/components/home/reveal-up'
import { PreviewBridge } from '@/components/preview/preview-bridge'
import { SectionHead } from '@/components/shared/section-head'
import { GalleryCarousel } from '@/components/adopt/gallery-carousel'
import { getActivitiesUi } from '@/components/activities/activities-content'
import { Stars } from './stars'
import { ActivitySections } from './activity-sections'
import { ActivityPolicies } from './activity-policies'
import { ActivityBookingCard } from './activity-booking-card'
import { CertificationsNote } from '@/components/certificates/certifications-note'
import { ActivityRelated } from './activity-related'

/**
 * Medusa-backed activity detail page — a product/experience-detail layout
 * (breadcrumb → header + rating → hero → tabs + sticky booking card →
 * policies → gallery → related). Dynamic content comes from the Medusa admin;
 * the static chrome is localized via `locale`.
 */
export function ActivityDetail({
  activity,
  locale = 'el',
}: {
  activity: Activity
  locale?: string
}) {
  const ui = getActivitiesUi(locale)
  const galleryImages = (activity.gallery ?? [])
    .filter((g) => g?.url)
    .map((g) => ({ src: g.url, alt: g.alt ?? activity.title }))

  const season =
    activity.season_start_month && activity.season_end_month
      ? `${ui.monthsAcc[activity.season_start_month - 1]}–${ui.monthsAcc[activity.season_end_month - 1]}`
      : null

  const pills = [
    activity.duration_label && { icon: Clock, label: activity.duration_label },
    activity.age_label && { icon: Users, label: activity.age_label },
    season && { icon: CalendarRange, label: `${ui.availablePrefix} ${season}` },
  ].filter(Boolean) as { icon: typeof Clock; label: string }[]

  return (
    <>
      {/* Click-to-edit for the admin preview; inert without ?preview=1. */}
      <PreviewBridge />

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
            <span className="text-foreground">{activity.title}</span>
          </nav>
        </RevealUp>
      </div>

      <section className="container-page pb-12 pt-2 md:pb-[60px]">
        {/* Header */}
        <RevealUp>
          <div data-edit="header" className="flex flex-col gap-4">
            <h1 className="font-display text-[32px] font-bold leading-[1.06] text-foreground md:text-[46px]">
              {activity.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {activity.rating ? (
                <span className="flex items-center gap-2">
                  <Stars value={activity.rating} locale={locale} />
                  <span className="text-[15px] font-semibold text-foreground">
                    {activity.rating.toFixed(1)}
                  </span>
                  {activity.review_count ? (
                    <span className="text-[15px] text-muted">({activity.review_count})</span>
                  ) : null}
                </span>
              ) : null}
              {pills.length ? (
                <ul className="flex flex-wrap items-center gap-2">
                  {pills.map((p) => {
                    const Icon = p.icon
                    return (
                      <li
                        key={p.label}
                        className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-[13px] font-semibold text-gold-strong"
                      >
                        <Icon className="size-3.5" aria-hidden="true" />
                        {p.label}
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          </div>
        </RevealUp>

        {/* Hero image */}
        {activity.hero_image ? (
          <RevealUp className="mt-6">
            <div data-edit="hero" className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-offwhite shadow-card md:aspect-[16/7]">
              <Image
                src={activity.hero_image}
                alt={activity.hero_image_alt ?? activity.title}
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
          <div className="flex min-w-0 flex-col gap-10">
            <ActivitySections activity={activity} locale={locale} />
            {activity.policies?.length ? (
              <ActivityPolicies policies={activity.policies} locale={locale} />
            ) : null}
          </div>

          {/* Offset clears the sticky header (~142px) so the card's top price
              row isn't tucked underneath it. */}
          <div data-edit="booking" className="flex flex-col gap-4 lg:sticky lg:top-[150px] lg:self-start">
            <ActivityBookingCard activity={activity} locale={locale} />
            <CertificationsNote />
          </div>
        </div>
      </section>

      {/* Gallery */}
      {galleryImages.length ? (
        <section data-edit="gallery" className="bg-offwhite py-12 md:py-[70px]">
          <div className="container-wide flex flex-col gap-8">
            <SectionHead eyebrow={ui.moments} heading={ui.momentsFrom(activity.title)} />
            <GalleryCarousel images={galleryImages} />
          </div>
        </section>
      ) : null}

      {/* Related activities */}
      <ActivityRelated
        slugs={activity.related_slugs ?? []}
        currentSlug={activity.slug}
        locale={locale}
      />
    </>
  )
}
