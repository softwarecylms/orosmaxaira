import type { ExecArgs } from "@medusajs/framework/types"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Seed the Εργαστήρια (workshops) that power /drastiriotites/ergastiria + each
 * per-workshop page. Idempotent: re-running updates each workshop by slug and
 * re-syncs the seasonal workshops' availability to match the plan below.
 *
 *   npx medusa exec ./src/scripts/seed-workshops.ts
 *
 * Two kinds of workshop:
 *  - **Seasonal** (Jul–Nov, the client's «Εμπειρίες-Συνδυασμοί» document): a real
 *    online seat booking. Each is offered as two experience combos — «Μισό
 *    πρόγραμμα» (Γνωρίζω τη Μέλισσα + το εργαστήρι) and «Πλήρες πρόγραμμα»
 *    (Περιπέτειες + Γνωρίζω + το εργαστήρι). The Half and Full sessions run at
 *    different times, so each dated slot is tagged with its combo (`combo_key`).
 *    Prices are per person by age (adults / children / infants).
 *  - **Enquiry** (Πάσχα / κατόπιν ραντεβού): no slots → the storefront falls back
 *    to the enquiry form. Combo prices below are DEMO placeholders for those.
 *
 * Everything here is editable afterwards in the Medusa admin (Εργαστήρια).
 */

// Standard age tier labels shared by every combo.
const ADULT = "Ενήλικες (12+ ετών)"
const CHILD = "Παιδιά (4–11 ετών)"
const INFANT = "Βρέφη & Νήπια (0–3 ετών)"

// Per-age combo prices from the document (€).
const HALF_PRICES = { adult: 10, child: 6, infant: 0 }
const FULL_PRICES = { adult: 20, child: 15, infant: 0 }

const AGE_LABELS = { adult: ADULT, child: CHILD, infant: INFANT }
const DEFAULT_CAPACITY = 15

// Enquiry-only fallback combos (DEMO prices) for the non-seasonal workshops.
const DEMO_COMBOS = [
  { key: "gnorizw", label: "Γνωρίζω τη Μέλισσα", price: 12, note: "ανά άτομο · ενδεικτική τιμή" },
  {
    key: "gnorizw-peripeteies",
    label: "Γνωρίζω τη Μέλισσα + Περιπέτειες στις Κυψέλες",
    price: 20,
    note: "ανά άτομο · ενδεικτική τιμή",
  },
]

/** The two priced experience combos for a seasonal workshop. */
function seasonalCombos(
  workshopLabel: string,
  full: { start: string; end: string }
) {
  return [
    {
      key: "half",
      label: "Μισό πρόγραμμα",
      long_label: `Γνωρίζω τη Μέλισσα + ${workshopLabel}`,
      start_time: "11:00",
      end_time: "12:45",
      prices: HALF_PRICES,
      age_labels: AGE_LABELS,
      note: "ανά άτομο",
    },
    {
      key: "full",
      label: "Πλήρες πρόγραμμα",
      long_label: `Περιπέτειες στις Κυψέλες + Γνωρίζω τη Μέλισσα + ${workshopLabel}`,
      start_time: full.start,
      end_time: full.end,
      prices: FULL_PRICES,
      age_labels: AGE_LABELS,
      note: "ανά άτομο",
    },
  ]
}

type Seasonal = {
  workshopLabel: string // the εργαστήρι part of the combo label (from the doc)
  months: number[]
  full: { start: string; end: string }
  halfDates: string[] // 11:00 sessions — weekends + weekdays
  fullDates: string[] // Full-program sessions — weekends only
}

// Build ISO dates for a given 2026 month from a list of day numbers.
const days = (month: number, ds: number[]) =>
  ds.map((d) => `2026-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`)

// ── Seasonal plan (from «Εμπειρίες-Συνδυασμοί-Τιμές-Ημέρες-Ώρες») ────────────
const SEASONAL: Record<string, Seasonal> = {
  // Jul–Aug · Full 09:30–12:15
  "fytefsi-sporon": {
    workshopLabel: "Εργαστήρι Φύτευσης Μελισσοκομικών Σπόρων σε Γλαστράκια",
    months: [7, 8],
    full: { start: "09:30", end: "12:15" },
    halfDates: [
      ...days(7, [23, 24, 25, 26, 31]),
      ...days(8, [1, 2, 6, 7, 8, 9, 13, 14]),
    ],
    fullDates: [...days(7, [25, 26]), ...days(8, [1, 2, 8, 9])],
  },
  // Sep · Full 09:30–12:15
  "ergastiria-mageirikis": {
    workshopLabel:
      "Εργαστήρι Μαγειρικής για Τρουφάκια με μέλι και αλοιφές Όρος Μαχαιρά",
    months: [9],
    full: { start: "09:30", end: "12:15" },
    halfDates: days(9, [3, 4, 5, 6, 10, 11, 12, 13, 17, 18, 19, 24, 25, 26, 27]),
    fullDates: days(9, [5, 6, 12, 13, 19, 26, 27]),
  },
  // Oct · Full 10:00–12:45
  keraloifes: {
    workshopLabel: "Εργαστήρι Παρασκευής Σπιτικής Κεραλοιφής",
    months: [10],
    full: { start: "10:00", end: "12:45" },
    halfDates: days(10, [2, 3, 8, 9, 11, 15, 16, 17, 18, 22, 23, 24, 25, 29, 30]),
    fullDates: days(10, [3, 11, 17, 18, 24, 25]),
  },
  // Nov · Full 10:00–12:45 · NEW workshop
  "melissokeria-vazakia": {
    workshopLabel: "Εργαστήρι Παρασκευής Μελισσοκεριών μέσα σε βαζάκια",
    months: [11],
    full: { start: "10:00", end: "12:45" },
    halfDates: days(11, [1, 5, 6, 7, 8, 12, 13, 14, 15, 19, 20, 21, 22, 26, 27, 28, 29]),
    fullDates: days(11, [1, 7, 8, 14, 15, 21, 22, 28, 29]),
  },
}

const WORKSHOPS: Record<string, any>[] = [
  {
    slug: "melissolampades",
    title: "Μελισσολαμπάδες",
    excerpt:
      "Λίγο πριν το Πάσχα, φτιάξτε με φύλλα κηρήθρας τη δική σας μελισσολαμπάδα και πάρτε τη δωρεάν μαζί σας.",
    description:
      "Λίγο πριν το **Πάσχα**, σας περιμένουμε μαζί με τους μικρούς μας φίλους στο μελισσοκομείο μας, για ένα δημιουργικό και διασκεδαστικό εργαστήρι αφιερωμένο στη μέλισσα και το κερί της!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να μάθουν για τη μέλισσα και το φυσικό κερί, δημιουργώντας παράλληλα τη δική τους πασχαλινή Μελισσολαμπάδα.\n\nΜε φύλλα κηρήθρας από κερί μέλισσας, θα τυλίξετε το φυτίλι και θα κατασκευάσετε τη δική σας λαμπάδα. Στη συνέχεια, με διάφορα πασχαλινά διακοσμητικά, θα τη διακοσμήσετε όπως εσείς επιθυμείτε, δημιουργώντας μια πραγματικά μοναδική Μελισσολαμπάδα.\n\nΣτο τέλος του εργαστηρίου, κάθε συμμετέχων θα πάρει μαζί του **δωρεάν** τη Μελισσολαμπάδα που δημιούργησε, έτοιμη για το Πάσχα!",
    season_label: "Πάσχα",
    months: [3, 4],
    image: "/images/activities/ergastiria/melissolampades.jpg",
    meta_title: "Μελισσολαμπάδες — Εργαστήρι | Όρος Μαχαιρά",
    meta_description:
      "Φτιάξτε τις δικές σας μελισσολαμπάδες λίγο πριν το Πάσχα και πάρτε τες δωρεάν μαζί σας.",
  },
  {
    slug: "fytefsi-sporon",
    title: "Φύτευση σπόρων σε γλαστράκια & διακόσμηση",
    excerpt:
      "Φυτέψτε τους σπόρους σας σε γλαστράκια, ζωγραφίστε τα και μάθετε πώς βοηθάμε τις μέλισσες — πάρτε το γλαστράκι σας δωρεάν.",
    description:
      "Σας περιμένουμε μαζί με την οικογένεια και τους μικρούς μας φίλους στο μελισσοκομείο μας, για ένα **καλοκαιρινό** εργαστήρι αφιερωμένο στη χαρά της φύτευσης, τη δημιουργικότητα και την προστασία των μελισσών!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να φυτέψουν τους δικούς τους σπόρους σε γλαστράκια και να τα ζωγραφίσουν εξωτερικά, δίνοντας χρώμα και αφήνοντας ελεύθερη τη φαντασία τους.\n\nΜέσα από αυτή τη δημιουργική δραστηριότητα, θα μάθουμε πώς η φύτευση φυτών και λουλουδιών μπορεί να βοηθήσει τις μέλισσες, προσφέροντάς τους πολύτιμες πηγές τροφής. Παράλληλα, θα γνωρίσουμε καλύτερα τη σημασία της **επικονίασης** και τον καθοριστικό ρόλο των μελισσών στη φύση και το περιβάλλον.\n\nΣτο τέλος του εργαστηρίου, κάθε συμμετέχων θα πάρει μαζί του **δωρεάν** το γλαστράκι που φύτεψε και διακόσμησε, για να το φροντίσει και να το δει να μεγαλώνει!",
    season_label: "Καλοκαίρι",
    image: "/images/activities/ergastiria/fytefsi-sporon.jpg",
    meta_title: "Φύτευση σπόρων σε γλαστράκια — Εργαστήρι | Όρος Μαχαιρά",
    meta_description:
      "Ένα καλοκαιρινό εργαστήρι φύτευσης και διακόσμησης γλάστρας, με έμφαση στον ρόλο των μελισσών στην επικονίαση.",
  },
  {
    slug: "ergastiria-mageirikis",
    title: "Εργαστήρι Μαγειρικής για Τρουφάκια",
    excerpt:
      "Φτιάξτε σπιτικά τρουφάκια με μέλι και αλοιφές Όρος Μαχαιρά, μαγειρέψτε με προϊόντα της κυψέλης και δοκιμάστε ό,τι δημιουργήσατε.",
    description:
      "Σας περιμένουμε στο μελισσοκομείο μας για ένα γευστικό και δημιουργικό εργαστήρι, αφιερωμένο στο **μέλι** και τα προϊόντα της κυψέλης και την αξιοποίησή τους στη μαγειρική!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να φτιάξουν σπιτικά **τρουφάκια με μέλι** και **αλοιφές Όρος Μαχαιρά**, ανακαλύπτοντας νέους τρόπους χρήσης του μελιού και των προϊόντων της κυψέλης μέσα από απλές και νόστιμες συνταγές.\n\nΚατά τη διάρκεια του εργαστηρίου, θα ετοιμάσετε τις δικές σας δημιουργίες, μαθαίνοντας παράλληλα πώς το μέλι και τα προϊόντα της μέλισσας μπορούν να ενταχθούν δημιουργικά στην καθημερινή μας διατροφή και να χρησιμοποιηθούν σε διαφορετικές γλυκές και αλμυρές συνταγές.\n\nΚαι φυσικά, στο τέλος του εργαστηρίου θα έχουμε την ευκαιρία να δοκιμάσουμε μαζί όσα δημιουργήσαμε, ολοκληρώνοντας μια εμπειρία γεμάτη γεύσεις, αρώματα και… μέλι!",
    season_label: "Φθινόπωρο",
    image: "/images/activities/ergastiria/ergastiria-mageirikis.jpg",
    meta_title: "Εργαστήρι Μαγειρικής — Τρουφάκια με μέλι | Όρος Μαχαιρά",
    meta_description:
      "Φτιάξτε σπιτικά τρουφάκια με μέλι και αλοιφές Όρος Μαχαιρά σε ένα γευστικό εργαστήρι μαγειρικής, με γευσιγνωσία.",
  },
  {
    slug: "keraloifes",
    title: "Παρασκευή κεραλοιφών",
    excerpt:
      "Παρασκευάστε βήμα-βήμα τη δική σας φυσική κεραλοιφή από μελισσοκέρι και πάρτε τη δωρεάν μαζί σας.",
    description:
      "Σας περιμένουμε στο μελισσοκομείο μας για ένα δημιουργικό εργαστήρι αφιερωμένο στο **μελισσοκέρι** και την παρασκευή φυσικών κεραλοιφών!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να γνωρίσουν καλύτερα το μελισσοκέρι και να ανακαλύψουν πώς μπορεί να αξιοποιηθεί, σε συνδυασμό με άλλα φυσικά συστατικά, για την παρασκευή μιας κεραλοιφής.\n\nΚατά τη διάρκεια του εργαστηρίου, θα ακολουθήσουμε μαζί βήμα-βήμα τη διαδικασία παρασκευής και ο κάθε συμμετέχων θα δημιουργήσει τη δική του **φυσική κεραλοιφή**, μαθαίνοντας παράλληλα περισσότερα για τα υλικά που χρησιμοποιούμε και τον ρόλο τους στο τελικό προϊόν.\n\nΣτο τέλος του εργαστηρίου, κάθε συμμετέχων θα πάρει μαζί του **δωρεάν** την κεραλοιφή που δημιούργησε, ως ένα ξεχωριστό αναμνηστικό από την εμπειρία του στον κόσμο της μέλισσας!",
    season_label: "Φθινόπωρο",
    image: "/images/activities/ergastiria/keraloifes.jpg",
    meta_title: "Παρασκευή κεραλοιφών με κερί μέλισσας | Όρος Μαχαιρά",
    meta_description:
      "Ένα εργαστήρι παρασκευής φυσικών κεραλοιφών με μελισσοκέρι και φυσικά συστατικά, βήμα-βήμα.",
  },
  {
    // NEW — the November seasonal workshop from the document.
    slug: "melissokeria-vazakia",
    title: "Μελισσοκέρια σε βαζάκια",
    excerpt:
      "Φτιάξτε το δικό σας φυσικό κερί μέλισσας μέσα σε βαζάκι και πάρτε το δωρεάν μαζί σας — ένα ζεστό φως για τον χειμώνα.",
    description:
      "Σας περιμένουμε στο μελισσοκομείο μας για ένα δημιουργικό και ζεστό εργαστήρι αφιερωμένο στο **μελισσοκέρι** και το φυσικό του φως!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να γνωρίσουν καλύτερα το κερί της μέλισσας και να μάθουν πώς παρασκευάζεται ένα φυσικό κερί μέσα σε βαζάκι.\n\nΚατά τη διάρκεια του εργαστηρίου, θα ακολουθήσουμε μαζί βήμα-βήμα τη διαδικασία και ο κάθε συμμετέχων θα δημιουργήσει το δικό του **μελισσοκέρι σε βαζάκι**, μαθαίνοντας παράλληλα περισσότερα για το κερί και τη μέλισσα.\n\nΣτο τέλος του εργαστηρίου, κάθε συμμετέχων θα πάρει μαζί του **δωρεάν** το μελισσοκέρι που δημιούργησε, ως ένα όμορφο αναμνηστικό από την εμπειρία του στον κόσμο των μελισσών!",
    season_label: "Νοέμβριος",
    image: "/images/activities/ergastiria/melissokeria-vazakia.jpg",
    meta_title: "Μελισσοκέρια σε βαζάκια — Εργαστήρι | Όρος Μαχαιρά",
    meta_description:
      "Φτιάξτε το δικό σας φυσικό κερί μέλισσας μέσα σε βαζάκι και πάρτε το δωρεάν μαζί σας.",
  },
  {
    slug: "peritiligma-fagitou",
    title: "Περιτύλιγμα φαγητού με κερί μέλισσας",
    excerpt:
      "Φτιάξτε το δικό σας επαναχρησιμοποιούμενο περιτύλιγμα τροφίμων από μελισσοκέρι — μια οικολογική επιλογή για κάθε μέρα.",
    description:
      "Σας περιμένουμε μαζί με την οικογένεια και τους μικρούς μας φίλους στο μελισσοκομείο μας, για ένα δημιουργικό και **οικολογικό** εργαστήρι αφιερωμένο στο μελισσοκέρι και τη βιώσιμη καθημερινότητα!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να γνωρίσουν καλύτερα το φυσικό κερί της μέλισσας και να μάθουν πώς μπορούμε να μειώσουμε τη χρήση πλαστικής μεμβράνης στην καθημερινή αποθήκευση και μεταφορά των τροφίμων μας.\n\nΚατά τη διάρκεια του εργαστηρίου, θα δημιουργήσετε το δικό σας **επαναχρησιμοποιούμενο περιτύλιγμα τροφίμων** από μελισσοκέρι, το οποίο μπορεί να χρησιμοποιηθεί για το σάντουιτς των παιδιών στο σχολείο, φρούτα και διάφορα τρόφιμα.\n\nΜέσα από μια ευχάριστη και δημιουργική εμπειρία, θα ανακαλύψουμε μαζί πώς ένα προϊόν της μέλισσας μπορεί να αποτελέσει μια πιο οικολογική επιλογή στην καθημερινότητά μας, συμβάλλοντας στη μείωση της χρήσης πλαστικού.\n\nΣτο τέλος του εργαστηρίου, κάθε συμμετέχων θα πάρει μαζί του **δωρεάν** το περιτύλιγμα από μελισσοκέρι που δημιούργησε, έτοιμο για χρήση!",
    season_label: "Κατόπιν ραντεβού",
    months: [],
    image: "/images/activities/ergastiria/peritiligma-fagitou.jpg",
    meta_title: "Περιτύλιγμα φαγητού με κερί μέλισσας — Εργαστήρι | Όρος Μαχαιρά",
    meta_description:
      "Φτιάξτε ένα επαναχρησιμοποιούμενο, οικολογικό περιτύλιγμα τροφίμων από μελισσοκέρι και μειώστε τη χρήση πλαστικού.",
  },
  {
    slug: "kerines-dimiourgies",
    title: "Χειροποίητες Γύψινες Φιγούρες",
    excerpt:
      "Ζωγραφίστε χειροποίητες γύψινες φιγούρες εμπνευσμένες από τη μέλισσα και πάρτε τη δημιουργία σας δωρεάν μαζί σας.",
    description:
      "Σας περιμένουμε μαζί με την οικογένεια και τους φίλους σας στο μελισσοκομείο μας, για ένα δημιουργικό και διασκεδαστικό εργαστήρι γεμάτο χρώμα, φαντασία και… μέλισσες!\n\nΜικροί και μεγάλοι θα έχουν την ευκαιρία να γνωρίσουν καλύτερα τον υπέροχο κόσμο της μέλισσας, ζωγραφίζοντας χειροποίητες **γύψινες φιγούρες** σε σχήματα μέλισσας, κηρήθρας και άλλων σχεδίων εμπνευσμένων από τη ζωή στην κυψέλη.\n\nΜε χρώματα και πολλή φαντασία, ο κάθε συμμετέχων θα ζωγραφίσει τη δική του μοναδική φιγούρα, σε ένα ευχάριστο και χαλαρωτικό εργαστήρι που δίνει χώρο στη δημιουργικότητα και τη διασκέδαση.\n\nΣτο τέλος του εργαστηρίου, κάθε συμμετέχων θα πάρει μαζί του **δωρεάν** τη γύψινη δημιουργία που ζωγράφισε, ως ένα όμορφο αναμνηστικό από την εμπειρία του στον κόσμο των μελισσών!",
    season_label: "Κατόπιν ραντεβού",
    months: [],
    image: "/images/activities/ergastiria/kerines-dimiourgies.jpg",
    meta_title: "Χειροποίητες Γύψινες Φιγούρες — Εργαστήρι | Όρος Μαχαιρά",
    meta_description:
      "Ζωγραφίστε χειροποίητες γύψινες φιγούρες εμπνευσμένες από τον κόσμο της μέλισσας και πάρτε τη δημιουργία σας δωρεάν μαζί σας.",
  },
]

// Display order on the hub (by slug) — seasonal ones first, in season order.
const RANK: Record<string, number> = {
  "fytefsi-sporon": 0,
  "ergastiria-mageirikis": 1,
  keraloifes: 2,
  "melissokeria-vazakia": 3,
  melissolampades: 4,
  "peritiligma-fagitou": 5,
  "kerines-dimiourgies": 6,
}

/**
 * Re-sync a seasonal workshop's slots to the plan. Creates missing (date,time)
 * slots, refreshes end_time/combo on existing ones (preserving admin-edited
 * capacity + any bookings), and retires slots no longer in the plan: unbooked
 * ones are deleted, booked ones are closed (so the booking survives).
 */
async function syncSeasonalSlots(
  bookings: BookingsModuleService,
  workshopId: string,
  s: Seasonal,
  logger: { info: (m: string) => void }
) {
  type Planned = {
    date: string
    start_time: string
    end_time: string
    combo_key: string
  }
  const planned: Planned[] = [
    ...s.halfDates.map((date) => ({
      date,
      start_time: "11:00",
      end_time: "12:45",
      combo_key: "half",
    })),
    ...s.fullDates.map((date) => ({
      date,
      start_time: s.full.start,
      end_time: s.full.end,
      combo_key: "full",
    })),
  ]

  const existing = (await bookings.listAvailabilitySlots(
    { workshop_id: workshopId },
    { take: 100000 }
  )) as any[]
  const key = (d: string, t: string) => `${d}__${t}`
  const existingByKey = new Map(existing.map((x) => [key(x.date, x.start_time), x]))
  const plannedKeys = new Set(planned.map((p) => key(p.date, p.start_time)))

  const toCreate: any[] = []
  for (const p of planned) {
    const ex = existingByKey.get(key(p.date, p.start_time))
    if (!ex) {
      toCreate.push({
        workshop_id: workshopId,
        date: p.date,
        start_time: p.start_time,
        end_time: p.end_time,
        combo_key: p.combo_key,
        capacity: DEFAULT_CAPACITY,
        status: "open",
      })
    } else if (
      ex.end_time !== p.end_time ||
      ex.combo_key !== p.combo_key ||
      ex.status !== "open"
    ) {
      // Refresh timing/combo, re-open — but keep capacity + booked_count.
      await bookings.updateAvailabilitySlots({
        id: ex.id,
        end_time: p.end_time,
        combo_key: p.combo_key,
        status: "open",
      } as any)
    }
  }
  if (toCreate.length) await bookings.createAvailabilitySlots(toCreate)

  let deleted = 0
  let closed = 0
  for (const x of existing) {
    if (plannedKeys.has(key(x.date, x.start_time))) continue
    if ((x.booked_count ?? 0) === 0) {
      await bookings.deleteAvailabilitySlots(x.id)
      deleted++
    } else if (x.status !== "closed") {
      await bookings.updateAvailabilitySlots({ id: x.id, status: "closed" } as any)
      closed++
    }
  }
  logger.info(
    `[${workshopId}] slots: +${toCreate.length} created, ${deleted} removed, ${closed} closed (planned ${planned.length})`
  )
}

export default async function seedWorkshops({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const bookings = container.resolve(BOOKINGS_MODULE) as BookingsModuleService

  for (const w of WORKSHOPS) {
    const seasonal = SEASONAL[w.slug]
    const data: Record<string, any> = {
      ...w,
      months: seasonal ? seasonal.months : w.months ?? [],
      rank: RANK[w.slug] ?? 99,
      duration_label: seasonal ? "1¾–3 ώρες (ανά πρόγραμμα)" : "45 λεπτά",
      age_label: "Για όλες τις ηλικίες",
      currency: "eur",
      status: "published",
      // Seasonal → age-tiered Half/Full combos; others → DEMO enquiry combos.
      price_tiers: seasonal
        ? seasonalCombos(seasonal.workshopLabel, seasonal.full)
        : DEMO_COMBOS,
    }

    const existing = await bookings.listWorkshops({ slug: w.slug })
    let workshopId: string
    if (existing.length) {
      workshopId = existing[0].id
      await bookings.updateWorkshops({ id: workshopId, ...data } as any)
      logger.info(`Updated workshop ${w.slug}`)
    } else {
      const created: any = await bookings.createWorkshops(data as any)
      workshopId = Array.isArray(created) ? created[0].id : created.id
      logger.info(`Created workshop ${w.slug}`)
    }

    if (seasonal) {
      await syncSeasonalSlots(bookings, workshopId, seasonal, logger)
    }
  }

  logger.info("Workshop seed complete.")
}
