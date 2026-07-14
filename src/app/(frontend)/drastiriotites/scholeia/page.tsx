import type { Metadata } from 'next'
import Image from 'next/image'
import {
  ArrowRight,
  BookOpenText,
  Check,
  Clock,
  Cookie,
  Euro,
  GraduationCap,
  Gift,
  Info,
  Palette,
  PartyPopper,
  ShieldAlert,
  Users,
  Video,
} from 'lucide-react'
import { PageHero } from '@/components/shared/page-hero'
import { SectionHead } from '@/components/shared/section-head'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { FormVideoBg } from '@/components/adopt/form-video-bg'
import { SchoolVisitForm } from '@/components/scholeia/school-visit-form'
import { SCHOOL_PRICING, SCHOOL_WORKSHOP_OPTIONS } from '@/lib/data/school-visit'

export const metadata: Metadata = {
  title: 'Εκπαιδευτικές Επισκέψεις Σχολείων',
  description:
    'Οργανωμένο εκπαιδευτικό πρόγραμμα για δημοτικά σχολεία στο μελισσοκομείο του Όρους Μαχαιρά: ξενάγηση, δημιουργικό εργαστήριο και ελεύθερο παιχνίδι. Διάρκεια ~2ω30′, έως 50 μαθητές. Κλείστε την επίσκεψή σας online.',
}

const QUICK_FACTS = [
  { icon: Clock, value: '≈ 2ω 30′', label: 'Διάρκεια · 09:30–12:00' },
  { icon: GraduationCap, value: '3 × 45′', label: 'Δραστηριότητες εναλλάξ' },
  { icon: Users, value: 'Έως 50', label: 'μαθητές ανά επίσκεψη' },
  { icon: Euro, value: 'Από €7', label: 'ανά παιδί · συνοδοί δωρεάν' },
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

// Reusable numbered-activity header.
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
    <div className="flex items-center gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-[16px] font-bold text-white">
        {n}
      </span>
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-gold-strong">
          <Icon className="size-3.5" aria-hidden={true} />
          Δραστηριότητα {n} · 45 λεπτά
        </span>
        <h3 className="font-display text-[21px] font-bold leading-[1.2] text-foreground md:text-[24px]">
          {title}
        </h3>
      </div>
    </div>
  )
}

