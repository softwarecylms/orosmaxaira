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
  /** Seasonal workshop with bookings temporarily closed → storefront shows a
   *  "bookings closed" notice instead of the booking/enquiry widget. */
  bookingClosed?: boolean
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
    bookingClosed: true,
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
    bookingClosed: true,
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
    bookingClosed: true,
  },
]

// --- Bilingual bundle -----------------------------------------------------
// The Greek WORKSHOPS above are the source of truth (also used server-side + as
// the mirror of `seed-workshops.ts`). EN overrides only the human-facing text
// (title / excerpt / description / seasonLabel); slug, months, image, gallery,
// published and bookingClosed are locale-invariant and reused verbatim.
type WorkshopI18n = Pick<Workshop, 'title' | 'excerpt' | 'description' | 'seasonLabel'>

const WORKSHOPS_EN_TEXT: Record<string, WorkshopI18n> = {
  melissolampades: {
    title: 'Beeswax Easter Candles',
    excerpt:
      'Just before Easter, make your own beeswax Easter candle from honeycomb sheets and take it home for free.',
    seasonLabel: 'Easter',
    description:
      'Just before **Easter**, we welcome you and our little friends at our apiary for a creative and fun workshop dedicated to the bee and its wax!\n\nYoung and old alike will have the chance to learn about the bee and natural wax, while creating their very own Easter beeswax candle.\n\nUsing sheets of beeswax honeycomb, you will wrap the wick and build your own candle. Then, with a variety of Easter decorations, you will decorate it just as you like, creating a truly unique Easter candle.\n\nAt the end of the workshop, every participant takes home **for free** the Easter candle they created, ready for Easter!',
  },
  'fytefsi-sporon': {
    title: 'Planting Seeds in Pots & Decorating',
    excerpt:
      'Plant your seeds in little pots, paint them and learn how we help the bees — take your pot home for free.',
    seasonLabel: 'Summer',
    description:
      'We welcome you, your family and our little friends at our apiary for a **summer** workshop dedicated to the joy of planting, creativity and the protection of bees!\n\nYoung and old alike will have the chance to plant their own seeds in little pots and paint the outside, adding colour and giving their imagination free rein.\n\nThrough this creative activity, we will learn how planting plants and flowers can help the bees by offering them precious sources of food. At the same time, we will get to know better the importance of **pollination** and the decisive role of bees in nature and the environment.\n\nAt the end of the workshop, every participant takes home **for free** the little pot they planted and decorated, to care for it and watch it grow!',
  },
  'ergastiria-mageirikis': {
    title: 'Cooking Workshop for Honey Truffles',
    excerpt:
      'Make homemade truffles with Oros Machaira honey and spreads, cook with products of the hive and taste what you create.',
    seasonLabel: 'Autumn',
    description:
      'We welcome you at our apiary for a tasty and creative workshop, dedicated to **honey** and the products of the hive and their use in cooking!\n\nYoung and old alike will have the chance to make homemade **honey truffles** and **Oros Machaira spreads**, discovering new ways of using honey and the products of the hive through simple and delicious recipes.\n\nDuring the workshop, you will prepare your own creations, learning at the same time how honey and bee products can be creatively woven into our everyday diet and used in different sweet and savoury recipes.\n\nAnd of course, at the end of the workshop we will have the chance to taste together everything we made, rounding off an experience full of flavours, aromas and… honey!',
  },
  keraloifes: {
    title: 'Making Natural Beeswax Salves',
    excerpt:
      'Make your own natural beeswax salve step by step and take it home for free.',
    seasonLabel: 'Winter',
    description:
      'We welcome you at our apiary for a creative workshop dedicated to **beeswax** and making natural beeswax salves!\n\nYoung and old alike will have the chance to get to know beeswax better and discover how it can be used, combined with other natural ingredients, to make a salve.\n\nDuring the workshop, we will follow the preparation process together step by step and each participant will create their own **natural beeswax salve**, learning at the same time more about the ingredients we use and their role in the final product.\n\nAt the end of the workshop, every participant takes home **for free** the salve they created, as a special keepsake from their experience in the world of the bee!',
  },
  'peritiligma-fagitou': {
    title: 'Beeswax Food Wraps',
    excerpt:
      'Make your own reusable beeswax food wrap — an eco-friendly choice for every day.',
    seasonLabel: 'By appointment',
    description:
      'We welcome you, your family and our little friends at our apiary for a creative and **eco-friendly** workshop dedicated to beeswax and sustainable everyday living!\n\nYoung and old alike will have the chance to get to know natural beeswax better and learn how we can reduce the use of plastic film in the everyday storage and transport of our food.\n\nDuring the workshop, you will create your own **reusable food wrap** from beeswax, which can be used for the children’s school sandwiches, fruit and all sorts of food.\n\nThrough a pleasant and creative experience, we will discover together how a product of the bee can become a more eco-friendly choice in our daily lives, helping to reduce the use of plastic.\n\nAt the end of the workshop, every participant takes home **for free** the beeswax wrap they created, ready to use!',
  },
  'kerines-dimiourgies': {
    title: 'Handmade Plaster Figures',
    excerpt:
      'Paint handmade plaster figures inspired by the bee and take your creation home for free.',
    seasonLabel: 'By appointment',
    description:
      'We welcome you, your family and your friends at our apiary for a creative and fun workshop full of colour, imagination and… bees!\n\nYoung and old alike will have the chance to get to know the wonderful world of the bee better, painting handmade **plaster figures** in the shapes of bees, honeycombs and other designs inspired by life in the hive.\n\nWith colours and plenty of imagination, each participant will paint their own unique figure, in a pleasant and relaxing workshop that leaves room for creativity and fun.\n\nAt the end of the workshop, every participant takes home **for free** the plaster creation they painted, as a lovely keepsake from their experience in the world of the bees!',
  },
}

