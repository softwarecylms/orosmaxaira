import type { Metadata } from 'next'
import Image from 'next/image'
import { Lock } from 'lucide-react'
import { PageHero } from '@/components/shared/page-hero'
import { SectionHead } from '@/components/shared/section-head'
import { BoldText } from '@/components/shared/bold-text'
import { BookingForm } from '@/components/booking/booking-form'
import { FormVideoBg } from '@/components/adopt/form-video-bg'
import { CtaLink } from '@/components/home/cta-link'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Βιωματικά Εργαστήρια — Λαμπάδες, Κερί & Μελισσοκατασκευές',
  description:
    'Δωρεάν βιωματικά εργαστήρια στο μελισσοκομείο του Όρους Μαχαιρά: μελισσολαμπάδες, περιτύλιγμα φαγητού με κερί μέλισσας και κέρινες δημιουργίες — με την υποστήριξη του Υφυπουργείου Τουρισμού.',
}

const INTRO =
  'Η εξόρμηση στη φύση σε συνδυασμό με δημιουργικές δραστηριότητες είναι η καλύτερη λύση στην πιεστική καθημερινότητα. Με την υποστήριξη του Υφυπουργείου Τουρισμού, διοργανώνουμε δωρεάν βιωματικά εργαστήρια στο μελισσοκομείο μας, τόσο τα Σαββατοκύριακα όσο και τις αργίες. Θα ήταν χαρά μας να σας γνωρίσουμε από κοντά και να περάσουμε μαζί μια δημιουργική μέρα! Τα εργαστήρια απευθύνονται σε παιδιά και μεγάλους, δίνοντας σε κάθε οικογένεια την ευκαιρία να περάσει δημιουργικές στιγμές μαζί. Συμπληρώστε την φόρμα επικοινωνίας ή καλέστε στο 25622305 για περισσότερες πληροφορίες.'

const WORKSHOPS = [
  {
    title: 'Μελισσολαμπάδες',
    image: '/images/activities/ergastiria/workshop-1.webp',
    imageAlt: 'Εργαστήρι κατασκευής μελισσολαμπάδων',
    bold: ['Πάσχα', 'δωρεάν', 'ξεναγηθείτε', 'παίξετε'],
    bookingClosed: false,
    body: [
      'Λίγο πριν το Πάσχα, ποια θα ήταν η καλύτερη δραστηριότητα για εσάς και τα παιδιά σας; Μα βεβαίως η κατασκευή των δικών σας μελισσολαμπάδων! Θα διασκεδάσετε, θα μάθετε για τη μέλισσα και θα φτιάξετε τις δικές σας λαμπάδες: θα τυλίξετε το φυτίλι με τη βάση της κηρήθρας και θα τις διακοσμήσετε με πασχαλινά διακοσμητικά όπως εσείς θέλετε — και θα τις πάρετε δωρεάν μαζί σας.',
      'Επιπλέον, θα ξεναγηθείτε στους χώρους του μελισσοκομείου μας, θα δείτε πώς γίνεται η εμφιάλωση του μελιού, θα γνωρίσετε τη «φωλιά της μέλισσας» — πού και πώς ζει η μέλισσα και ποια η διαφορά μεταξύ μέλισσας, βασίλισσας και κηφήνα — και θα παίξετε ένα παιχνίδι γνώσεων για τη μέλισσα και το μέλι.',
    ],
  },
  {
    title: 'Περιτύλιγμα φαγητού με κερί μέλισσας',
    image: '/images/activities/ergastiria/workshop-2.webp',
    imageAlt: 'Εργαστήρι κατασκευής περιτυλίγματος φαγητού με κερί μέλισσας',
    bold: ['μειώσετε τις πλαστικές μεμβράνες', 'ξεναγηθείτε', 'δωρεάν'],
    bookingClosed: true,
    body: [
      'Εντάξτε την κυκλική οικονομία στην καθημερινότητά σας με έξυπνο, οικονομικό και φιλικό προς το περιβάλλον τρόπο! Θα μάθετε πώς να μειώσετε τις πλαστικές μεμβράνες που τυλίγουμε τα τρόφιμα (sandwich των παιδιών, απομεινάρια φαγητών, φρούτα κ.ά.) και να τις αντικαταστήσετε με περιτυλίγματα από κερί μέλισσας. Χρειάζεστε μόνο κερί μέλισσας και ένα παλιό βαμβακερό ύφασμα — τα υπόλοιπα θα τα μάθετε στο εργαστήριο!',
      'Πέρα από την κατασκευή, θα γνωρίσετε από κοντά την κοινωνία των μελισσών, θα ξεναγηθείτε στους χώρους μας, θα δείτε ζωντανά την εμφιάλωση του μελιού, θα παίξετε ένα παιχνίδι γνώσεων και θα δοκιμάσετε τα είδη μελιών μας. Και όλα αυτά δωρεάν!',
    ],
  },
  {
    title: 'Κέρινες δημιουργίες',
    image: '/images/activities/ergastiria/workshop-3.webp',
    imageAlt: 'Εργαστήρι κέρινες δημιουργίες',
    bold: ['δημιουργική δραστηριότητα', 'ξεναγηθείτε'],
    bookingClosed: false,
    body: [
      'Μια δημιουργική δραστηριότητα για εποικοδομητικό χρόνο με την οικογένεια ή τους φίλους σας: η κατασκευή των δικών σας πολύχρωμων μελισσο-κεριών! Θα τυλίξετε το φυτίλι με τη βάση της κηρήθρας, θα διακοσμήσετε το κερί σας με κορδέλες και θα το πάρετε μαζί σας στο σπίτι για να το στολίσετε. Κατάλληλο για κάθε ηλικία.',
      'Επιπλέον, θα ξεναγηθείτε στους χώρους μας, θα μάθετε πώς γίνεται η εμφιάλωση του μελιού, θα δείτε τη «φωλιά της μέλισσας» και θα παίξετε ένα παιχνίδι γνώσεων για τη μέλισσα και το μέλι.',
    ],
  },
]