export default function SchoolVisitsPage() {
  return (
    <>
      {/* 1 · Hero */}
      <PageHero
        image="/images/adopt/visit-2.webp"
        imageAlt="Μαθητές σε εκπαιδευτική επίσκεψη στο μελισσοκομείο του Όρους Μαχαιρά"
        eyebrow="Όρος Μαχαιρά Academy · Για Σχολεία"
        title="Εκπαιδευτικές Επισκέψεις Σχολείων"
        description="Ένα οργανωμένο πρόγραμμα για δημοτικά σχολεία που συνδυάζει πληροφόρηση, δημιουργικότητα και επαφή με τη φύση."
        overlayClassName="bg-black/40"
        buttons={[
          { label: 'Το πρόγραμμα', href: '#programma' },
          { label: 'Κλείστε επίσκεψη', href: '#booking' },
        ]}
      />

      {/* 2 · Intro + quick facts */}
      <section className="container-wide py-12 md:py-[70px]">
        <Reveal className="mx-auto flex max-w-[820px] flex-col items-center gap-5 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
            Το πρόγραμμα με μια ματιά
          </span>
          <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">
            Το μελισσοκομείο μας είναι ανοικτό για επισκέψεις για τα δημοτικά σχολεία. Έχουμε
            διαμορφώσει ένα πρόγραμμα το οποίο ανταποκρίνεται στις εκπαιδευτικές ανάγκες των μαθητών,
            συνδυάζοντας <strong className="font-semibold text-foreground">πληροφόρηση</strong>,{' '}
            <strong className="font-semibold text-foreground">δημιουργικότητα</strong> και{' '}
            <strong className="font-semibold text-foreground">επαφή με τη φύση</strong>. Πιο κάτω θα
            δείτε πώς είναι διαμορφωμένο το πρόγραμμα αυτή τη στιγμή.
          </p>
        </Reveal>

        <RevealStagger className="mx-auto mt-10 grid max-w-[960px] grid-cols-2 gap-4 lg:grid-cols-4">
          {QUICK_FACTS.map((f) => (
            <RevealStaggerItem key={f.label} className="flex">
              <div className="flex w-full flex-col items-center gap-1.5 rounded-[16px] border border-border bg-white px-4 py-6 text-center shadow-card">
                <f.icon className="size-6 text-accent" aria-hidden="true" />
                <span className="font-display text-[22px] font-bold leading-none text-foreground">
                  {f.value}
                </span>
                <span className="text-[12.5px] leading-[1.4] text-muted">{f.label}</span>
              </div>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </section>

      {/* 3 · The programme — three rotating activities */}
      <section id="programma" className="scroll-mt-24 bg-offwhite py-12 md:py-[70px]">
        <div className="container-wide flex flex-col gap-10">
          <SectionHead
            eyebrow="Προγραμματισμένες Δραστηριότητες"
            heading="Τρεις δραστηριότητες, εναλλάξ"
            sub="Τα παιδιά χωρίζονται σε δύο ή τρεις ομάδες, ανάλογα με τον αριθμό των μαθητών, και εναλλάσσονται στις τρεις δραστηριότητες — κάθε 45 λεπτά."
            className="max-w-[820px]"
          />

          <div className="flex flex-col gap-6">
            {/* Δ1 — Educational tour */}
            <Reveal className="flex flex-col gap-6 rounded-[18px] border border-border bg-white p-6 shadow-card md:p-8">
              <ActivityHead n="01" icon={BookOpenText} title="Εκπαιδευτική Ξενάγηση" />
              <p className="text-[15.5px] leading-[1.7] text-muted">
                Μια οργανωμένη περιήγηση στους εσωτερικούς και εξωτερικούς εκπαιδευτικούς μας χώρους,
                η οποία περιλαμβάνει:
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {TOUR_STOPS.map((s) => (
                  <li
                    key={s.text}
                    className="flex items-start gap-3 rounded-[12px] bg-offwhite p-4"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <s.icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-[14.5px] leading-[1.6] text-foreground">{s.text}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Δ2 — Creative workshop (choose one of two) */}
            <Reveal className="flex flex-col gap-6 rounded-[18px] border border-border bg-white p-6 shadow-card md:p-8">
              <ActivityHead n="02" icon={Palette} title="Δημιουργικό Εργαστήριο" />
              <p className="text-[15.5px] leading-[1.7] text-muted">
                Επιλέγετε <strong className="font-semibold text-foreground">ένα</strong> από τα δύο
                βιωματικά εργαστήρια:
              </p>
              <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
                {SCHOOL_WORKSHOP_OPTIONS.map((opt, i) => (
                  <div key={opt.key} className="contents">
                    <div className="flex flex-col overflow-hidden rounded-[14px] border border-border bg-white">
                      <div className="relative aspect-[16/9] w-full overflow-hidden">
                        <Image
                          src={opt.image}
                          alt={opt.short}
                          fill
                          sizes="(min-width:768px) 40vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 p-5">
                        <h4 className="font-display text-[17px] font-bold leading-[1.25] text-foreground">
                          {opt.short}
                        </h4>
                        <p className="text-[14px] leading-[1.6] text-muted">{opt.description}</p>
                      </div>
                    </div>
                    {i === 0 ? (
                      <div className="flex items-center justify-center">
                        <span className="flex size-10 items-center justify-center rounded-full border border-border bg-offwhite text-[13px] font-bold uppercase text-muted">
                          ή
                        </span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="flex items-start gap-2 rounded-[12px] bg-accent/10 px-4 py-3 text-[14px] font-medium leading-[1.6] text-gold-strong">
                <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Και στα δύο εργαστήρια, τα παιδιά παίρνουν μαζί τους την κατασκευή τους.
              </p>
            </Reveal>

            {/* Δ3 — Free play */}
            <Reveal className="flex flex-col gap-4 rounded-[18px] border border-border bg-white p-6 shadow-card md:p-8">
              <ActivityHead n="03" icon={PartyPopper} title="Ελεύθερο Παιχνίδι στον Παιδότοπο" />
              <p className="text-[15.5px] leading-[1.7] text-muted">
                Τα παιδιά θα απολαύσουν ελεύθερο παιχνίδι στον χώρο της παιδικής χαράς, με χρόνο για
                ξεκούραση και σνακ.
              </p>
            </Reveal>
          </div>

          {/* Duration & flow */}
          <Reveal className="flex flex-col gap-5 rounded-[18px] bg-accent p-6 text-white md:flex-row md:items-center md:gap-8 md:p-8">
            <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-1">
              <Clock className="size-7 text-cream" aria-hidden="true" />
              <span className="font-display text-[22px] font-bold leading-tight md:text-[26px]">
                ≈ 2ω 30′
              </span>
            </div>
            <p className="text-[15px] leading-[1.7] text-white/90">
              Το πρόγραμμα διαρκεί περίπου <strong className="font-semibold text-white">2 ώρες
              και 30 λεπτά</strong>, μεταξύ{' '}
              <strong className="font-semibold text-white">09:30–12:00</strong> (συμπεριλαμβάνεται
              και ο χρόνος για το πρωινό που θα φέρουν μαζί τους τα παιδιά). Είναι ευέλικτο ανάλογα
              με την ώρα άφιξής σας, με όλες τις ομάδες να εναλλάσσονται κάθε 45 λεπτά.{' '}
              <strong className="font-semibold text-white">Μέγιστος αριθμός συμμετεχόντων: 50
              μαθητές.</strong>
            </p>
          </Reveal>
        </div>
      </section>

      {/* 4 · Important notes */}
      <section className="container-wide py-12 md:py-[70px]">
        <div className="flex flex-col gap-10">
          <SectionHead
            eyebrow="Πριν έρθετε"
            heading="Σημαντικές Σημειώσεις"
            sub="Λίγα πράγματα που καλό είναι να γνωρίζετε για μια ασφαλή και ξέγνοιαστη επίσκεψη."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {NOTES.map((n) => (
              <Reveal
                key={n.title}
                className="flex items-start gap-4 rounded-[16px] border border-border bg-white p-6 shadow-card"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <n.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-[18px] font-bold text-foreground">{n.title}</h3>
                  <p className="text-[14.5px] leading-[1.6] text-muted">{n.body}</p>
                </div>
              </Reveal>
            ))}

            {/* Allergies — safety warning, emphasised */}
            <Reveal className="flex items-start gap-4 rounded-[16px] border border-accent/40 bg-accent/[0.07] p-6 shadow-card md:col-span-2">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                <ShieldAlert className="size-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-[18px] font-bold text-foreground">
                  Αλλεργίες & Ιατρικές Καταστάσεις
                </h3>
                <p className="text-[14.5px] leading-[1.6] text-muted">
                  Παρακαλούμε να μας ενημερώσετε <strong className="font-semibold text-foreground">εκ
                  των προτέρων</strong> για τυχόν ιατρικές καταστάσεις ή αλλεργίες (κυρίως σε ξηρούς
                  καρπούς, μέλι, μέλισσες).
                </p>
                <p className="text-[14.5px] leading-[1.6] text-muted">
                  Καθώς οι μέλισσες υπάρχουν φυσικά στο περιβάλλον μας, παιδιά ή προσωπικό με{' '}
                  <strong className="font-semibold text-foreground">αλλεργία στις μέλισσες
                  συνιστάται έντονα να μην συμμετέχουν</strong> στην επίσκεψη.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5 · Pricing */}
      <section id="kostos" className="scroll-mt-24 bg-offwhite py-12 md:py-[70px]">
        <div className="container-wide flex flex-col gap-10">
          <SectionHead
            eyebrow="Κόστος"
            heading="Τιμές & τι περιλαμβάνεται"
            sub="Όλες οι τιμές συμπεριλαμβάνουν ΦΠΑ."
          />
          <RevealStagger className="grid gap-5 md:grid-cols-3">
            {SCHOOL_PRICING.map((tier) => (
              <RevealStaggerItem key={tier.range} className="flex">
                <div className="flex w-full flex-col items-center gap-2 rounded-[18px] border border-border bg-white px-6 py-8 text-center shadow-card">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-gold-strong">
                    {tier.range}
                  </span>
                  <span className="font-display text-[34px] font-bold leading-none text-foreground">
                    {tier.price === null ? 'Δωρεάν' : `€${tier.price}`}
                  </span>
                  <span className="text-[13.5px] leading-[1.4] text-muted">{tier.note}</span>
                </div>
              </RevealStaggerItem>
            ))}
          </RevealStagger>
          <Reveal className="mx-auto flex max-w-[720px] flex-col gap-2 text-center">
            <p className="inline-flex items-center justify-center gap-2 text-[14.5px] leading-[1.6] text-muted">
              <Info className="size-4 shrink-0 text-accent" aria-hidden="true" />
              Η τιμή περιλαμβάνει όλα τα υλικά των εργαστηρίων, καθώς και τα δώρα του quiz.
            </p>
            <p className="text-[13.5px] leading-[1.6] text-muted">
              Με την επιβεβαίωση της επίσκεψής σας, αποδέχεστε τους παραπάνω όρους.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 6 · Booking */}
      <section id="booking" className="scroll-mt-24 py-12 md:py-[70px]">
        <div className="container-wide">
          <Reveal className="relative isolate overflow-hidden rounded-[30px] bg-accent p-8 text-white md:p-14">
            <FormVideoBg />
            <div className="relative z-10 grid items-start gap-10 lg:grid-cols-2">
              <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cream">
                  Κράτηση
                </span>
                <h2 className="font-display text-[28px] font-bold leading-[1.15] text-white md:text-[38px]">
                  Κλείστε την επίσκεψή σας
                </h2>
                <p className="max-w-[520px] text-[16px] leading-[1.6] text-white/85">
                  Συμπληρώστε τα στοιχεία του σχολείου σας και θα επικοινωνήσουμε μαζί σας για την
                  επιβεβαίωση της ημερομηνίας. Ανυπομονούμε να σας υποδεχτούμε μαζί με τα παιδιά για
                  μια όμορφη, εκπαιδευτική ημέρα γεμάτη γνώση και ψυχαγωγία.
                </p>
              </div>
              <SchoolVisitForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
