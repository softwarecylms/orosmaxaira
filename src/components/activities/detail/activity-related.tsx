import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import { getActivitiesContent, getActivitiesUi } from '@/components/activities/activities-content'
import { SectionHead } from '@/components/shared/section-head'
import { RevealUp } from '@/components/home/reveal-up'

/**
 * "Ανακαλύψτε Περισσότερα" / "Discover More" — related activity cards. Sourced
 * from the localized activities content, filtered by the activity's
 * `related_slugs` (the other activities' hrefs), excluding the current page.
 */
export function ActivityRelated({
  slugs,
  currentSlug,
  locale = 'el',
}: {
  slugs: string[]
  currentSlug: string
  locale?: string
}) {
  const ui = getActivitiesUi(locale)
  const items = getActivitiesContent(locale).experiences.items
  // Match on the last path segment so `related_slugs` works whether the admin
  // stored a bare slug ("xenagiseis") or a full href ("/drastiriotites/xenagiseis").
  const lastSeg = (s: string) => s.replace(/\/+$/, '').split('/').pop() ?? s
  const wanted = new Set(slugs.map(lastSeg))

  const picked = (slugs.length ? items.filter((it) => wanted.has(lastSeg(it.href))) : items)
    .filter((it) => lastSeg(it.href) !== currentSlug)
    .slice(0, 3)

  if (!picked.length) return null

  return (
    <section className="py-12 md:py-[70px]">
      <div className="container-page flex flex-col gap-8 md:gap-10">
        <SectionHead eyebrow={ui.relatedEyebrow} heading={ui.relatedHeading} />
        <RevealUp>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {picked.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="group flex flex-col overflow-hidden rounded-[16px] bg-white shadow-card ring-1 ring-border/50 transition-shadow hover:shadow-card-lg"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={it.image}
                    alt={it.title}
                    fill
                    sizes="(min-width:640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="font-display text-[19px] font-bold leading-[1.25] text-foreground transition-colors group-hover:text-accent">
                    {it.title}
                  </h3>
                  <p className="line-clamp-2 text-[14.5px] leading-[1.55] text-muted">{it.text}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[14px] font-semibold text-accent">
                    {ui.more}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </RevealUp>
      </div>
    </section>
  )
}
