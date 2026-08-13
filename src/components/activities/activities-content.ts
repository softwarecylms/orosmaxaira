/**
 * "Δραστηριότητες" (Όρος Μαχαιρά Academy) landing-page content — bilingual.
 *
 * Greek (el) is the source of truth; the English bundle overrides only the
 * user-facing text (images / hrefs / slugs are locale-invariant and reused).
 * English copy follows the live site's own wording where it exists
 * (orosmaxaira.com/en/drastiriotites/…) and faithful translations otherwise.
 * Read the active locale via next-intl's `getLocale()` (server) /
 * `useLocale()` (client) at the call site and pass it to `getActivitiesContent`
 * / `getActivitiesUi`.
 */

export type ExperienceCard = {
  image: string
  title: string
  text: string
  href: string
  badge?: string
  rating?: number
  reviews?: number
}

export type ProgramCard = {
  image: string
  title: string
  text: string
  href: string
  cta: string
  /** When true, the card renders as non-clickable (link temporarily disabled). */
  disabled?: boolean
}

export type ActivitiesContent = {
  hero: { eyebrow: string; title: string; description: string; image: string; imageAlt: string }
  experiences: { eyebrow: string; heading: string; sub: string; items: ExperienceCard[] }
  programs: { eyebrow: string; heading: string; sub: string; items: ProgramCard[] }
  fact: {
    eyebrow: string
    heading: string
    body: string
    stat: { value: string; label: string }
    closing: string
    cta: { label: string; href: string }
    image: string
    imageAlt: string
  }
  cta: {
    eyebrow: string
    heading: string
    body: string
    primary: { label: string; href: string }
    secondary: { label: string; href: string }
  }
}

const ACTIVITIES_PAGE_EL: ActivitiesContent = {
  hero: {
    eyebrow: 'Όρος Μαχαιρά Academy',
    title: 'Μάθε, εξερεύνησε, δημιούργησε',
    description:
      'Ο κόσμος της μέλισσας σε περιμένει — βιωματικές ξεναγήσεις, εργαστήρια και εκπαιδευτικά προγράμματα για μικρούς και μεγάλους.',
    image: '/images/activities/hero.webp',
    imageAlt: 'Βιωματική εμπειρία στο μελισσοκομείο του Όρους Μαχαιρά',
  },

  experiences: {
    eyebrow: 'Οι Εμπειρίες μας',
    heading: 'Ανακαλύψτε τις Εμπειρίες μας',
    sub: 'Βιωματικές ξεναγήσεις, εργαστήρια και εκπαιδευτικά προγράμματα.',
    items: [
      {
        image: '/images/activities/gnorizw.webp',
        title: 'Γνωρίζω τη Μέλισσα',
        text: 'Εκπαιδευτική ξενάγηση στον κόσμο της μέλισσας και του μελιού, με γευσιγνωσία των προϊόντων μας.',
        href: '/drastiriotites/xenagiseis',
        badge: 'Best Seller',
        rating: 4.9,
        reviews: 300,
      },
      {
        image: '/images/activities/episkepsi.webp',
        title: 'Περιπέτειες στις Κυψέλες',
        text: 'Οι επισκέπτες φορούν στολή μελισσοκόμου και γνωρίζουν από κοντά τη ζωή των μελισσών.',
        href: '/drastiriotites/peripeteies-stis-kypseles',
        badge: 'Σχεδόν Sold Out',
        rating: 4.9,
        reviews: 300,
      },
      {
        image: '/images/activities/ergastiria.webp',
        title: 'Εργαστήρια',
        text: 'Εκπαιδευτική ξενάγηση και εργαστήρι ζωγραφικής γύψινων φιγούρων, εμπνευσμένο από τη μέλισσα.',
        href: '/drastiriotites/ergastiria',
        rating: 4.9,
        reviews: 300,
      },
      {
        image: '/images/activities/melisotherapia.webp',
        title: 'Μελισσοθεραπεία',
        text: 'Αναπνεύστε τον αέρα της κυψέλης σε έναν ελεγχόμενο χώρο — μια μοναδική εμπειρία ευεξίας.',
        href: '/drastiriotites/melissotherapeia',
        rating: 4.9,
        reviews: 300,
      },
    ],
  },

  programs: {
    eyebrow: 'Για Σχολεία & Οργανισμούς',
    heading: 'Εκπαιδευτικά Προγράμματα με Περιβαλλοντικό Αντίκτυπο',
    sub: 'Προγράμματα με εκπαιδευτικό, περιβαλλοντικό και κοινωνικό αντίκτυπο,\nειδικά σχεδιασμένα για σχολεία, εταιρείες και οργανισμούς.',
    items: [
      {
        image: '/images/adopt/visit-2.webp',
        title: 'Εκπαιδευτικές Επισκέψεις Σχολείων',
        text: 'Ένα οργανωμένο εκπαιδευτικό πρόγραμμα για σχολεία, αφιερωμένο στη μέλισσα, το περιβάλλον και τη βιωματική μάθηση.',
        href: '/drastiriotites/scholeia',
        cta: 'Δείτε το πρόγραμμα',
      },
      {
        image: '/images/adopt/hero.webp',
        title: 'Πρόγραμμα Adopt a Hive',
        text: 'Το καινοτόμο και βραβευμένο πρόγραμμα ΕΚΕ που μετατρέπει την περιβαλλοντική προσφορά σε μια ουσιαστική συλλογική εμπειρία team building.',
        href: '/adopt-a-hive',
        cta: 'Μάθετε περισσότερα',
      },
    ],
  },

  fact: {
    eyebrow: 'Ήξερες ότι…',
    heading: 'Οι μέλισσες τρέφουν τον κόσμο.',
    body: 'Το ένα τρίτο περίπου των τροφίμων που καταναλώνουμε καθημερινά εξαρτάται από την επικονίαση — κυρίως των μελισσών.',
    stat: {
      value: '1/3',
      label: 'των τροφίμων μας εξαρτάται από την επικονίαση των μελισσών.',
    },
    closing:
      'Προστατεύοντας τις μέλισσες, προστατεύουμε την τροφή και τη βιοποικιλότητα ολόκληρου του πλανήτη.',
    cta: { label: 'Αφανείς Ήρωες της Φύσης', href: '/afaneis-iroes-tis-fysis' },
    image: '/images/nature/pollinators-3.webp',
    imageAlt: 'Μέλισσα επικονιάζει λουλούδι',
  },

  cta: {
    eyebrow: 'Κράτηση',
    heading: 'Κλείστε τη δική σας εμπειρία',
    body: 'Επιλέξτε τη δραστηριότητα που σας ενδιαφέρει και κλείστε online, ή επικοινωνήστε μαζί μας για ομαδικές και σχολικές κρατήσεις.',
    primary: { label: 'Δείτε τις εμπειρίες', href: '#experiences' },
    secondary: { label: 'Επικοινωνία', href: '/epikoinonia' },
  },
}

