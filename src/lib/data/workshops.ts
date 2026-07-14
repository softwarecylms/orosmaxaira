/**
 * Workshops — the single source of truth for the "Βιωματικά Εργαστήρια"
 * (/drastiriotites/ergastiria) hub, its seasonal calendar, and the per-workshop
 * detail pages. Adding or changing a workshop means editing ONLY this file;
 * every count, label, calendar cell and detail route derives from the array.
 *
 * Business rules baked in elsewhere (not here — this is just content):
 *  - A workshop is never booked on its own; it's combined with an experience
 *    (see `WorkshopComboNotice`). The farm picks the workshop by season, so
 *    there is no per-workshop "book" button.
 *
 * NOTE: entries flagged `// DEMO` below use placeholder copy + a stand-in image
 * (the farm has no photos/text for these yet). Replace copy + `image` when the
 * client supplies them. Months for the two `[]` entries are still TBD.
 */

export type Workshop = {
  slug: string
  title: string
  /** One-line summary for the hub card. */
  excerpt: string
  /** Full body for the detail page. Supports `**bold**` + `[label](href)` via
   *  the shared RichText renderer; blank line separates paragraphs. */
  description: string
  /** Months the workshop runs, 1–12, in season order (e.g. winter = [12,1,2]).
   *  Empty = not yet scheduled ("κατόπιν ραντεβού"). */
  months: number[]
  /** Human season name, e.g. "Πάσχα", "Καλοκαίρι". */
  seasonLabel: string
  image: string
  gallery?: { src: string; alt: string }[]
  published: boolean
}

export const WORKSHOPS: Workshop[] = [
  {
    slug: 'melissolampades',
    title: 'Μελισσολαμπάδες',
    excerpt:
      'Λίγο πριν το Πάσχα, φτιάξτε τις δικές σας μελισσολαμπάδες και πάρτε τες δωρεάν μαζί σας.',
    description:
      'Λίγο πριν το **Πάσχα**, ποια θα ήταν η καλύτερη δραστηριότητα για εσάς και τα παιδιά σας; Μα βεβαίως η κατασκευή των δικών σας μελισσολαμπάδων! Θα διασκεδάσετε, θα μάθετε για τη μέλισσα και θα φτιάξετε τις δικές σας λαμπάδες: θα τυλίξετε το φυτίλι με τη βάση της κηρήθρας και θα τις διακοσμήσετε με πασχαλινά διακοσμητικά όπως εσείς θέλετε — και θα τις πάρετε **δωρεάν** μαζί σας.\n\nΕπιπλέον, θα ξεναγηθείτε στους χώρους του μελισσοκομείου μας, θα δείτε πώς γίνεται η εμφιάλωση του μελιού, θα γνωρίσετε τη «φωλιά της μέλισσας» — πού και πώς ζει η μέλισσα και ποια η διαφορά μεταξύ μέλισσας, βασίλισσας και κηφήνα — και θα παίξετε ένα παιχνίδι γνώσεων για τη μέλισσα και το μέλι.',
    months: [3, 4],
    seasonLabel: 'Πάσχα',
    image: '/images/activities/ergastiria/workshop-1.webp',
    published: true,
  },
  {
    slug: 'fytefsi-sporon',
    title: 'Φύτευση σπόρων σε γλαστράκια & διακόσμηση',
    // DEMO copy + image — awaiting the farm's photos & text.
    excerpt:
      'Φυτέψτε τους δικούς σας σπόρους σε γλαστράκια και διακοσμήστε τα — μια δροσερή καλοκαιρινή δημιουργία.',
    description:
      'Ένα **καλοκαιρινό εργαστήρι** για μικρούς και μεγάλους, αφιερωμένο στη χαρά της φύτευσης. Θα φυτέψετε τους δικούς σας σπόρους σε γλαστράκια, θα τα διακοσμήσετε με φυσικά υλικά και θα τα πάρετε μαζί σας για να τα φροντίσετε στο σπίτι.\n\nΠαράλληλα, θα μάθετε πόσο σημαντικός είναι ο ρόλος της μέλισσας στην **επικονίαση** και στην τροφή μας, θα ξεναγηθείτε στους χώρους του μελισσοκομείου μας και θα γευτείτε τα είδη μελιών μας.',
    months: [6, 7, 8],
    seasonLabel: 'Καλοκαίρι',
    image: '/images/activities/ergastiria/workshop-4.jpg',
    published: true,
  },
  {
    slug: 'ergastiria-mageirikis',
    title: 'Εργαστήρια μαγειρικής',
    // DEMO copy + image — awaiting the farm's photos & text.
    excerpt:
      'Μαγειρέψτε με μέλι και προϊόντα της κυψέλης σε ένα φθινοπωρινό εργαστήρι γεύσης.',
    description:
      'Ανακαλύψτε τη **μαγειρική με μέλι** σε ένα φθινοπωρινό εργαστήρι γεύσης. Θα ετοιμάσετε απλές, νόστιμες συνταγές με μέλι και προϊόντα της κυψέλης και θα μάθετε πώς να τα εντάξετε στην καθημερινή σας διατροφή.\n\nΘα ξεναγηθείτε στους χώρους μας, θα δείτε ζωντανά την εμφιάλωση του μελιού, θα παίξετε ένα παιχνίδι γνώσεων και θα δοκιμάσετε τα είδη μελιών μας.',
    months: [9, 10, 11],
    seasonLabel: 'Φθινόπωρο',
    image: '/images/activities/ergastiria/workshop-5.jpg',
    published: true,
  },
  {
    slug: 'keraloifes',
    title: 'Παρασκευή κεραλοιφών',
    // DEMO copy + image — awaiting the farm's photos & text.
    excerpt:
      'Παρασκευάστε τις δικές σας φυσικές κεραλοιφές με κερί μέλισσας — ένα ζεστό χειμωνιάτικο εργαστήρι.',
    description:
      'Ένα ζεστό **χειμωνιάτικο εργαστήρι** για τη φροντίδα του δέρματος με φυσικό τρόπο. Θα παρασκευάσετε τις δικές σας κεραλοιφές με κερί μέλισσας και φυσικά έλαια και θα τις πάρετε μαζί σας.\n\nΘα γνωρίσετε τα προϊόντα της κυψέλης και τη χρησιμότητά τους, θα ξεναγηθείτε στους χώρους μας και θα παίξετε ένα παιχνίδι γνώσεων για τη μέλισσα και το μέλι.',
    months: [12, 1, 2],
    seasonLabel: 'Χειμώνας',
    image: '/images/activities/ergastiria/workshop-6.jpg',
    published: true,
  },
  {
    slug: 'peritiligma-fagitou',
    title: 'Περιτύλιγμα φαγητού με κερί μέλισσας',
    excerpt:
      'Αντικαταστήστε τις πλαστικές μεμβράνες με οικολογικά περιτυλίγματα από κερί μέλισσας.',
    description:
      'Εντάξτε την κυκλική οικονομία στην καθημερινότητά σας με έξυπνο, οικονομικό και φιλικό προς το περιβάλλον τρόπο! Θα μάθετε πώς να **μειώσετε τις πλαστικές μεμβράνες** που τυλίγουμε τα τρόφιμα (sandwich των παιδιών, απομεινάρια φαγητών, φρούτα κ.ά.) και να τις αντικαταστήσετε με περιτυλίγματα από κερί μέλισσας. Χρειάζεστε μόνο κερί μέλισσας και ένα παλιό βαμβακερό ύφασμα — τα υπόλοιπα θα τα μάθετε στο εργαστήριο!\n\nΠέρα από την κατασκευή, θα γνωρίσετε από κοντά την κοινωνία των μελισσών, θα ξεναγηθείτε στους χώρους μας, θα δείτε ζωντανά την εμφιάλωση του μελιού, θα παίξετε ένα παιχνίδι γνώσεων και θα δοκιμάσετε τα είδη μελιών μας. Και όλα αυτά **δωρεάν**!',
    // months TBD — awaiting the client.
    months: [],
    seasonLabel: 'Κατόπιν ραντεβού',
    image: '/images/activities/ergastiria/workshop-2.webp',
    published: true,
  },
  {
    slug: 'kerines-dimiourgies',
    title: 'Κέρινες δημιουργίες',
    excerpt:
      'Φτιάξτε τα δικά σας πολύχρωμα μελισσο-κεριά — μια δημιουργική δραστηριότητα για κάθε ηλικία.',
    description:
      'Μια **δημιουργική δραστηριότητα** για εποικοδομητικό χρόνο με την οικογένεια ή τους φίλους σας: η κατασκευή των δικών σας πολύχρωμων μελισσο-κεριών! Θα τυλίξετε το φυτίλι με τη βάση της κηρήθρας, θα διακοσμήσετε το κερί σας με κορδέλες και θα το πάρετε μαζί σας στο σπίτι για να το στολίσετε. Κατάλληλο για κάθε ηλικία.\n\nΕπιπλέον, θα ξεναγηθείτε στους χώρους μας, θα μάθετε πώς γίνεται η εμφιάλωση του μελιού, θα δείτε τη «φωλιά της μέλισσας» και θα παίξετε ένα παιχνίδι γνώσεων για τη μέλισσα και το μέλι.',
    // months TBD — awaiting the client.
    months: [],
    seasonLabel: 'Κατόπιν ραντεβού',
    image: '/images/activities/ergastiria/workshop-3.webp',
    published: true,
  },
]

