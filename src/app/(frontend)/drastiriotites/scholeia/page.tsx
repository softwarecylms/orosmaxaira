import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookOpenText,
  Check,
  ChevronRight,
  Clock,
  Cookie,
  Gift,
  GraduationCap,
  Info,
  Palette,
  PartyPopper,
  ShieldAlert,
  Users,
  Video,
} from 'lucide-react'
import { RevealUp } from '@/components/home/reveal-up'
import { SchoolBookingCard } from '@/components/scholeia/school-booking-card'
import { SCHOOL_WORKSHOP_OPTIONS } from '@/lib/data/school-visit'

export const metadata: Metadata = {
  title: 'Εκπαιδευτικές Επισκέψεις Σχολείων',
  description:
    'Οργανωμένο εκπαιδευτικό πρόγραμμα για δημοτικά σχολεία στο μελισσοκομείο του Όρους Μαχαιρά: ξενάγηση, δημιουργικό εργαστήριο και ελεύθερο παιχνίδι. Διάρκεια ~2ω30′, έως 50 μαθητές. Κλείστε την επίσκεψή σας online.',
}

const PILLS = [
  { icon: Clock, label: '≈ 2ω 30′ · 09:30–12:00' },
  { icon: Users, label: 'Έως 50 μαθητές' },
  { icon: GraduationCap, label: 'Δημοτικά σχολεία' },
]

// Δραστηριότητα 1 — the guided tour's four stops.
const TOUR_STOPS = [
  {
    icon: BookOpenText,
    text: 'Επίσκεψη στο σπιτάκι μελισσοθεραπείας για γνωριμία με τα προϊόντα της μέλισσας και τις χρήσεις τους, καθώς και εκμάθηση των ρόλων των μελισσών μέσα στην κυψέλη.',
  },
  {
    icon: Video,
    text: 'Προβολή εκπαιδευτικού βίντεο που παρουσιάζει μια βασίλισσα μέλισσα να γεννά, μαζί με ενδιαφέρουσες πληροφορίες για την ανατομία και την επικοινωνία των μελισσών.',
  },
  {
    icon: Gift,
    text: 'Quiz γνώσεων με μικρά δώρα από το κατάστημά μας για τους συμμετέχοντες.',
  },
  {
    icon: Cookie,
    text: 'Γευσιγνωσία μελιού και σημαντικές πληροφορίες σχετικά με το μέλι.',
  },
]

const NOTES = [
  {
    icon: Cookie,
    title: 'Σνακ & Ποτά',
    body: 'Τα παιδιά θα πρέπει να φέρουν τα δικά τους σνακ. Στον χώρο μας διατίθενται μόνο μέλι και προϊόντα της μέλισσας.',
  },
  {
    icon: Users,
    title: 'Επίβλεψη',
    body: 'Κατά τη διάρκεια του ελεύθερου παιχνιδιού, η επίβλεψη παραμένει αποκλειστικά ευθύνη των συνοδών.',
  },
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[22px] font-bold leading-[1.2] text-foreground md:text-[26px]">
      {children}
    </h2>
  )
}

function ActivityHead({
  n,
  icon: Icon,
  title,
}: {
  n: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold-strong text-[14px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(241,172,16,0.75)]">
        {n}
      </span>
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-gold-strong">
          <Icon className="size-3.5" aria-hidden={true} />
          Δραστηριότητα {n} · 45 λεπτά
        </span>
        <h3 className="font-display text-[18px] font-bold leading-[1.2] text-foreground md:text-[20px]">
          {title}
        </h3>
      </div>
    </div>
  )
}

