import type { Metadata } from 'next'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
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
import {
  MAX_STUDENTS,
  SCHOOL_PRICING,
  SCHOOL_WORKSHOP_OPTIONS,
  getSchoolVisit,
} from '@/lib/data/school-visit'

const EN_SCHOOL = getSchoolVisit('en')
import { getSchoolProgram } from '@/lib/medusa/school-program'
import { getActivitiesUi } from '@/components/activities/activities-content'
import { hreflangAlternates } from '@/lib/seo'

/** Page-level chrome copy (labels not part of the shared UI or the Medusa data). */
function pageCopy(locale: string) {
  return locale === 'en'
    ? {
        activityLabel: (n: string) => `Activity ${n} · 45 min`,
        workshopTitle: 'Creative Workshop',
        or: 'or',
        pillDuration: 'Approx. 2 hrs 30 min · 09:30–12:00',
        pillMax: (n: number) => `Up to ${n} students`,
        pillLevel: 'Primary schools',
        sectionProgram: 'The programme',
        sectionDuration: 'Duration & flow',
        sectionNotes: 'Important notes',
        maxParticipants: 'Maximum number of participants: ',
        studentsUnit: (n: number) => `${n} students.`,
      }
    : {
        activityLabel: (n: string) => `Δραστηριότητα ${n} · 45 λεπτά`,
        workshopTitle: 'Δημιουργικό Εργαστήριο',
        or: 'ή',
        pillDuration: '≈ 2ω 30′ · 09:30–12:00',
        pillMax: (n: number) => `Έως ${n} μαθητές`,
        pillLevel: 'Δημοτικά σχολεία',
        sectionProgram: 'Το πρόγραμμα',
        sectionDuration: 'Διάρκεια & ροή',
        sectionNotes: 'Σημαντικές σημειώσεις',
        maxParticipants: 'Μέγιστος αριθμός συμμετεχόντων: ',
        studentsUnit: (n: number) => `${n} μαθητές.`,
      }
}

// Live so admin edits reflect; falls back to the static copy if Medusa is down.
export const dynamic = 'force-dynamic'

const TOUR_ICONS = [BookOpenText, Video, Gift, Cookie]
const NOTE_ICONS = [Cookie, Users]

type PView = {
  title: string
  heroImage: string
  heroAlt: string
  intro: string
  closing: string
  programNote: string
  tourTitle: string
  tourIntro: string
  tourStops: { text: string }[]
  workshopIntro: string
  workshopOptions: { key: string; short: string; description: string }[]
  workshopNote: string
  playTitle: string
  playText: string
  durationText: string
  maxStudents: number
  pricing: { range: string; price: number | null; note?: string }[]
  notes: { title: string; body: string }[]
  allergyTitle: string
  allergyBody: string[]
  metaTitle: string
  metaDescription?: string
}

