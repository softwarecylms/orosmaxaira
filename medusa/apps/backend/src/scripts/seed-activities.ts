import type { ExecArgs } from "@medusajs/framework/types"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Seed the "Περιπέτειες στις Κυψέλες" activity + its availability.
 * Idempotent: re-running updates the activity content and only adds missing slots.
 *
 *   npx medusa exec ./src/scripts/seed-activities.ts
 */
export default async function seedActivities({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const bookings = container.resolve(BOOKINGS_MODULE) as BookingsModuleService

  const slug = "peripeteies-stis-kypseles"

  const activityData = {
    slug,
    title: "Περιπέτειες στις Κυψέλες",
    subtitle:
      "Ντυθείτε μελισσοκόμοι και ανοίξτε την κυψέλη — μια βιωματική εμπειρία για μικρούς και μεγάλους.",
    hero_image: "/images/activities/episkepsi.webp",
    hero_image_alt: "Επισκέπτες με στολή μελισσοκόμου ανοίγουν την κυψέλη",
    video_url:
      "https://www.youtube.com/embed/ezF47H1_5-0?autoplay=1&mute=1&loop=1&playlist=ezF47H1_5-0&controls=0&modestbranding=1&rel=0&playsinline=1",
    description:
      "Μια **βιωματική εμπειρία**, κατάλληλη για παιδιά και ενήλικες, όπου ο επισκέπτης ντύνεται με τη στολή του μελισσοκόμου και επισκέπτεται τις κυψέλες μας. Με τη βοήθεια του έμπειρου προσωπικού μας, ανοίγετε την κυψέλη και παρατηρείτε από κοντά την κοινωνία της μέλισσας.\n\nΗ εμπειρία πραγματοποιείται μόνο συγκεκριμένες ώρες και ημέρες — ως επί το πλείστον τα Σάββατα. Γι' αυτό είναι απαραίτητη η κράτηση εκ των προτέρων μέσα από τη σελίδα.",
    details:
      "**Διάρκεια:** 2 ώρες\n**Ηλικίες:** δεν υπάρχει κάποιο όριο — η δραστηριότητα είναι κατάλληλη για όλη την οικογένεια. Παρέχονται στολές μελισσοκόμου για όλους τους συμμετέχοντες και όλη η εμπειρία γίνεται υπό την καθοδήγηση έμπειρου μελισσοκόμου. Συνιστάται να φοράτε κλειστά παπούτσια και μακρύ παντελόνι.",
    note: "Η εμπειρία πραγματοποιείται μόνο από τον Μάρτιο έως τον Οκτώβριο, καθώς τον χειμώνα οι μέλισσες κρυώνουν και γίνονται επιθετικές όταν ανοίγουμε την κυψέλη τους.",
    rating: 4.9,
    review_count: 300,
    duration_label: "2 ώρες",
    age_label: "Χωρίς όριο ηλικίας",
    season_start_month: 3,
    season_end_month: 10,
    currency: "eur",
    status: "published",
    meta_title: "Περιπέτειες στις Κυψέλες — Όρος Μαχαιρά",
    meta_description:
      "Περιπέτειες στις κυψέλες: ντυθείτε μελισσοκόμοι και ανοίξτε την κυψέλη με τη βοήθεια του προσωπικού μας. Μια βιωματική εμπειρία για μικρούς και μεγάλους, διαθέσιμη Μάρτιο–Οκτώβριο.",
    price_tiers: [
      { key: "adult", label: "Ενήλικες (15+ ετών)", price: 20 },
      { key: "child", label: "Παιδιά (4–14 ετών)", price: 15 },
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
  }

  const existing = await bookings.listActivities({ slug })
  let activityId: string
  if (existing.length) {
    activityId = existing[0].id
    await bookings.updateActivities({ id: activityId, ...activityData } as any)
    logger.info(`Updated activity ${slug} (${activityId})`)
  } else {
    const created: any = await bookings.createActivities(activityData as any)
    activityId = Array.isArray(created) ? created[0].id : created.id
    logger.info(`Created activity ${slug} (${activityId})`)
  }

  // Availability: every Saturday (weekday 6), two slots (10:00 & 14:00),
  // capacity 15, from today through the end of October 2026.
  const today = new Date()
  const from = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  const to = `${today.getFullYear()}-10-31`
  for (const start_time of ["10:00", "14:00"]) {
    const r = await bookings.generateSlots({
      activityId,
      weekday: 6,
      start_time,
      end_time: start_time === "10:00" ? "12:00" : "16:00",
      capacity: 15,
      from,
      to,
    })
    logger.info(`Slots @${start_time}: created ${r.created}, skipped ${r.skipped}`)
  }

  logger.info("Activity seed complete.")
}