export default function SchoolVisitsPage() {
  return (
    <>
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
            <span className="text-foreground">Εκπαιδευτικές Επισκέψεις Σχολείων</span>
          </nav>
        </RevealUp>
      </div>

      <section className="container-page pb-12 pt-2 md:pb-[60px]">
        {/* Header */}
        <RevealUp>
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-[32px] font-bold leading-[1.06] text-foreground md:text-[46px]">
              Εκπαιδευτικές Επισκέψεις Σχολείων
            </h1>
            <ul className="flex flex-wrap items-center gap-2">
              {PILLS.map((p) => (
                <li
                  key={p.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-[13px] font-semibold text-gold-strong"
                >
                  <p.icon className="size-3.5" aria-hidden="true" />
                  {p.label}
                </li>
              ))}
            </ul>
          </div>
        </RevealUp>

        {/* Hero image */}
        <RevealUp className="mt-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-offwhite shadow-card md:aspect-[16/7]">
            <Image
              src="/images/adopt/visit-2.webp"
              alt="Μαθητές σε εκπαιδευτική επίσκεψη στο μελισσοκομείο του Όρους Μαχαιρά"
              fill
              priority
              sizes="(min-width:1280px) 1216px, 100vw"
              className="object-cover"
            />
          </div>
        </RevealUp>

        {/* Content + sticky booking card */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-12">
          <div className="flex min-w-0 flex-col gap-11">
            {/* Περιγραφή */}
            <section className="flex flex-col gap-4">
              <SectionHeading>Περιγραφή</SectionHeading>
              <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
                Το μελισσοκομείο μας είναι ανοικτό για επισκέψεις για τα δημοτικά σχολεία. Έχουμε
                διαμορφώσει ένα πρόγραμμα το οποίο ανταποκρίνεται στις εκπαιδευτικές ανάγκες των
                μαθητών, συνδυάζοντας πληροφόρηση, δημιουργικότητα και επαφή με τη φύση.
              </p>
              <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
                Ανυπομονούμε να σας υποδεχτούμε μαζί με τα παιδιά για μια όμορφη, εκπαιδευτική ημέρα
                γεμάτη γνώση και ψυχαγωγία.
              </p>
            </section>

            {/* Το πρόγραμμα — three rotating activities */}
            <section className="flex flex-col gap-6">
              <SectionHeading>Το πρόγραμμα</SectionHeading>
              <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
                Τα παιδιά χωρίζονται σε δύο ή τρεις ομάδες, ανάλογα με τον αριθμό των μαθητών, και
                εναλλάσσονται στις ακόλουθες τρεις δραστηριότητες — κάθε 45 λεπτά.
              </p>

              <div className="flex flex-col gap-4">
                {/* Δ1 */}
                <div className="flex flex-col gap-5 rounded-[16px] bg-offwhite p-5 ring-1 ring-border/50 md:p-6">
                  <ActivityHead n="1" icon={BookOpenText} title="Εκπαιδευτική Ξενάγηση" />
                  <p className="text-[15px] leading-[1.7] text-muted">
                    Μια οργανωμένη περιήγηση στους εσωτερικούς και εξωτερικούς εκπαιδευτικούς μας
                    χώρους, η οποία περιλαμβάνει:
                  </p>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {TOUR_STOPS.map((s) => (
                      <li
                        key={s.text}
                        className="flex items-start gap-3 rounded-[12px] bg-white p-4 ring-1 ring-border/50"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                          <s.icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="text-[14px] leading-[1.55] text-foreground">{s.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Δ2 */}
                <div className="flex flex-col gap-5 rounded-[16px] bg-offwhite p-5 ring-1 ring-border/50 md:p-6">
                  <ActivityHead n="2" icon={Palette} title="Δημιουργικό Εργαστήριο" />
                  <p className="text-[15px] leading-[1.7] text-muted">
                    Επιλέγετε <strong className="font-semibold text-foreground">ένα</strong> από τα
                    δύο βιωματικά εργαστήρια:
                  </p>
                  <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
                    {SCHOOL_WORKSHOP_OPTIONS.map((opt, i) => (
                      <div key={opt.key} className="contents">
                        <div className="flex flex-col overflow-hidden rounded-[14px] bg-white ring-1 ring-border/50">
                          <div className="relative aspect-[16/9] w-full overflow-hidden">
                            <Image
                              src={opt.image}
                              alt={opt.short}
                              fill
                              sizes="(min-width:768px) 30vw, 100vw"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5 p-4">
                            <h4 className="font-display text-[16px] font-bold leading-[1.25] text-foreground">
                              {opt.short}
                            </h4>
                            <p className="text-[13.5px] leading-[1.55] text-muted">
                              {opt.description}
                            </p>
                          </div>
                        </div>
                        {i === 0 ? (
                          <div className="flex items-center justify-center">
                            <span className="flex size-9 items-center justify-center rounded-full bg-white text-[13px] font-bold uppercase text-muted ring-1 ring-border">
                              ή
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <p className="flex items-start gap-2 rounded-[12px] bg-accent/10 px-4 py-3 text-[13.5px] font-medium leading-[1.55] text-gold-strong">
                    <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    Και στα δύο εργαστήρια, τα παιδιά παίρνουν μαζί τους την κατασκευή τους.
                  </p>
                </div>

                {/* Δ3 */}
                <div className="flex flex-col gap-4 rounded-[16px] bg-offwhite p-5 ring-1 ring-border/50 md:p-6">
                  <ActivityHead n="3" icon={PartyPopper} title="Ελεύθερο Παιχνίδι στον Παιδότοπο" />
                  <p className="text-[15px] leading-[1.7] text-muted">
                    Τα παιδιά θα απολαύσουν ελεύθερο παιχνίδι στον χώρο της παιδικής χαράς, με χρόνο
                    για ξεκούραση και σνακ.
                  </p>
                </div>
              </div>
            </section>

            {/* Διάρκεια & ροή */}
            <section className="flex flex-col gap-5">
              <SectionHeading>Διάρκεια & ροή</SectionHeading>
              <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
                Το πρόγραμμα διαρκεί περίπου 2 ώρες και 30 λεπτά, μεταξύ 09:30–12:00
                (συμπεριλαμβάνεται και ο χρόνος που θα χρειαστούν τα παιδιά για να φάνε το πρωινό που
                θα φέρουν μαζί τους). Είναι ευέλικτο ανάλογα με την ώρα άφιξής σας, με όλες τις ομάδες
                να εναλλάσσονται κάθε 45 λεπτά.
              </p>
              <p className="flex items-start gap-2.5 rounded-[14px] bg-accent-soft p-4 text-[14px] leading-[1.6] text-foreground/80 ring-1 ring-accent/15">
                <Info className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-foreground/90">
                    Μέγιστος αριθμός συμμετεχόντων:{' '}
                  </span>
                  50 μαθητές.
                </span>
              </p>
            </section>

            {/* Σημαντικές σημειώσεις */}
            <section className="flex flex-col gap-5">
              <SectionHeading>Σημαντικές σημειώσεις</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                {NOTES.map((n) => (
                  <div
                    key={n.title}
                    className="flex items-start gap-4 rounded-[16px] bg-offwhite p-5 ring-1 ring-border/50"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <n.icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-display text-[17px] font-bold text-foreground">
                        {n.title}
                      </h3>
                      <p className="text-[14px] leading-[1.6] text-muted">{n.body}</p>
                    </div>
                  </div>
                ))}

                {/* Allergies — safety warning, emphasised */}
                <div className="flex items-start gap-4 rounded-[16px] border border-accent/40 bg-accent/[0.07] p-5 sm:col-span-2">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                    <ShieldAlert className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-[17px] font-bold text-foreground">
                      Αλλεργίες & Ιατρικές Καταστάσεις
                    </h3>
                    <p className="text-[14px] leading-[1.6] text-muted">
                      Παρακαλούμε να μας ενημερώσετε{' '}
                      <strong className="font-semibold text-foreground">εκ των προτέρων</strong> για
                      τυχόν ιατρικές καταστάσεις ή αλλεργίες (κυρίως σε ξηρούς καρπούς, μέλι,
                      μέλισσες).
                    </p>
                    <p className="text-[14px] leading-[1.6] text-muted">
                      Καθώς οι μέλισσες υπάρχουν φυσικά στο περιβάλλον μας, παιδιά ή προσωπικό με{' '}
                      <strong className="font-semibold text-foreground">
                        αλλεργία στις μέλισσες συνιστάται έντονα να μην συμμετέχουν
                      </strong>{' '}
                      στην επίσκεψη.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Offset clears the sticky header (~150px) so the card's top isn't
              tucked underneath it. */}
          <div className="lg:sticky lg:top-[150px] lg:self-start">
            <SchoolBookingCard />
          </div>
        </div>
      </section>
    </>
  )
}