const FALLBACK_EL: PView = {
  title: 'Εκπαιδευτικές Επισκέψεις Σχολείων',
  heroImage: '/images/adopt/visit-2.webp',
  heroAlt: 'Μαθητές σε εκπαιδευτική επίσκεψη στο μελισσοκομείο του Όρους Μαχαιρά',
  intro:
    'Το μελισσοκομείο μας είναι ανοικτό για επισκέψεις για τα δημοτικά σχολεία. Έχουμε διαμορφώσει ένα πρόγραμμα το οποίο ανταποκρίνεται στις εκπαιδευτικές ανάγκες των μαθητών, συνδυάζοντας πληροφόρηση, δημιουργικότητα και επαφή με τη φύση.',
  closing:
    'Ανυπομονούμε να σας υποδεχτούμε μαζί με τα παιδιά για μια όμορφη, εκπαιδευτική ημέρα γεμάτη γνώση και ψυχαγωγία.',
  programNote:
    'Τα παιδιά χωρίζονται σε δύο ή τρεις ομάδες, ανάλογα με τον αριθμό των μαθητών, και εναλλάσσονται στις ακόλουθες τρεις δραστηριότητες — κάθε 45 λεπτά.',
  tourTitle: 'Εκπαιδευτική Ξενάγηση',
  tourIntro:
    'Μια οργανωμένη περιήγηση στους εσωτερικούς και εξωτερικούς εκπαιδευτικούς μας χώρους, η οποία περιλαμβάνει:',
  tourStops: [
    {
      text: 'Επίσκεψη στο σπιτάκι μελισσοθεραπείας για γνωριμία με τα προϊόντα της μέλισσας και τις χρήσεις τους, καθώς και εκμάθηση των ρόλων των μελισσών μέσα στην κυψέλη.',
    },
    {
      text: 'Προβολή εκπαιδευτικού βίντεο που παρουσιάζει μια βασίλισσα μέλισσα να γεννά, μαζί με ενδιαφέρουσες πληροφορίες για την ανατομία και την επικοινωνία των μελισσών.',
    },
    { text: 'Quiz γνώσεων με μικρά δώρα από το κατάστημά μας για τους συμμετέχοντες.' },
    { text: 'Γευσιγνωσία μελιού και σημαντικές πληροφορίες σχετικά με το μέλι.' },
  ],
  workshopIntro: 'Επιλέγετε ένα από τα δύο βιωματικά εργαστήρια:',
  workshopOptions: SCHOOL_WORKSHOP_OPTIONS as unknown as PView['workshopOptions'],
  workshopNote: 'Και στα δύο εργαστήρια, τα παιδιά παίρνουν μαζί τους την κατασκευή τους.',
  playTitle: 'Ελεύθερο παιχνίδι',
  playText:
    'Χρόνος στον παιδότοπο για παιχνίδι, ξεκούραση και σνακ.',
  durationText:
    'Το πρόγραμμα διαρκεί περίπου 2 ώρες και 30 λεπτά, μεταξύ 09:30–12:00 (συμπεριλαμβάνεται και ο χρόνος που θα χρειαστούν τα παιδιά για να φάνε το πρωινό που θα φέρουν μαζί τους). Το πρόγραμμα είναι ευέλικτο ανάλογα με την ώρα άφιξής σας, με όλες τις ομάδες να εναλλάσσονται κάθε 45 λεπτά.',
  maxStudents: MAX_STUDENTS,
  pricing: SCHOOL_PRICING,
  notes: [
    {
      title: 'Σνακ & Ποτά',
      body: 'Τα παιδιά θα πρέπει να φέρουν τα δικά τους σνακ. Στον χώρο μας διατίθενται μόνο μέλι και προϊόντα της μέλισσας.',
    },
    {
      title: 'Επίβλεψη',
      body: 'Κατά τη διάρκεια του ελεύθερου παιχνιδιού, η επίβλεψη παραμένει αποκλειστικά ευθύνη των συνοδών.',
    },
  ],
  allergyTitle: 'Αλλεργίες & Ιατρικές Καταστάσεις',
  allergyBody: [
    'Παρακαλούμε να μας ενημερώσετε εκ των προτέρων για τυχόν ιατρικές καταστάσεις ή αλλεργίες (κυρίως σε ξηρούς καρπούς, μέλι, μέλισσες).',
    'Καθώς οι μέλισσες υπάρχουν φυσικά στο περιβάλλον μας, παιδιά ή προσωπικό με αλλεργία στις μέλισσες δεν πρέπει να συμμετέχουν στην επίσκεψη.',
  ],
  metaTitle: 'Εκπαιδευτικές Επισκέψεις Σχολείων',
  metaDescription:
    'Οργανωμένο εκπαιδευτικό πρόγραμμα για δημοτικά σχολεία στο μελισσοκομείο του Όρους Μαχαιρά: ξενάγηση, δημιουργικό εργαστήριο και ελεύθερο παιχνίδι.',
}

