import type { ExecArgs } from "@medusajs/framework/types"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Seed the site's activities + their availability.
 * Idempotent: re-running updates each activity's content and only adds missing
 * slots (never duplicates).
 *
 *   npx medusa exec ./src/scripts/seed-activities.ts
 *
 * Pricing note: a tier may carry an optional `weekend_price`. Sat/Sun slots are
 * charged at `weekend_price` (when set); every other day uses `price`. Both the
 * booking route (server, authoritative) and the storefront apply the same rule.
 */

type SlotPlan = {
  start_time: string
  end_time: string | null
  weekdays: number[] // 0 (Sun) – 6 (Sat)
  capacity: number
}

// Explicit, hand-listed session dates (e.g. Γνωρίζω τη Μέλισσα runs only on the
// specific days in the client's «Ημέρες-Ώρες» document, not on a weekly cadence).
type DatedSlot = {
  date: string // YYYY-MM-DD
  start_time: string
  end_time: string | null
  capacity: number
}

type ActivityPlan = {
  data: Record<string, any>
  from: string
  to: string
  slots: SlotPlan[]
  datedSlots?: DatedSlot[]
}

// Build ISO dates for a 2026 month from a list of day numbers.
const days2026 = (month: number, ds: number[]) =>
  ds.map(
    (d) => `2026-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  )

// Γνωρίζω τη Μέλισσα (Single Tour & Tasting) — the exact operating dates from the
// document, all at 12:00–13:00.
const GNORIZW_DATES: string[] = [
  ...days2026(7, [23, 24, 25, 26, 31]),
  ...days2026(8, [1, 2, 6, 7, 8, 9, 13, 14]),
  ...days2026(9, [3, 4, 5, 6, 10, 11, 12, 13, 17, 18, 19, 24, 25, 26, 27]),
  ...days2026(10, [2, 3, 8, 9, 11, 15, 16, 17, 18, 22, 23, 24, 25, 29, 30]),
  ...days2026(11, [1, 5, 6, 7, 8, 12, 13, 14, 15, 19, 20, 21, 22, 26, 27, 28, 29]),
]

/**
 * Sync an activity's slots to an explicit list of dated sessions. Creates the
 * missing ones, refreshes end_time on existing, and retires any slot no longer
 * in the plan — unbooked → deleted, booked → closed (so the booking survives).
 */
async function syncActivityDatedSlots(
  bookings: BookingsModuleService,
  activityId: string,
  datedSlots: DatedSlot[],
  logger: { info: (m: string) => void },
  slug: string
) {
  const existing = (await bookings.listAvailabilitySlots(
    { activity_id: activityId },
    { take: 100000 }
  )) as any[]
  const key = (d: string, t: string) => `${d}__${t}`
  const existingByKey = new Map(existing.map((x) => [key(x.date, x.start_time), x]))
  const plannedKeys = new Set(datedSlots.map((p) => key(p.date, p.start_time)))

  const toCreate: any[] = []
  for (const p of datedSlots) {
    const ex = existingByKey.get(key(p.date, p.start_time))
    if (!ex) {
      toCreate.push({
        activity_id: activityId,
        date: p.date,
        start_time: p.start_time,
        end_time: p.end_time,
        capacity: p.capacity,
        status: "open",
      })
    } else if (ex.end_time !== p.end_time || ex.status !== "open") {
      await bookings.updateAvailabilitySlots({
        id: ex.id,
        end_time: p.end_time,
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
    `[${slug}] dated slots: +${toCreate.length} created, ${deleted} removed, ${closed} closed (planned ${datedSlots.length})`
  )
}

export default async function seedActivities({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const bookings = container.resolve(BOOKINGS_MODULE) as BookingsModuleService

  const today = new Date()
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`
  const from = iso(today)
  const endOfYear = `${today.getFullYear()}-12-31`

  const plans: ActivityPlan[] = [
    // ── Περιπέτειες στις Κυψέλες ────────────────────────────────────────────
    {
      from,
      to: `${today.getFullYear()}-10-31`,
      // Weekends only (Σαββατοκύριακα), 45′, capacity 15.
      slots: [
        { start_time: "10:00", end_time: "10:45", weekdays: [6, 0], capacity: 15 },
        { start_time: "14:00", end_time: "14:45", weekdays: [6, 0], capacity: 15 },
      ],
      data: {
        slug: "peripeteies-stis-kypseles",
        title: "Περιπέτειες στις Κυψέλες",
        subtitle:
          "Ντυθείτε μελισσοκόμοι και ανοίξτε την κυψέλη — μια βιωματική εμπειρία για μικρούς και μεγάλους.",
        hero_image: "/images/activities/episkepsi.webp",
        hero_image_alt:
          "Επισκέπτες με στολή μελισσοκόμου ανοίγουν την κυψέλη",
        video_url:
          "https://www.youtube.com/embed/ezF47H1_5-0?autoplay=1&mute=1&loop=1&playlist=ezF47H1_5-0&controls=0&modestbranding=1&rel=0&playsinline=1",
        description:
          "Μια **βιωματική εμπειρία**, κατάλληλη για παιδιά και ενήλικες, όπου ο επισκέπτης ντύνεται με τη στολή του μελισσοκόμου και επισκέπτεται τις κυψέλες μας. Με τη βοήθεια του έμπειρου προσωπικού μας, ανοίγετε την κυψέλη και παρατηρείτε από κοντά την κοινωνία της μέλισσας.\n\nΗ εμπειρία πραγματοποιείται μόνο Σαββατοκύριακα και είναι απαραίτητη η κράτηση εκ των προτέρων μέσα από τη σελίδα.",
        details:
          "**Διάρκεια:** 45 λεπτά\n**Ηλικίες:** δεν υπάρχει κάποιο όριο — η δραστηριότητα είναι κατάλληλη για όλη την οικογένεια. Παρέχονται στολές μελισσοκόμου για όλους τους συμμετέχοντες και όλη η εμπειρία γίνεται υπό την καθοδήγηση έμπειρου μελισσοκόμου. Συνιστάται να φοράτε κλειστά παπούτσια και μακρύ παντελόνι.",
        note: "Η εμπειρία πραγματοποιείται μόνο από τον Μάρτιο έως τον Οκτώβριο, καθώς τον χειμώνα οι μέλισσες κρυώνουν και γίνονται επιθετικές όταν ανοίγουμε την κυψέλη τους.",
        rating: 4.9,
        review_count: 300,
        duration_label: "45 λεπτά",
        age_label: "Χωρίς όριο ηλικίας",
        season_start_month: 3,
        season_end_month: 10,
        currency: "eur",
        status: "published",
        meta_title: "Περιπέτειες στις Κυψέλες — Όρος Μαχαιρά",
        meta_description:
          "Περιπέτειες στις κυψέλες: ντυθείτε μελισσοκόμοι και ανοίξτε την κυψέλη με τη βοήθεια του προσωπικού μας. Μια βιωματική εμπειρία για μικρούς και μεγάλους, μόνο Σαββατοκύριακα, Μάρτιο–Οκτώβριο.",
        // Weekends only → a single price set (no weekday/weekend split).
        price_tiers: [
          { key: "adult", label: "Ενήλικες (12+ ετών)", price: 15 },
          { key: "child", label: "Παιδιά (4–11 ετών)", price: 13 },
          { key: "infant", label: "Βρέφη & Νήπια (0–3 ετών)", price: 0, note: "Δωρεάν" },
        ],
        gallery: Array.from({ length: 11 }, (_, i) => ({
          url: `/images/activities/peripeteies/${String(i + 1).padStart(2, "0")}.webp`,
          alt: "Περιπέτειες στις κυψέλες στο μελισσοκομείο του Όρους Μαχαιρά",
        })),
        features: [
          {
            title: "Ντυθείτε μελισσοκόμοι",
            text: "Φορέστε τη στολή του μελισσοκόμου και νιώστε ασφαλείς δίπλα στις κυψέλες.",
          },
          {
            title: "Ανοίξτε την κυψέλη",
            text: "Με τη βοήθεια του προσωπικού μας, ανοίξτε την κυψέλη και δείτε από κοντά την κοινωνία της μέλισσας.",
          },
          {
            title: "Για μικρούς & μεγάλους",
            text: "Μια ασφαλής, καθοδηγούμενη εμπειρία, κατάλληλη τόσο για παιδιά όσο και για ενήλικες.",
          },
        ],
        policies: [
          {
            title: "Πολιτική Ακύρωσης",
            body: "Ακύρωση έως 72 ώρες πριν με πλήρη επιστροφή χρημάτων.",
          },
          {
            title: "Αλλαγή Κράτησης",
            body: "Για αλλαγή ημερομηνίας ή ώρας, μπορείτε να καλέσετε στο [+357 99 130092](tel:+35799130092). Οι αλλαγές πραγματοποιούνται κατόπιν διαθεσιμότητας.",
          },
        ],
        reviews: [
          {
            name: "Maria Tittoni",
            date: "2025-07-29",
            rating: 5,
            body: "Καταπληκτική εμπειρία! Τα παιδιά ενθουσιάστηκαν που φόρεσαν τη στολή και άνοιξαν την κυψέλη. Ο μελισσοκόμος εξήγησε τα πάντα με υπομονή. Θα το ξανακάναμε!",
          },
          {
            name: "Valentinos Filippou",
            date: "2025-09-20",
            rating: 5,
            body: "Μοναδική βιωματική δράση για όλη την οικογένεια. Είδαμε τη βασίλισσα, δοκιμάσαμε φρέσκο μέλι και μάθαμε πόσο σημαντικές είναι οι μέλισσες. Το προτείνω ανεπιφύλακτα.",
          },
        ],
        related_slugs: [
          "/drastiriotites/xenagiseis",
          "/drastiriotites/ergastiria",
          "/drastiriotites/melissotherapeia",
        ],
      },
    },

    // ── Γνωρίζω τη Μέλισσα (ξεναγήσεις) ──────────────────────────────────────
    {
      from,
      to: endOfYear,
      // Runs only on the specific dates in the client's document, all at
      // 12:00–13:00 (Single Tour & Tasting). Capacity 15.
      slots: [],
      datedSlots: GNORIZW_DATES.map((date) => ({
        date,
        start_time: "12:00",
        end_time: "13:00",
        capacity: 15,
      })),
      data: {
        slug: "xenagiseis",
        title: "Γνωρίζω τη Μέλισσα",
        subtitle:
          "Μια βιωματική ξενάγηση στον κόσμο της μέλισσας — παρατηρήστε τις μέλισσες μέσα από γυάλινες κυψέλες, χωρίς στολή μελισσοκόμου.",
        hero_image: "/images/activities/gnorizw.webp",
        hero_image_alt:
          "Γνωρίζω τη μέλισσα — βιωματική ξενάγηση στο Όρος Μαχαιρά",
        video_url: null,
        description:
          "Για όσους εκτιμούν τη **γνώση μέσω εμπειριών**, δημιουργήσαμε έναν χώρο όπου ο επισκέπτης μαθαίνει τι είναι η μελισσοθεραπεία, παρατηρεί τις μέλισσες μέσα από γυάλινες κυψέλες (χωρίς να χρειαστεί να φορέσει στολή μελισσοκόμου) και ανακαλύπτει τους ρόλους τους μέσα στην κυψέλη.\n\nΘα γνωρίσει τα προϊόντα της κυψέλης και τη χρησιμότητά τους, θα μάθει την ιστορία της οικογενειακής μας επιχείρησης μέσα από βίντεο και θα παίξει ένα διαδραστικό παιχνίδι ερωτήσεων. Στο τέλος, θα γευτεί τα είδη μελιών μας και άλλα προϊόντα που παρασκευάζονται από μέλι όπως το υδρόμελο, την κηρήθρα και τον συνδυασμό αλοιφών με μέλι και ξηρούς καρπούς.",
        details:
          "**Διάρκεια:** 1 ώρα\n**Ηλικίες:** κατάλληλο για όλη την οικογένεια — από μικρά παιδιά έως ενήλικες. Δεν χρειάζεται στολή μελισσοκόμου· η παρατήρηση των μελισσών γίνεται με ασφάλεια μέσα από γυάλινες κυψέλες.",
        note: null,
        rating: 4.9,
        review_count: 300,
        duration_label: "1 ώρα",
        age_label: "Για όλες τις ηλικίες",
        season_start_month: 7,
        season_end_month: 11,
        currency: "eur",
        status: "published",
        meta_title: "Γνωρίζω τη Μέλισσα — Ξεναγήσεις | Όρος Μαχαιρά",
        meta_description:
          "Βιωματική ξενάγηση στο μελισσοκομείο του Όρους Μαχαιρά: παρατηρήστε τις μέλισσες μέσα από γυάλινες κυψέλες, γνωρίστε τα προϊόντα της κυψέλης και γευτείτε τα μέλια μας. Κλείστε online.",
        // Single flat price per age tier (no weekday/weekend split).
        price_tiers: [
          { key: "adult", label: "Ενήλικες (12+ ετών)", price: 8 },
          { key: "child", label: "Παιδιά (4–11 ετών)", price: 4 },
          { key: "infant", label: "Βρέφη & Νήπια (0–3 ετών)", price: 0, note: "Δωρεάν" },
        ],
        gallery: Array.from({ length: 9 }, (_, i) => ({
          url: `/images/xenagiseis/${String(i + 1).padStart(2, "0")}.webp`,
          alt: "Στιγμές από την ξενάγηση «Γνωρίζω τη Μέλισσα» στο Όρος Μαχαιρά",
        })),
        features: [
          {
            title: "Γυάλινες κυψέλες",
            text: "Παρατηρήστε τις μέλισσες και τους ρόλους τους με ασφάλεια — χωρίς να φορέσετε στολή μελισσοκόμου.",
          },
          {
            title: "Προϊόντα της κυψέλης",
            text: "Γνωρίστε το μέλι, το υδρόμελο, την κηρήθρα και τις αλοιφές μελιού — και σε τι χρησιμεύει το καθένα.",
          },
          {
            title: "Γευσιγνωσία & παιχνίδι",
            text: "Δείτε την ιστορία μας σε βίντεο, παίξτε ένα διαδραστικό παιχνίδι ερωτήσεων και γευτείτε τα είδη μελιών μας.",
          },
        ],
        policies: [
          {
            title: "Πολιτική Ακύρωσης",
            body: "Ακύρωση έως 72 ώρες πριν με πλήρη επιστροφή χρημάτων.",
          },
          {
            title: "Αλλαγή Κράτησης",
            body: "Για αλλαγή ημερομηνίας ή ώρας, μπορείτε να καλέσετε στο [+357 99 130092](tel:+35799130092). Οι αλλαγές πραγματοποιούνται κατόπιν διαθεσιμότητας.",
          },
        ],
        reviews: [
          {
            name: "Elena Georgiou",
            date: "2025-08-12",
            rating: 5,
            body: "Υπέροχη εμπειρία για όλη την οικογένεια! Είδαμε τις μέλισσες μέσα από τις γυάλινες κυψέλες και τα παιδιά ενθουσιάστηκαν με το διαδραστικό παιχνίδι και τη γευσιγνωσία μελιού.",
          },
          {
            name: "Andreas Christodoulou",
            date: "2025-10-03",
            rating: 5,
            body: "Πολύ κατατοπιστική ξενάγηση. Μάθαμε για τη μελισσοθεραπεία και τα προϊόντα της κυψέλης, και δοκιμάσαμε υπέροχα μέλια και υδρόμελο. Το συνιστώ ανεπιφύλακτα!",
          },
        ],
        related_slugs: [
          "/drastiriotites/peripeteies-stis-kypseles",
          "/drastiriotites/ergastiria",
          "/drastiriotites/melissotherapeia",
        ],
      },
    },
  ]

  for (const plan of plans) {
    const slug = plan.data.slug
    const existing = await bookings.listActivities({ slug })
    let activityId: string
    if (existing.length) {
      activityId = existing[0].id
      await bookings.updateActivities({ id: activityId, ...plan.data } as any)
      logger.info(`Updated activity ${slug} (${activityId})`)
    } else {
      const created: any = await bookings.createActivities(plan.data as any)
      activityId = Array.isArray(created) ? created[0].id : created.id
      logger.info(`Created activity ${slug} (${activityId})`)
    }

    for (const s of plan.slots) {
      for (const weekday of s.weekdays) {
        const r = await bookings.generateSlots({
          activityId,
          weekday,
          start_time: s.start_time,
          end_time: s.end_time,
          capacity: s.capacity,
          from: plan.from,
          to: plan.to,
        })
        logger.info(
          `[${slug}] slots wd${weekday} @${s.start_time}: created ${r.created}, skipped ${r.skipped}`
        )
      }
    }

    // Explicit hand-listed dates (Γνωρίζω τη Μέλισσα): create the exact sessions
    // and retire anything else (unbooked → deleted, booked → closed). This clears
    // the old daily 10:00/15:00 slots when re-applying the document.
    if (plan.datedSlots?.length) {
      await syncActivityDatedSlots(bookings, activityId, plan.datedSlots, logger, slug)
    }

    // `generateSlots` never touches pre-existing rows, so normalise the (display-
    // only) end_time on every slot to match the plan — this keeps re-priced /
    // re-timed activities consistent without deleting slots that may hold bookings.
    const endByStart = new Map(plan.slots.map((s) => [s.start_time, s.end_time]))
    const allSlots = await bookings.listAvailabilitySlots(
      { activity_id: activityId },
      { select: ["id", "start_time", "end_time"], take: 100000 }
    )
    const stale = allSlots.filter(
      (s: any) =>
        endByStart.has(s.start_time) &&
        s.end_time !== endByStart.get(s.start_time)
    )
    if (stale.length) {
      await bookings.updateAvailabilitySlots(
        stale.map((s: any) => ({ id: s.id, end_time: endByStart.get(s.start_time) }))
      )
      logger.info(`[${slug}] normalised end_time on ${stale.length} slots`)
    }
  }

  logger.info("Activity seed complete.")
}