const WORKSHOPS_EN: Workshop[] = WORKSHOPS.map((w) => ({ ...w, ...(WORKSHOPS_EN_TEXT[w.slug] ?? {}) }))

/** All workshops (published + unpublished) for a locale. el = source of truth. */
export function getWorkshops(locale: string): Workshop[] {
  return locale === 'en' ? WORKSHOPS_EN : WORKSHOPS
}

const MONTHS_GR = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
]
const MONTHS_GR_SHORT = [
  'Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν',
  'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ',
]
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTHS_EN_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Nominative month name for a 1–12 index (Greek by default; English when locale='en'). */
export function monthName(m: number, short = false, locale = 'el'): string {
  const en = locale === 'en'
  const arr = en ? (short ? MONTHS_EN_SHORT : MONTHS_EN) : short ? MONTHS_GR_SHORT : MONTHS_GR
  return arr[((m - 1) % 12 + 12) % 12] ?? ''
}

/** Accusative Greek month name, e.g. after "στον …" ("στον Ιούλιο"). Every
 *  Greek month is masculine ending in -ος, so the accusative just drops the
 *  final ς (Ιούλιος → Ιούλιο, Αύγουστος → Αύγουστο). English has no cases, so
 *  it returns the plain English month name. */
export function monthNameAccusative(m: number, locale = 'el'): string {
  if (locale === 'en') return monthName(m, false, 'en')
  return monthName(m).replace(/ς$/, '')
}

/** "Μάρτιος–Απρίλιος" for a season's months (array is in season order, so a
 *  winter [12,1,2] reads "Δεκέμβριος–Φεβρουάριος"). Empty ⇒ ''. */
export function monthRangeLabel(months: number[], locale = 'el'): string {
  if (!months.length) return ''
  if (months.length === 1) return monthName(months[0], false, locale)
  return `${monthName(months[0], false, locale)} – ${monthName(months[months.length - 1], false, locale)}`
}

/** Badge text for a workshop: season + month range, or just the season when
 *  months are still TBD. `w.seasonLabel` is already localized by the caller. */
export function seasonBadge(w: Workshop, locale = 'el'): string {
  const range = monthRangeLabel(w.months, locale)
  return range ? `${w.seasonLabel} · ${range}` : w.seasonLabel
}

/** The published workshop scheduled for a given month (1–12), or null. */
export function workshopForMonth(month: number, locale = 'el'): Workshop | null {
  return getWorkshops(locale).find((w) => w.published && w.months.includes(month)) ?? null
}

export function publishedWorkshops(locale = 'el'): Workshop[] {
  return getWorkshops(locale).filter((w) => w.published)
}

export function getWorkshop(slug: string, locale = 'el'): Workshop | undefined {
  return getWorkshops(locale).find((w) => w.slug === slug && w.published)
}