// English fallback. The workshop options + pricing come from the (Greek)
// school-visit data module and are reused verbatim.
const FALLBACK_EN: PView = {
  title: 'School Educational Visits',
  heroImage: '/images/adopt/visit-2.webp',
  heroAlt: 'Students on an educational visit to the Oros Machaira apiary',
  intro:
    'Our apiary is open to primary school groups. We have designed a programme that meets pupils’ educational needs, combining information, creativity and contact with nature.',
  closing:
    'We look forward to welcoming you and the children for a beautiful, educational day full of knowledge and fun.',
  programNote:
    'The children are split into two or three groups, depending on the number of pupils, and rotate through the three activities below, changing every 45 minutes.',
  tourTitle: 'Educational Tour',
  tourIntro:
    'An organised tour of our indoor and outdoor educational spaces, which includes:',
  tourStops: [
    {
      text: 'A visit to our apitherapy room to get to know the products of the bee and their uses, and to learn about the roles of the bees within the hive.',
    },
    {
      text: 'A screening of an educational video showing a queen bee laying eggs, along with interesting facts about the anatomy and communication of bees.',
    },
    { text: 'A quiz, with a small gift from our shop for every participant.' },
    { text: 'A honey tasting and important information about honey.' },
  ],
  workshopIntro: 'You choose one of the two hands-on workshops:',
  workshopOptions: EN_SCHOOL.workshopOptions as unknown as PView['workshopOptions'],
  workshopNote: 'In both workshops, the children take their creation home with them.',
  playTitle: 'Free play',
  playText:
    'Time in the playground to run around, rest and have a snack.',
  durationText:
    'The programme lasts approximately 2 hours and 30 minutes, between 09:30–12:00 (including the time the children will need to eat the breakfast they bring with them). The schedule is flexible, depending on your arrival time, with all groups rotating every 45 minutes.',
  maxStudents: MAX_STUDENTS,
  pricing: EN_SCHOOL.pricing,
  notes: [
    {
      title: 'Snacks & Drinks',
      body: 'The children should bring their own snacks. The only food and drink available on site are our honey and bee products.',
    },
    {
      title: 'Supervision',
      body: 'During free play, supervision remains solely the responsibility of the accompanying adults.',
    },
  ],
  allergyTitle: 'Allergies & Medical Conditions',
  allergyBody: [
    'Please inform us in advance of any medical conditions or allergies (mainly to nuts, honey, bees).',
    'As bees are naturally present in our environment, children or staff with a bee allergy must not take part in the visit.',
  ],
  metaTitle: 'School Educational Visits',
  metaDescription:
    'An organised educational programme for primary schools at the Oros Machaira apiary: a tour, a creative workshop and free play.',
}

