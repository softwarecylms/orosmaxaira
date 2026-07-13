import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarRange } from 'lucide-react'
import { PageHero } from '@/components/shared/page-hero'
import { SectionHead } from '@/components/shared/section-head'
import { BoldText } from '@/components/shared/bold-text'
import { FormVideoBg } from '@/components/adopt/form-video-bg'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { publishedWorkshops, seasonBadge } from '@/lib/data/workshops'
import { SeasonCalendar } from '@/components/ergastiria/season-calendar'
import { WorkshopComboNotice } from '@/components/ergastiria/workshop-combo-notice'
import { WorkshopEnquiryForm } from '@/components/ergastiria/workshop-enquiry-form'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Βιωματικά Εργαστήρια — Λαμπάδες, Κερί & Μελισσοκατασκευές',
  description:
    'Δωρεάν βιωματικά εργαστήρια στο μελισσοκομείο του Όρους Μαχαιρά. Κάθε εποχή το δικό της εργαστήρι — πάντα σε συνδυασμό με την εμπειρία «Γνωρίζω τη μέλισσα». Με την υποστήριξη του Υφυπουργείου Τουρισμού.',
}

const INTRO =
  'Η εξόρμηση στη φύση σε συνδυασμό με δημιουργικές δραστηριότητες είναι η καλύτερη λύση στην πιεστική καθημερινότητα. Με την υποστήριξη του Υφυπουργείου Τουρισμού, διοργανώνουμε δωρεάν βιωματικά εργαστήρια στο μελισσοκομείο μας, τόσο τα Σαββατοκύριακα όσο και τις αργίες. Θα ήταν χαρά μας να σας γνωρίσουμε από κοντά και να περάσουμε μαζί μια δημιουργική μέρα! Τα εργαστήρια απευθύνονται σε παιδιά και μεγάλους, δίνοντας σε κάθε οικογένεια την ευκαιρία να περάσει δημιουργικές στιγμές μαζί. Συμπληρώστε την φόρμα επικοινωνίας ή καλέστε στο 25622305 για περισσότερες πληροφορίες.'

const BOOKING_BODY =
  'Για να κλείσετε την εμπειρία σας, συμπληρώστε τη φόρμα ή καλέστε στο 25622305. Θα λάβετε σχετική ενημέρωση εντός 24 ωρών.'

export default function ErgastiriaPage() {
  const workshops = publishedWorkshops()

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
                bold={['φύση', 'δημιουργικές δραστηριότητες', 'Υφυπουργείου Τουρισμού', 'δωρεάν']}
                links={{ '25622305': 'tel:+35725622305' }}
              />
            </p>
          </RevealStaggerItem>
          <RevealStaggerItem>
            <div className="mt-3 flex items-center justify-center">
              <Image
                src="/images/activities/ergastiria/support-logos.webp"
                alt="Υφυπουργείο Τουρισμού Κύπρου · Love Cyprus · Heartland of Legends"
                width={592}
                height={170}
                className="h-[52px] w-auto md:h-[60px]"
              />
            </div>
          </RevealStaggerItem>
          <RevealStaggerItem className="w-full max-w-[760px]">
            <WorkshopComboNotice className="mt-2 text-left" />
          </RevealStaggerItem>
        </RevealStagger>
      </section>

      {/* 3 · Seasonal calendar — the centrepiece */}
      <section className="bg-offwhite py-12 md:py-[70px]">
        <div className="container-wide flex flex-col gap-10">
          <SectionHead
            eyebrow="Το Ημερολόγιο"
            heading="Κάθε εποχή, το δικό της εργαστήρι"
            sub="Το εργαστήρι της κάθε περιόδου καθορίζεται από εμάς, ανάλογα με τη σεζόν. Δείτε τι τρέχει κάθε μήνα."
          />
          <Reveal>
            <SeasonCalendar />
          </Reveal>
        </div>
      </section>

      {/* 4 · Workshops — alternating rows, driven by the data module */}
      <section className="py-12 md:py-[70px]">
        <div className="container-wide flex flex-col gap-14 md:gap-20">
          <SectionHead
            eyebrow="Τα Εργαστήρια"
            heading="Τα Εργαστήρια μας"
            sub="Κάθε εποχή έχει το δικό της εργαστήρι. Το εργαστήρι της κάθε περιόδου καθορίζεται από εμάς, ανάλογα με τη σεζόν."
          />
          {workshops.map((w, i) => (
            <article key={w.slug} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <Reveal className={cn(i % 2 === 1 && 'lg:order-2')}>
                <Link
                  href={`/drastiriotites/ergastiria/${w.slug}`}
                  className="group block"
                  aria-label={w.title}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-white shadow-card">
                    <Image
                      src={w.image}
                      alt={w.title}
                      fill
                      sizes="(min-width:1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.04]"
                    />
                  </div>
                </Link>
              </Reveal>
              <RevealStagger
                className={cn('flex flex-col gap-4', i % 2 === 1 && 'lg:order-1')}
                stagger={0.07}
              >
                <RevealStaggerItem>
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-gold-strong">
                    <CalendarRange className="size-3.5" aria-hidden="true" />
                    {seasonBadge(w)}
                  </span>
                </RevealStaggerItem>
                <RevealStaggerItem>
                  <h3 className="font-display text-[24px] font-bold leading-[1.15] text-foreground md:text-[30px]">
                    {w.title}
                  </h3>
                </RevealStaggerItem>
                <RevealStaggerItem>
                  <p className="text-[15.5px] leading-[1.7] text-muted">{w.excerpt}</p>
                </RevealStaggerItem>
                <RevealStaggerItem>
                  <Link
                    href={`/drastiriotites/ergastiria/${w.slug}`}
                    className="group mt-1 inline-flex items-center gap-1.5 self-start text-[15px] font-semibold text-accent"
                  >
                    Δείτε το εργαστήρι
                    <ArrowRight
                      className="size-4 transition-transform duration-300 ease-soft group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </RevealStaggerItem>
              </RevealStagger>
            </article>
          ))}
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