const MONTHS_GR = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
]
const MONTHS_GR_SHORT = [
  'Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν',
  'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ',
]

/** Nominative Greek month name for a 1–12 index. */
export function monthName(m: number, short = false): string {
  const arr = short ? MONTHS_GR_SHORT : MONTHS_GR
  return arr[((m - 1) % 12 + 12) % 12] ?? ''
}

/** Accusative Greek month name, e.g. after "στον …" ("στον Ιούλιο"). Every
 *  Greek month is masculine ending in -ος, so the accusative just drops the
 *  final ς (Ιούλιος → Ιούλιο, Αύγουστος → Αύγουστο). */
export function monthNameAccusative(m: number): string {
  return monthName(m).replace(/ς$/, '')
}

/** "Μάρτιος – Απρίλιος" for a season's months (array is in season order, so a
 *  winter [12,1,2] reads "Δεκέμβριος – Φεβρουάριος"). Empty ⇒ ''. */
export function monthRangeLabel(months: number[]): string {
  if (!months.length) return ''
  if (months.length === 1) return monthName(months[0])
  return `${monthName(months[0])} – ${monthName(months[months.length - 1])}`
}

/** Badge text for a workshop: season + month range, or just the season when
 *  months are still TBD. */
export function seasonBadge(w: Workshop): string {
  const range = monthRangeLabel(w.months)
  return range ? `${w.seasonLabel} · ${range}` : w.seasonLabel
}

/** The published workshop scheduled for a given month (1–12), or null. */
export function workshopForMonth(month: number): Workshop | null {
  return WORKSHOPS.find((w) => w.published && w.months.includes(month)) ?? null
}

export function publishedWorkshops(): Workshop[] {
  return WORKSHOPS.filter((w) => w.published)
}

export function getWorkshop(slug: string): Workshop | undefined {
  return WORKSHOPS.find((w) => w.slug === slug && w.published)
}
