import type { Metadata } from 'next'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ArrowRight, CalendarRange } from 'lucide-react'
import { PageHero } from '@/components/shared/page-hero'
import { BoldText } from '@/components/shared/bold-text'
import { RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { publishedWorkshops } from '@/lib/data/workshops'
import { getWorkshops } from '@/lib/medusa/workshops'
import { getActivitiesUi } from '@/components/activities/activities-content'
import { hreflangAlternates } from '@/lib/seo'

// Live so admin edits reflect; falls back to the static workshops if Medusa is down.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const meta =
    locale === 'en'
      ? {
          title: 'Hands-on Workshops — Candles, Wax & Bee Crafts',
          description:
            'Hands-on workshops at the Oros Machaira apiary, always booked together with the “Getting to Know the Bee” experience and included in its price. Every season has its own workshop.',
        }
      : {
          title: 'Βιωματικά Εργαστήρια — Λαμπάδες, Κερί & Μελισσοκατασκευές',
          description:
            'Βιωματικά εργαστήρια στο μελισσοκομείο του Όρους Μαχαιρά, πάντα σε συνδυασμό με την εμπειρία «Γνωρίζω τη μέλισσα» και με την τιμή της να τα περιλαμβάνει. Κάθε εποχή το δικό της εργαστήρι.',
        }
  return { ...meta, alternates: hreflangAlternates(locale, '/drastiriotites/ergastiria') }
}

/** Page-level copy for the workshops list. */
function pageCopy(locale: string) {
  return locale === 'en'
    ? {
        heroTitle: 'Workshops',
        heroAlt: 'Beeswax candles and bee crafts',
        eyebrow: 'Creativity & Nature',
        heading: 'Hands-on Workshops',
        intro:
          'Getting out into nature combined with creative activities is the best answer to a stressful everyday life. We organise hands-on workshops at our apiary, both on weekends and on public holidays. A workshop is always booked together with one of our experiences and is included in its price. It would be our pleasure to get to know you in person and spend a creative day together! The workshops are aimed at children and adults, giving every family the chance to share creative moments together.',
        introBold: ['nature', 'creative activities', 'included in its price'],
        byAppointment: 'By appointment',
        availableNow: 'Available now',
      }
    : {
        heroTitle: 'Εργαστήρια',
        heroAlt: 'Κέρινες μελισσολαμπάδες και μελισσοκατασκευές',
        eyebrow: 'Δημιουργία & Φύση',
        heading: 'Βιωματικά Εργαστήρια',
        intro:
          'Η εξόρμηση στη φύση σε συνδυασμό με δημιουργικές δραστηριότητες είναι η καλύτερη λύση στην πιεστική καθημερινότητα. Διοργανώνουμε βιωματικά εργαστήρια στο μελισσοκομείο μας, τόσο τα Σαββατοκύριακα όσο και τις αργίες. Το εργαστήρι κλείνεται πάντα σε συνδυασμό με μία από τις εμπειρίες μας και περιλαμβάνεται στην τιμή της. Θα ήταν χαρά μας να σας γνωρίσουμε από κοντά και να περάσουμε μαζί μια δημιουργική μέρα! Τα εργαστήρια απευθύνονται σε παιδιά και μεγάλους, δίνοντας σε κάθε οικογένεια την ευκαιρία να περάσει δημιουργικές στιγμές μαζί.',
        introBold: ['φύση', 'δημιουργικές δραστηριότητες', 'περιλαμβάνεται στην τιμή της'],
        byAppointment: 'Κατόπιν ραντεβού',
        availableNow: 'Τώρα διαθέσιμο',
      }
}

type Row = {
  slug: string
  title: string
  excerpt: string
  image: string
  seasonLabel: string
  months: number[]
}
function monthsLabel(months: number[], monthsNom: string[], byAppointment: string): string {
  if (!months.length) return byAppointment
  const a = monthsNom[months[0] - 1]
  const b = monthsNom[months[months.length - 1] - 1]
  return a === b ? a : `${a}–${b}`
}

export default async function ErgastiriaPage() {
  const locale = await getLocale()
  const ui = getActivitiesUi(locale)
  const t = pageCopy(locale)
  // Medusa is the source of truth; the English overlay (translations.en) is
  // applied server-side by getWorkshops(locale). Fall back to the static
  // `publishedWorkshops` when Medusa is unreachable, OR (on /en) when the backend
  // hasn't been redeployed yet to serve `translations` — so English never
  // regresses to Greek during a deploy window.
  const medusa = await getWorkshops(locale)
  const useMedusa = !!medusa && (locale !== 'en' || medusa.some((w) => w.translations?.en))
  const workshops: Row[] = useMedusa
    ? medusa!.map((w) => ({
        slug: w.slug,
        title: w.title,
        excerpt: w.excerpt ?? '',
        image: w.image ?? '',
        seasonLabel: w.season_label ?? '',
        months: w.months ?? [],
      }))
    : publishedWorkshops(locale).map((w) => ({
        slug: w.slug,
        title: w.title,
        excerpt: w.excerpt,
        image: w.image,
        seasonLabel: w.seasonLabel,
        months: w.months,
      }))
  const currentMonth = new Date().getMonth() + 1

  return (
    <>
      {/* 1 · Hero */}
      <PageHero
        image="/images/activities/ergastiria.webp"
        imageAlt={t.heroAlt}
        title={t.heroTitle}
        overlayClassName="bg-black/25"
      />

      {/* 2 · Intro (wide) */}
      <section className="container-wide py-12 md:py-[70px]">
        <RevealStagger
          className="mx-auto flex max-w-[1040px] flex-col items-center gap-5 text-center"
          stagger={0.08}
        >
          <RevealStaggerItem>
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t.eyebrow}
            </span>
          </RevealStaggerItem>
          <RevealStaggerItem>
            <h2 className="font-display text-[28px] font-bold leading-[1.14] text-foreground md:text-[36px]">
              {t.heading}
            </h2>
          </RevealStaggerItem>
          <RevealStaggerItem>
            <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
              <BoldText text={t.intro} bold={t.introBold} />
            </p>
          </RevealStaggerItem>
        </RevealStagger>

        {/* Workshops — card grid, directly below the intro */}
        <RevealStagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workshops.map((w) => {
              const isNow = w.months.includes(currentMonth)
              const availability = monthsLabel(w.months, ui.monthsNom, t.byAppointment)
              return (
                <RevealStaggerItem key={w.slug} hoverLift className="flex">
                  <Link
                    href={`/drastiriotites/ergastiria/${w.slug}`}
                    className="group flex w-full flex-col overflow-hidden rounded-[16px] bg-white shadow-card ring-1 ring-border/50 transition-shadow hover:shadow-card-lg"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={w.image}
                        alt={w.title}
                        fill
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.05]"
                      />
                      {isNow ? (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[12px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(35,31,32,0.4)]">
                          <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
                          {t.availableNow}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-gold-strong">
                        <CalendarRange className="size-3.5 shrink-0" aria-hidden="true" />
                        {availability}
                      </span>
                      <h3 className="font-display text-[18px] font-bold leading-[1.25] text-foreground transition-colors group-hover:text-accent">
                        {w.title}
                      </h3>
                      <p className="text-[14px] leading-[1.55] text-muted">{w.excerpt}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[14px] font-semibold text-accent">
                        {ui.more}
                        <ArrowRight
                          className="size-4 transition-transform duration-300 ease-soft group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </Link>
                </RevealStaggerItem>
              )
            })}
        </RevealStagger>
      </section>
    </>
  )
}
