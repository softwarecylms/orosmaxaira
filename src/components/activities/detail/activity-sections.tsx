import { Info } from 'lucide-react'
import type { Activity } from '@/lib/medusa/activities'
import { getActivitiesUi } from '@/components/activities/activities-content'
import { Stars } from './stars'
import { RichText } from './rich-text'

function paragraphs(text?: string | null): string[] {
  return (text ?? '')
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** ISO review date -> reader-friendly form ("12 August 2025" / "12 Αυγούστου 2025").
 *  The stored value stays ISO so it sorts and so <time dateTime> stays machine-readable. */
function formatReviewDate(iso: string, locale: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  // Reviews carried over from Google are only dated to the month ("2025-10"),
  // so render them month-precision rather than inventing a day.
  const monthOnly = /^\d{4}-\d{2}$/.test(iso)
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'el-GR', {
    ...(monthOnly ? {} : { day: 'numeric' }),
    month: 'long',
    year: 'numeric',
  }).format(d)
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[22px] font-bold leading-[1.2] text-foreground md:text-[26px]">
      {children}
    </h2>
  )
}

/**
 * The activity's content, stacked in reading order: Περιγραφή → Λεπτομέρειες →
 * Κριτικές. Each section only renders when it has content. Server component
 * (no interactivity).
 */
export function ActivitySections({
  activity,
  locale = 'el',
}: {
  activity: Activity
  locale?: string
}) {
  const ui = getActivitiesUi(locale)
  const hasReviews = (activity.reviews?.length ?? 0) > 0
  const hasDesc = !!(activity.description?.trim() || activity.features?.length)
  const hasDetails = !!(activity.details?.trim() || activity.note?.trim())

  return (
    <div className="flex flex-col gap-11">
      {hasDesc ? (
        <section className="flex flex-col gap-6">
          <SectionHeading>{ui.sectionDescription}</SectionHeading>
          <div className="flex flex-col gap-4">
            {paragraphs(activity.description).map((p, i) => (
              <p
                key={i}
                className="whitespace-pre-line text-[16px] leading-[1.8] text-muted md:text-[17px]"
              >
                <RichText text={p} />
              </p>
            ))}
          </div>
          {activity.features?.length ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {activity.features.map((f, i) => (
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
          ) : null}
        </section>
      ) : null}

      {hasDetails ? (
        <section className="flex flex-col gap-5">
          <SectionHeading>{ui.sectionDetails}</SectionHeading>
          {paragraphs(activity.details).map((p, i) => (
            <p
              key={i}
              className="whitespace-pre-line text-[16px] leading-[1.8] text-muted md:text-[17px]"
            >
              <RichText text={p} />
            </p>
          ))}
          {activity.note ? (
            <p className="flex items-start gap-2.5 rounded-[14px] bg-accent-soft p-4 text-[14px] leading-[1.6] text-foreground/80 ring-1 ring-accent/15">
              <Info className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
              <span>
                <span className="font-semibold text-foreground/90">{ui.importantNote} </span>
                {activity.note}
              </span>
            </p>
          ) : null}
        </section>
      ) : null}

      {hasReviews ? (
        <section className="flex flex-col gap-5">
          <SectionHeading>{ui.sectionReviews}</SectionHeading>
          {activity.rating ? (
            <div className="flex items-center gap-3">
              <span className="font-display text-[32px] font-bold text-foreground">
                {activity.rating.toFixed(1)}
              </span>
              <span className="flex flex-col">
                <Stars value={activity.rating} locale={locale} />
                {activity.review_count ? (
                  <span className="text-[13px] text-muted">
                    {ui.reviewsBasedOn(activity.review_count)}
                  </span>
                ) : null}
              </span>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {activity.reviews!.map((r, i) => (
              <figure
                key={i}
                className="flex flex-col gap-3 rounded-[16px] bg-white p-5 shadow-card ring-1 ring-border/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <figcaption className="text-[15px] font-semibold text-foreground">
                    {r.name}
                  </figcaption>
                  {r.rating ? <Stars value={r.rating} locale={locale} /> : null}
                </div>
                {r.date ? (
                    <time dateTime={r.date} className="text-[13px] text-muted">
                      {formatReviewDate(r.date, locale)}
                    </time>
                  ) : null}
                <blockquote className="text-[14.5px] leading-[1.65] text-muted">
                  {r.body}
                </blockquote>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