const p = ACTIVITIES_PAGE_EL

const ACTIVITIES_PAGE_EN: ActivitiesContent = {
  hero: {
    eyebrow: 'Oros Machaira Academy',
    title: 'Learn, explore, create',
    description:
      'The world of the bee is waiting for you — hands-on tours, workshops and educational programmes for young and old.',
    image: p.hero.image,
    imageAlt: 'A hands-on experience at the Oros Machaira apiary',
  },

  experiences: {
    eyebrow: 'Our Experiences',
    heading: 'Discover Our Experiences',
    sub: 'Hands-on tours, workshops and educational programmes.',
    items: [
      {
        ...p.experiences.items[0],
        title: 'Getting to Know the Bee',
        text: 'An educational tour of the world of the bee and honey, with a tasting of our products.',
        badge: 'Best Seller',
      },
      {
        ...p.experiences.items[1],
        title: 'Adventures in the Beehives',
        text: 'Visitors put on a beekeeper suit and get to know the life of the bees up close.',
        badge: 'Almost Sold Out',
      },
      {
        ...p.experiences.items[2],
        title: 'Workshops',
        text: 'An educational tour and a plaster-figure painting workshop, inspired by the bee.',
      },
      {
        ...p.experiences.items[3],
        title: 'Bee Therapy',
        text: 'Breathe the air of the hive in a controlled space — a unique wellness experience.',
      },
    ],
  },

  programs: {
    eyebrow: 'For Schools & Organisations',
    heading: 'Educational Programmes with Environmental Impact',
    sub: 'Programmes with an educational, environmental and social impact,\nspecially designed for schools, companies and organisations.',
    items: [
      {
        ...p.programs.items[0],
        title: 'School Educational Visits',
        text: 'An organised educational programme for schools, dedicated to the bee, the environment and hands-on learning.',
        cta: 'See the programme',
      },
      {
        ...p.programs.items[1],
        title: 'Adopt a Hive Programme',
        text: 'The innovative, award-winning CSR programme that turns environmental giving into a meaningful, collective team-building experience.',
        cta: 'Learn more',
      },
    ],
  },

  fact: {
    eyebrow: 'Did you know…',
    heading: 'Bees feed the world.',
    body: 'About one third of the food we eat every day depends on pollination — mainly by bees.',
    stat: {
      value: '1/3',
      label: 'of our food depends on pollination by bees.',
    },
    closing:
      'By protecting the bees, we protect the food and biodiversity of the entire planet.',
    cta: { label: 'Unsung Heroes of Nature', href: p.fact.cta.href },
    image: p.fact.image,
    imageAlt: 'A bee pollinating a flower',
  },

  cta: {
    eyebrow: 'Booking',
    heading: 'Book your own experience',
    body: 'Choose the activity you are interested in and book online, or get in touch with us for group and school bookings.',
    primary: { label: 'See the experiences', href: p.cta.primary.href },
    secondary: { label: 'Contact', href: p.cta.secondary.href },
  },
}

/**
 * Locale-aware landing-page content. el = the Greek source of truth,
 * en = the English bundle. Kept as `ACTIVITIES_PAGE` (Greek) for any
 * locale-agnostic consumer.
 */
