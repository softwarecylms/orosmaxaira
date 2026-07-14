import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarRange } from 'lucide-react'
import { PageHero } from '@/components/shared/page-hero'
import { SectionHead } from '@/components/shared/section-head'
import { BoldText } from '@/components/shared/bold-text'
import { FormVideoBg } from '@/components/adopt/form-video-bg'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { publishedWorkshops } from '@/lib/data/workshops'
import { getWorkshops } from '@/lib/medusa/workshops'
import { WorkshopEnquiryForm } from '@/components/ergastiria/workshop-enquiry-form'

// Live so admin edits reflect; falls back to the static workshops if Medusa is down.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Βιωματικά Εργαστήρια — Λαμπάδες, Κερί & Μελισσοκατασκευές',
  description:
    'Δωρεάν βιωματικά εργαστήρια στο μελισσοκομείο του Όρους Μαχαιρά. Κάθε εποχή το δικό της εργαστήρι — πάντα σε συνδυασμό με την εμπειρία «Γνωρίζω τη μέλισσα».',
}

const MONTHS_NOM = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
]
type Row = {
  slug: string
  title: string
  excerpt: string
  image: string
  seasonLabel: string
  months: number[]
}
function monthsLabel(months: number[]): string {
  if (!months.length) return 'Κατόπιν ραντεβού'
  const a = MONTHS_NOM[months[0] - 1]
  const b = MONTHS_NOM[months[months.length - 1] - 1]
  return a === b ? a : `${a} – ${b}`
}

const INTRO =
  'Η εξόρμηση στη φύση σε συνδυασμό με δημιουργικές δραστηριότητες είναι η καλύτερη λύση στην πιεστική καθημερινότητα. Διοργανώνουμε δωρεάν βιωματικά εργαστήρια στο μελισσοκομείο μας, τόσο τα Σαββατοκύριακα όσο και τις αργίες. Θα ήταν χαρά μας να σας γνωρίσουμε από κοντά και να περάσουμε μαζί μια δημιουργική μέρα! Τα εργαστήρια απευθύνονται σε παιδιά και μεγάλους, δίνοντας σε κάθε οικογένεια την ευκαιρία να περάσει δημιουργικές στιγμές μαζί. Συμπληρώστε την φόρμα επικοινωνίας ή καλέστε στο 25622305 για περισσότερες πληροφορίες.'

const BOOKING_BODY =
  'Για να κλείσετε την εμπειρία σας, συμπληρώστε τη φόρμα ή καλέστε στο 25622305. Θα λάβετε σχετική ενημέρωση εντός 24 ωρών.'

export default async function ErgastiriaPage() {
  const medusa = await getWorkshops()
  const workshops: Row[] = medusa
    ? medusa.map((w) => ({
        slug: w.slug,
        title: w.title,
        excerpt: w.excerpt ?? '',
        image: w.image ?? '',
        seasonLabel: w.season_label ?? '',
        months: w.months ?? [],
      }))
    : publishedWorkshops().map((w) => ({
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
        imageAlt="Κέρινες μελισσολαμπάδες και μελισσοκατασκευές"
        title="Εργαστήρια"
        description="Δημιουργικά, βιωματικά εργαστήρια στο μελισσοκομείο μας — για μικρούς και μεγάλους."
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
              Δημιουργία & Φύση
            </span>
          </RevealStaggerItem>
          <RevealStaggerItem>
            <h2 className="font-display text-[28px] font-bold leading-[1.14] text-foreground md:text-[36px]">
              Βιωματικά Εργαστήρια
            </h2>
          </RevealStaggerItem>
          <RevealStaggerItem>
            <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
              <BoldText
                text={INTRO}
                bold={['φύση', 'δημιουργικές δραστηριότητες', 'δωρεάν']}
                links={{ '25622305': 'tel:+35725622305' }}
              />
            </p>
          </RevealStaggerItem>
        </RevealStagger>
      </section>

      {/* 3 · Workshops — card grid (like the Δραστηριότητες experiences) */}
      <section className="bg-offwhite py-12 md:py-[70px]">
        <div className="container-wide flex flex-col gap-10">
          <SectionHead
            eyebrow="Τα Εργαστήρια"
            heading="Τα Εργαστήρια μας"
            sub="Δείτε ποιο εργαστήρι τρέχει τώρα και πότε είναι διαθέσιμο το καθένα."
          />
          <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workshops.map((w) => {
              const isNow = w.months.includes(currentMonth)
              const availability = monthsLabel(w.months)
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
                          Τώρα διαθέσιμο
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
                        Περισσότερα
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
        </div>
      </section>

      {/* 5 · Booking CTA + enquiry form */}
      <section id="cta" className="scroll-mt-24 bg-offwhite py-12 md:py-[70px]">
        <div className="container-wide">
          <Reveal className="relative isolate overflow-hidden rounded-[30px] bg-accent p-8 text-white md:p-14">
            <FormVideoBg />
            <div className="relative z-10 grid items-start gap-10 lg:grid-cols-2">
              <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cream">
                  Κράτηση
                </span>
                <h2 className="font-display text-[28px] font-bold leading-[1.15] text-white md:text-[38px]">
                  Κλείστε την εμπειρία σας
                </h2>
                <p className="max-w-[520px] text-[16px] leading-[1.6] text-white/85">
                  <BoldText
                    text={BOOKING_BODY}
                    bold={['φόρμα', '25622305']}
                    links={{ '25622305': 'tel:+35725622305' }}
                    className="font-semibold text-white"
                  />
                </p>
              </div>
              <WorkshopEnquiryForm startHour={8} endHour={16} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