async function loadProgram(locale: string): Promise<PView> {
  const FALLBACK = locale === 'en' ? FALLBACK_EN : FALLBACK_EL
  const raw = await getSchoolProgram()
  if (!raw) return FALLBACK
  // For /en, read ONLY the translations.en overlay (the Greek base must not leak
  // in); anything not translated falls back to the English FALLBACK below.
  const p = locale === 'en' ? { ...(raw.translations?.en ?? {}) } : raw
  const s = <T,>(v: T | null | undefined, d: T): T => (v == null || v === '' ? d : v)
  return {
    title: s(p.title, FALLBACK.title),
    heroImage: s(p.hero_image, FALLBACK.heroImage),
    heroAlt: s(p.hero_image_alt, FALLBACK.heroAlt),
    intro: s(p.intro, FALLBACK.intro),
    closing: s(p.closing, FALLBACK.closing),
    programNote: s(p.program_note, FALLBACK.programNote),
    tourTitle: s(p.tour_title, FALLBACK.tourTitle),
    tourIntro: s(p.tour_intro, FALLBACK.tourIntro),
    tourStops: p.tour_stops?.length ? p.tour_stops : FALLBACK.tourStops,
    workshopIntro: s(p.workshop_intro, FALLBACK.workshopIntro),
    workshopOptions: (p.workshop_options?.length
      ? p.workshop_options
      : FALLBACK.workshopOptions) as PView['workshopOptions'],
    workshopNote: s(p.workshop_note, FALLBACK.workshopNote),
    playTitle: s(p.play_title, FALLBACK.playTitle),
    playText: s(p.play_text, FALLBACK.playText),
    durationText: s(p.duration_text, FALLBACK.durationText),
    maxStudents: s(p.max_students, FALLBACK.maxStudents),
    pricing: p.pricing?.length ? p.pricing : FALLBACK.pricing,
    notes: p.notes?.length ? p.notes : FALLBACK.notes,
    allergyTitle: s(p.allergy_title, FALLBACK.allergyTitle),
    allergyBody: p.allergy_body?.length ? p.allergy_body : FALLBACK.allergyBody,
    metaTitle: s(p.meta_title, FALLBACK.metaTitle),
    metaDescription: p.meta_description ?? FALLBACK.metaDescription,
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const v = await loadProgram(locale)
  return {
    title: v.metaTitle,
    description: v.metaDescription,
    alternates: hreflangAlternates(locale, '/drastiriotites/scholeia'),
  }
}

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
  label,
}: {
  n: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title: string
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold-strong text-[14px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(241,172,16,0.75)]">
        {n}
      </span>
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-gold-strong">
          <Icon className="size-3.5" aria-hidden={true} />
          {label}
        </span>
        <h3 className="font-display text-[18px] font-bold leading-[1.2] text-foreground md:text-[20px]">
          {title}
        </h3>
      </div>
    </div>
  )
}