export const ACTIVITIES_PAGE = ACTIVITIES_PAGE_EL

export function getActivitiesContent(locale: string): ActivitiesContent {
  return locale === 'en' ? ACTIVITIES_PAGE_EN : ACTIVITIES_PAGE_EL
}

// --- Shared UI chrome (labels, section headings, months) ------------------
// Static, non-form display text used by the activity landing + detail pieces.

export type ActivitiesUi = {
  breadcrumbHome: string
  breadcrumbActivities: string
  breadcrumbWorkshops: string
  more: string
  importantNote: string
  availablePrefix: string
  relatedEyebrow: string
  relatedHeading: string
  moments: string
  /** e.g. `Στιγμές από «X»` / `Moments from «X»`. */
  momentsFrom: (title: string) => string
  sectionDescription: string
  sectionDetails: string
  sectionReviews: string
  sectionHowItWorks: string
  sectionBenefits: string
  sectionUsefulInfo: string
  frequency: string
  reviewsBasedOn: (n: number) => string
  starsAria: (v: string) => string
  bookingWeekday: string
  bookingWeekend: string
  bookingFree: string
  bookingCheckAvailability: string
  bookingFreeCancellation: string
  bookingQuestions: string
  bookingExperienceBy: string
  /** Intl.NumberFormat locale for currency. */
  priceLocale: string
  monthsNom: string[]
  monthsAcc: string[]
}

const UI_EL: ActivitiesUi = {
  breadcrumbHome: 'Αρχική',
  breadcrumbActivities: 'Δραστηριότητες',
  breadcrumbWorkshops: 'Εργαστήρια',
  more: 'Περισσότερα',
  importantNote: 'Σημαντική σημείωση:',
  availablePrefix: 'Διαθέσιμη',
  relatedEyebrow: 'Δείτε επίσης',
  relatedHeading: 'Ανακαλύψτε Περισσότερα',
  moments: 'Στιγμές',
  momentsFrom: (t) => `Στιγμές από «${t}»`,
  sectionDescription: 'Περιγραφή',
  sectionDetails: 'Λεπτομέρειες',
  sectionReviews: 'Κριτικές',
  sectionHowItWorks: 'Πώς Λειτουργεί',
  sectionBenefits: 'Οφέλη',
  sectionUsefulInfo: 'Χρήσιμες πληροφορίες',
  frequency: 'Συχνότητα:',
  reviewsBasedOn: (n) => `Βασισμένο σε ${n} κριτικές`,
  starsAria: (v) => `${v} στα 5 αστέρια`,
  bookingWeekday: 'Καθημ.',
  bookingWeekend: 'Σαβ/Κυρ',
  bookingFree: 'Δωρεάν',
  bookingCheckAvailability: 'Δείτε διαθεσιμότητα',
  bookingFreeCancellation: 'Δωρεάν ακύρωση έως 72 ώρες πριν.',
  bookingQuestions: 'Έχετε απορίες για την κράτηση;',
  bookingExperienceBy: 'Μια εμπειρία του',
  priceLocale: 'el-GR',
  monthsNom: [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
    'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
  ],
  monthsAcc: [
    'Ιανουάριο', 'Φεβρουάριο', 'Μάρτιο', 'Απρίλιο', 'Μάιο', 'Ιούνιο',
    'Ιούλιο', 'Αύγουστο', 'Σεπτέμβριο', 'Οκτώβριο', 'Νοέμβριο', 'Δεκέμβριο',
  ],
}

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const UI_EN: ActivitiesUi = {
  breadcrumbHome: 'Home',
  breadcrumbActivities: 'Activities',
  breadcrumbWorkshops: 'Workshops',
  more: 'Learn more',
  importantNote: 'Important note:',
  availablePrefix: 'Available',
  relatedEyebrow: 'See also',
  relatedHeading: 'Discover More',
  moments: 'Moments',
  momentsFrom: (t) => `Moments from «${t}»`,
  sectionDescription: 'Description',
  sectionDetails: 'Details',
  sectionReviews: 'Reviews',
  sectionHowItWorks: 'How It Works',
  sectionBenefits: 'Benefits',
  sectionUsefulInfo: 'Useful information',
  frequency: 'Frequency:',
  reviewsBasedOn: (n) => `Based on ${n} reviews`,
  starsAria: (v) => `${v} out of 5 stars`,
  bookingWeekday: 'Weekday',
  bookingWeekend: 'Sat/Sun',
  bookingFree: 'Free',
  bookingCheckAvailability: 'Check availability',
  bookingFreeCancellation: 'Free cancellation up to 72 hours before.',
  bookingQuestions: 'Questions about your booking?',
  bookingExperienceBy: 'An experience by',
  priceLocale: 'en-GB',
  monthsNom: EN_MONTHS,
  monthsAcc: EN_MONTHS,
}

export function getActivitiesUi(locale: string): ActivitiesUi {
  return locale === 'en' ? UI_EN : UI_EL
}