const BOOKING_BODY =
  'Για να κλείσετε το εργαστήρι σας, συμπληρώστε τη φόρμα ή καλέστε στο 25622305. Θα λάβετε σχετική ενημέρωση εντός 24 ωρών.'

export default function ErgastiriaPage() {
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
        </RevealStagger>
      </section>

      {/* 3 · Workshops — alternating rows */}
      <section className="bg-offwhite py-12 md:py-[70px]">
        <div className="container-wide flex flex-col gap-14 md:gap-20">
          <SectionHead
            eyebrow="Τα Εργαστήρια"
            heading="Επιλέξτε το Εργαστήρι σας"
            sub="Τρία δημιουργικά εργαστήρια — διαλέξτε αυτό που σας ταιριάζει."
          />
          {WORKSHOPS.map((w, i) => (
            <article key={w.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <Reveal className={cn(i % 2 === 1 && 'lg:order-2')}>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-white shadow-card">
                  <Image
                    src={w.image}
                    alt={w.imageAlt}
                    fill
                    sizes="(min-width:1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
              <RevealStagger
                className={cn('flex flex-col gap-4', i % 2 === 1 && 'lg:order-1')}
                stagger={0.07}
              >
                <RevealStaggerItem>
                  <span className="inline-flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
                    <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold-strong text-[13px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(241,172,16,0.75)]">
                      {i + 1}
                    </span>
                    Εργαστήρι {i + 1}
                  </span>
                </RevealStaggerItem>
                <RevealStaggerItem>
                  <h3 className="font-display text-[24px] font-bold leading-[1.15] text-foreground md:text-[30px]">
                    {w.title}
                  </h3>
                </RevealStaggerItem>
                {w.body.map((p, j) => (
                  <RevealStaggerItem key={j}>
                    <p className="text-[15.5px] leading-[1.7] text-muted">
                      <BoldText text={p} bold={w.bold} />
                    </p>
                  </RevealStaggerItem>
                ))}
                <RevealStaggerItem>
                  {w.bookingClosed ? (
                    <span
                      aria-disabled="true"
                      className="mt-1 inline-flex cursor-not-allowed select-none items-center gap-2 self-start whitespace-nowrap rounded-[4px] border border-border bg-offwhite px-[16px] py-[13px] text-[14px] font-medium text-muted"
                    >
                      <Lock className="size-4" aria-hidden="true" />
                      Οι κρατήσεις έχουν κλείσει
                    </span>
                  ) : (
                    <CtaLink href="#cta" variant="gold" className="mt-1 self-start">
                      Κάντε κράτηση
                    </CtaLink>
                  )}
                </RevealStaggerItem>
              </RevealStagger>
            </article>
          ))}
        </div>
      </section>

      {/* 4 · Booking CTA + form */}
      <section id="cta" className="scroll-mt-24 py-12 md:py-[70px]">
        <div className="container-wide">
          <Reveal className="relative isolate overflow-hidden rounded-[30px] bg-accent p-8 text-white md:p-14">
            <FormVideoBg />
            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
              <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cream">
                  Κράτηση
                </span>
                <h2 className="font-display text-[28px] font-bold leading-[1.15] text-white md:text-[38px]">
                  Κλείστε το εργαστήρι σας
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
              <BookingForm activityName="Εργαστήρια" startHour={8} endHour={16} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
