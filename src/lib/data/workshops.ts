/**
 * Workshops — the single source of truth for the "Βιωματικά Εργαστήρια"
 * (/drastiriotites/ergastiria) hub, its seasonal calendar, and the per-workshop
 * detail pages. Adding or changing a workshop means editing ONLY this file;
 * every count, label, calendar cell and detail route derives from the array.
 *
 * This is the STATIC FALLBACK — the live pages read the same content from the
 * Medusa `bookings` module (editable in the admin) and only fall back here if
 * Medusa is unreachable. Keep the two in sync (mirror of `seed-workshops.ts`).
 *
 * Business rules baked in elsewhere (not here — this is just content):
 *  - A workshop is never booked on its own; it's combined with an experience
 *    (see `WorkshopComboNotice`). The farm picks the workshop by season, so
 *    there is no per-workshop "book" button.
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
      'Λίγο πριν το Πάσχα, φτιάξτε με φύλλα κηρήθρας τη δική σας μελισσολαμπάδα και πάρτε τη δωρεάν μαζί σας.',
    description:
      'Λίγο πριν το **Πάσχα**, σας περιμένουμε μαζί με τους μικρούς μας φίλους στο μελισσοκομείο μας, για ένα δημιουργικό και διασκεδαστικό εργαστήρι αφιερωμένο στη μέλισσα και το κερί της!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να μάθουν για τη μέλισσα και το φυσικό κερί, δημιουργώντας παράλληλα τη δική τους πασχαλινή Μελισσολαμπάδα.\n\nΜε φύλλα κηρήθρας από κερί μέλισσας, θα τυλίξετε το φυτίλι και θα κατασκευάσετε τη δική σας λαμπάδα. Στη συνέχεια, με διάφορα πασχαλινά διακοσμητικά, θα τη διακοσμήσετε όπως εσείς επιθυμείτε, δημιουργώντας μια πραγματικά μοναδική Μελισσολαμπάδα.\n\nΣτο τέλος του εργαστηρίου, κάθε συμμετέχων θα πάρει μαζί του **δωρεάν** τη Μελισσολαμπάδα που δημιούργησε, έτοιμη για το Πάσχα!',
    months: [3, 4],
    seasonLabel: 'Πάσχα',
    image: '/images/activities/ergastiria/melissolampades.jpg',
    published: true,
  },
  {
    slug: 'fytefsi-sporon',
    title: 'Φύτευση σπόρων σε γλαστράκια & διακόσμηση',
    excerpt:
      'Φυτέψτε τους σπόρους σας σε γλαστράκια, ζωγραφίστε τα και μάθετε πώς βοηθάμε τις μέλισσες — πάρτε το γλαστράκι σας δωρεάν.',
    description:
      'Σας περιμένουμε μαζί με την οικογένεια και τους μικρούς μας φίλους στο μελισσοκομείο μας, για ένα **καλοκαιρινό** εργαστήρι αφιερωμένο στη χαρά της φύτευσης, τη δημιουργικότητα και την προστασία των μελισσών!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να φυτέψουν τους δικούς τους σπόρους σε γλαστράκια και να τα ζωγραφίσουν εξωτερικά, δίνοντας χρώμα και αφήνοντας ελεύθερη τη φαντασία τους.\n\nΜέσα από αυτή τη δημιουργική δραστηριότητα, θα μάθουμε πώς η φύτευση φυτών και λουλουδιών μπορεί να βοηθήσει τις μέλισσες, προσφέροντάς τους πολύτιμες πηγές τροφής. Παράλληλα, θα γνωρίσουμε καλύτερα τη σημασία της **επικονίασης** και τον καθοριστικό ρόλο των μελισσών στη φύση και το περιβάλλον.\n\nΣτο τέλος του εργαστηρίου, κάθε συμμετέχων θα πάρει μαζί του **δωρεάν** το γλαστράκι που φύτεψε και διακόσμησε, για να το φροντίσει και να το δει να μεγαλώνει!',
    months: [6, 7, 8],
    seasonLabel: 'Καλοκαίρι',
    image: '/images/activities/ergastiria/fytefsi-sporon.jpg',
    published: true,
  },
  {
    slug: 'ergastiria-mageirikis',
    title: 'Εργαστήρι Μαγειρικής για Τρουφάκια',
    excerpt:
      'Φτιάξτε σπιτικά τρουφάκια με μέλι και αλοιφές Όρος Μαχαιρά, μαγειρέψτε με προϊόντα της κυψέλης και δοκιμάστε ό,τι δημιουργήσατε.',
    description:
      'Σας περιμένουμε στο μελισσοκομείο μας για ένα γευστικό και δημιουργικό εργαστήρι, αφιερωμένο στο **μέλι** και τα προϊόντα της κυψέλης και την αξιοποίησή τους στη μαγειρική!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να φτιάξουν σπιτικά **τρουφάκια με μέλι** και **αλοιφές Όρος Μαχαιρά**, ανακαλύπτοντας νέους τρόπους χρήσης του μελιού και των προϊόντων της κυψέλης μέσα από απλές και νόστιμες συνταγές.\n\nΚατά τη διάρκεια του εργαστηρίου, θα ετοιμάσετε τις δικές σας δημιουργίες, μαθαίνοντας παράλληλα πώς το μέλι και τα προϊόντα της μέλισσας μπορούν να ενταχθούν δημιουργικά στην καθημερινή μας διατροφή και να χρησιμοποιηθούν σε διαφορετικές γλυκές και αλμυρές συνταγές.\n\nΚαι φυσικά, στο τέλος του εργαστηρίου θα έχουμε την ευκαιρία να δοκιμάσουμε μαζί όσα δημιουργήσαμε, ολοκληρώνοντας μια εμπειρία γεμάτη γεύσεις, αρώματα και… μέλι!',
    months: [9, 10, 11],
    seasonLabel: 'Φθινόπωρο',
    image: '/images/activities/ergastiria/ergastiria-mageirikis.jpg',
    published: true,
  },
  {
    slug: 'keraloifes',
    title: 'Παρασκευή κεραλοιφών',
    excerpt:
      'Παρασκευάστε βήμα-βήμα τη δική σας φυσική κεραλοιφή από μελισσοκέρι και πάρτε τη δωρεάν μαζί σας.',
    description:
      'Σας περιμένουμε στο μελισσοκομείο μας για ένα δημιουργικό εργαστήρι αφιερωμένο στο **μελισσοκέρι** και την παρασκευή φυσικών κεραλοιφών!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να γνωρίσουν καλύτερα το μελισσοκέρι και να ανακαλύψουν πώς μπορεί να αξιοποιηθεί, σε συνδυασμό με άλλα φυσικά συστατικά, για την παρασκευή μιας κεραλοιφής.\n\nΚατά τη διάρκεια του εργαστηρίου, θα ακολουθήσουμε μαζί βήμα-βήμα τη διαδικασία παρασκευής και ο κάθε συμμετέχων θα δημιουργήσει τη δική του **φυσική κεραλοιφή**, μαθαίνοντας παράλληλα περισσότερα για τα υλικά που χρησιμοποιούμε και τον ρόλο τους στο τελικό προϊόν.\n\nΣτο τέλος του εργαστηρίου, κάθε συμμετέχων θα πάρει μαζί του **δωρεάν** την κεραλοιφή που δημιούργησε, ως ένα ξεχωριστό αναμνηστικό από την εμπειρία του στον κόσμο της μέλισσας!',
    months: [12, 1, 2],
    seasonLabel: 'Χειμώνας',
    image: '/images/activities/ergastiria/keraloifes.jpg',
    published: true,
  },
  {
    slug: 'peritiligma-fagitou',
    title: 'Περιτύλιγμα φαγητού με κερί μέλισσας',
    excerpt:
      'Φτιάξτε το δικό σας επαναχρησιμοποιούμενο περιτύλιγμα τροφίμων από μελισσοκέρι — μια οικολογική επιλογή για κάθε μέρα.',
    description:
      'Σας περιμένουμε μαζί με την οικογένεια και τους μικρούς μας φίλους στο μελισσοκομείο μας, για ένα δημιουργικό και **οικολογικό** εργαστήρι αφιερωμένο στο μελισσοκέρι και τη βιώσιμη καθημερινότητα!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να γνωρίσουν καλύτερα το φυσικό κερί της μέλισσας και να μάθουν πώς μπορούμε να μειώσουμε τη χρήση πλαστικής μεμβράνης στην καθημερινή αποθήκευση και μεταφορά των τροφίμων μας.\n\nΚατά τη διάρκεια του εργαστηρίου, θα δημιουργήσετε το δικό σας **επαναχρησιμοποιούμενο περιτύλιγμα τροφίμων** από μελισσοκέρι, το οποίο μπορεί να χρησιμοποιηθεί για το σάντουιτς των παιδιών στο σχολείο, φρούτα και διάφορα τρόφιμα.\n\nΜέσα από μια ευχάριστη και δημιουργική εμπειρία, θα ανακαλύψουμε μαζί πώς ένα προϊόν της μέλισσας μπορεί να αποτελέσει μια πιο οικολογική επιλογή στην καθημερινότητά μας, συμβάλλοντας στη μείωση της χρήσης πλαστικού.\n\nΣτο τέλος του εργαστηρίου, κάθε συμμετέχων θα πάρει μαζί του **δωρεάν** το περιτύλιγμα από μελισσοκέρι που δημιούργησε, έτοιμο για χρήση!',
    // months TBD — awaiting the client.
    months: [],
    seasonLabel: 'Κατόπιν ραντεβού',
    image: '/images/activities/ergastiria/peritiligma-fagitou.jpg',
    published: true,
  },
  {
    slug: 'kerines-dimiourgies',
    title: 'Χειροποίητες Γύψινες Φιγούρες',
    excerpt:
      'Ζωγραφίστε χειροποίητες γύψινες φιγούρες εμπνευσμένες από τη μέλισσα και πάρτε τη δημιουργία σας δωρεάν μαζί σας.',
    description:
      'Σας περιμένουμε μαζί με την οικογένεια και τους φίλους σας στο μελισσοκομείο μας, για ένα δημιουργικό και διασκεδαστικό εργαστήρι γεμάτο χρώμα, φαντασία και… μέλισσες!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να γνωρίσουν καλύτερα τον υπέροχο κόσμο της μέλισσας, ζωγραφίζοντας χειροποίητες **γύψινες φιγούρες** σε σχήματα μέλισσας, κηρήθρας και άλλων σχεδίων εμπνευσμένων από τη ζωή στην κυψέλη.\n\nΜε χρώματα και πολλή φαντασία, ο κάθε συμμετέχων θα ζωγραφίσει τη δική του μοναδική φιγούρα, σε ένα ευχάριστο και χαλαρωτικό εργαστήρι που δίνει χώρο στη δημιουργικότητα και τη διασκέδαση.\n\nΣτο τέλος του εργαστηρίου, κάθε συμμετέχων θα πάρει μαζί του **δωρεάν** τη γύψινη δημιουργία που ζωγράφισε, ως ένα όμορφο αναμνηστικό από την εμπειρία του στον κόσμο των μελισσών!',
    // months TBD — awaiting the client.
    months: [],
    seasonLabel: 'Κατόπιν ραντεβού',
    image: '/images/activities/ergastiria/kerines-dimiourgies.jpg',
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