export default async function SchoolVisitsPage() {
  const locale = await getLocale()
  const ui = getActivitiesUi(locale)
  const t = pageCopy(locale)
  const v = await loadProgram(locale)
  const pills = [
    { icon: Clock, label: t.pillDuration },
    { icon: Users, label: t.pillMax(v.maxStudents) },
    { icon: GraduationCap, label: t.pillLevel },
  ]

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
              {ui.breadcrumbHome}
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <Link href="/drastiriotites" className="transition-colors hover:text-accent">
              {ui.breadcrumbActivities}
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="text-foreground">{v.title}</span>
          </nav>
        </RevealUp>
      </div>

      <section className="container-page pb-12 pt-2 md:pb-[60px]">
        {/* Header */}
        <RevealUp>
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-[32px] font-bold leading-[1.06] text-foreground md:text-[46px]">
              {v.title}
            </h1>
            <ul className="flex flex-wrap items-center gap-2">
              {pills.map((p) => (
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
              src={v.heroImage}
              alt={v.heroAlt}
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
              <SectionHeading>{ui.sectionDescription}</SectionHeading>
              <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">{v.intro}</p>
              <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">{v.closing}</p>
            </section>

            {/* Το πρόγραμμα — three rotating activities */}
            <section className="flex flex-col gap-6">
              <SectionHeading>{t.sectionProgram}</SectionHeading>
              <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">{v.programNote}</p>

              <div className="flex flex-col gap-4">
                {/* Δ1 */}
                <div className="flex flex-col gap-5 rounded-[16px] bg-offwhite p-5 ring-1 ring-border/50 md:p-6">
                  <ActivityHead n="1" icon={BookOpenText} title={v.tourTitle} label={t.activityLabel('1')} />
                  <p className="text-[15px] leading-[1.7] text-muted">{v.tourIntro}</p>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {v.tourStops.map((s, i) => {
                      const Icon = TOUR_ICONS[i] ?? BookOpenText
                      return (
                        <li
                          key={i}
                          className="flex items-start gap-3 rounded-[12px] bg-white p-4 ring-1 ring-border/50"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                            <Icon className="size-4" aria-hidden="true" />
                          </span>
                          <span className="text-[14px] leading-[1.55] text-foreground">{s.text}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* Δ2 */}
                <div className="flex flex-col gap-5 rounded-[16px] bg-offwhite p-5 ring-1 ring-border/50 md:p-6">
                  <ActivityHead n="2" icon={Palette} title={t.workshopTitle} label={t.activityLabel('2')} />
                  <p className="text-[15px] leading-[1.7] text-muted">{v.workshopIntro}</p>
                  <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
                    {v.workshopOptions.map((opt, i) => (
                      <div key={opt.key} className="contents">
                        <div className="flex flex-col gap-2 rounded-[14px] bg-white p-5 ring-1 ring-border/50">
                          <h4 className="font-display text-[16px] font-bold leading-[1.25] text-foreground">
                            {opt.short}
                          </h4>
                          <p className="text-[13.5px] leading-[1.55] text-muted">{opt.description}</p>
                        </div>
                        {i === 0 && v.workshopOptions.length > 1 ? (
                          <div className="flex items-center justify-center">
                            <span className="flex size-9 items-center justify-center rounded-full bg-white text-[13px] font-bold uppercase text-muted ring-1 ring-border">
                              {t.or}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <p className="flex items-start gap-2 rounded-[12px] bg-accent/10 px-4 py-3 text-[13.5px] font-medium leading-[1.55] text-gold-strong">
                    <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {v.workshopNote}
                  </p>
                </div>

                {/* Δ3 */}
                <div className="flex flex-col gap-4 rounded-[16px] bg-offwhite p-5 ring-1 ring-border/50 md:p-6">
                  <ActivityHead n="3" icon={PartyPopper} title={v.playTitle} label={t.activityLabel('3')} />
                  <p className="text-[15px] leading-[1.7] text-muted">{v.playText}</p>
                </div>
              </div>
            </section>

            {/* Διάρκεια & ροή */}
            <section className="flex flex-col gap-5">
              <SectionHeading>{t.sectionDuration}</SectionHeading>
              <p className="text-[16px] leading-[1.8] text-muted md:text-[17px]">{v.durationText}</p>
              <p className="flex items-start gap-2.5 rounded-[14px] bg-accent-soft p-4 text-[14px] leading-[1.6] text-foreground/80 ring-1 ring-accent/15">
                <Info className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-foreground/90">{t.maxParticipants}</span>
                  {t.studentsUnit(v.maxStudents)}
                </span>
              </p>
            </section>

            {/* Σημαντικές σημειώσεις */}
            <section className="flex flex-col gap-5">
              <SectionHeading>{t.sectionNotes}</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                {v.notes.map((n, i) => {
                  const Icon = NOTE_ICONS[i] ?? Info
                  // Supervision is a liability statement — give it its own
                  // full-width, outlined block instead of one card among several.
                  const isSupervision = /supervision|επίβλεψη/i.test(n.body)
                  return (
                    <div
                      key={n.title}
                      className={
                        isSupervision
                          ? "flex items-start gap-4 rounded-[16px] border border-foreground/30 bg-white p-5 sm:col-span-2"
                          : "flex items-start gap-4 rounded-[16px] bg-offwhite p-5 ring-1 ring-border/50"
                      }
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <h3 className="font-display text-[17px] font-bold text-foreground">{n.title}</h3>
                        <p className="text-[14px] leading-[1.6] text-muted">{n.body}</p>
                      </div>
                    </div>
                  )
                })}

                {/* Allergies — safety warning, emphasised */}
                <div className="flex items-start gap-4 rounded-[16px] border border-accent/40 bg-accent/[0.07] p-5 sm:col-span-2">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                    <ShieldAlert className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-[17px] font-bold text-foreground">
                      {v.allergyTitle}
                    </h3>
                    {v.allergyBody.map((para, i) => (
                      <p key={i} className="text-[14px] leading-[1.6] text-muted">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Offset clears the sticky header (~150px). */}
          <div className="lg:sticky lg:top-[150px] lg:self-start">
            <SchoolBookingCard
              pricing={v.pricing}
              workshopOptions={v.workshopOptions}
              maxStudents={v.maxStudents}
            />
          </div>
        </div>
      </section>
    </>
  )
}
