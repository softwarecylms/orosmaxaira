import type { ExecArgs } from "@medusajs/framework/types"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Seed Μελισσοθεραπεία as an ENQUIRY activity (no seats/slots — it's an
 * appointment). Idempotent by slug.  npx medusa exec ./src/scripts/seed-melissotherapeia.ts
 */
export default async function seedMelissotherapeia({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const bookings = container.resolve(BOOKINGS_MODULE) as BookingsModuleService

  const data = {
    slug: "melissotherapeia",
    title: "Μελισσοθεραπεία",
    subtitle:
      "Μια παραδοσιακή πρακτική, με τα πολύτιμα προϊόντα της κυψέλης.",
    hero_image: "/images/activities/melisotherapia.webp",
    hero_image_alt: "Μελισσοθεραπεία — εισπνοή του αέρα της κυψέλης",
    video_url:
      "https://www.youtube.com/embed/oN8yOrjoJY4?autoplay=1&mute=1&loop=1&playlist=oN8yOrjoJY4&controls=0&modestbranding=1&rel=0&playsinline=1",
    description:
      "Πρώτοι ανακάλυψαν και εφάρμοσαν τη Μελισσοθεραπεία οι αρχαίοι Αιγύπτιοι. Η Μελισσοθεραπεία είναι μια **παραδοσιακή πρακτική** που αξιοποιεί τα **παράγωγα της κυψέλης** (μέλι, βασιλικό πολτό, γύρη, πρόπολη) και τον θερμό αέρα της, σε μια εμπειρία χαλάρωσης μέσα στο μελισσοκομείο.\n\nΣτο Όρος Μαχαιρά προσφέρεται ως μια ήρεμη, αισθητηριακή εμπειρία μέσα στη φύση και είναι κατάλληλη για ενήλικες και παιδιά.",
    // Rendered as the "Συχνότητα" line on the storefront.
    details: "Κάθε 2η ημέρα, για 3 εβδομάδες",
    note: "Η μελισσοθεραπεία δεν είναι ιατρική πράξη. Τα προϊόντα της κυψέλης και η εισπνοή του αέρα της δεν είναι φάρμακα: δεν προλαμβάνουν, δεν αντιμετωπίζουν και δεν θεραπεύουν ασθένειες, ούτε υποκαθιστούν την ιατρική συμβουλή ή την αγωγή σας. Αν έχετε πρόβλημα υγείας ή γνωστή αλλεργία σε προϊόντα μέλισσας ή σε τσιμπήματα, συμβουλευτείτε πρώτα τον γιατρό σας.",
    duration_label: "20 λεπτά / συνεδρία",
    age_label: "Για όλες τις ηλικίες",
    season_start_month: 4,
    season_end_month: 10,
    currency: "eur",
    status: "published",
    booking_type: "enquiry",
    // Shown as the "Κόστος" line on the booking card (editable in admin).
    price_tiers: [{ key: "session", label: "Ανά συνεδρία", price: 7 }],
    meta_title: "Μελισσοθεραπεία στην Κύπρο — Όρος Μαχαιρά",
    meta_description:
      "Μελισσοθεραπεία στο Όρος Μαχαιρά: μια παραδοσιακή πρακτική με τα προϊόντα της κυψέλης και την εισπνοή του αέρα της. Ραντεβού Απρίλιο–Οκτώβριο.",
    features: [
      {
        title: "Εισπνοή αέρα κυψέλης",
        text: "Μέσω ειδικής αναπνευστικής μάσκας εισπνέετε τον θερμό, αρωματικό αέρα της κυψέλης.",
      },
      {
        title: "Προϊόντα της κυψέλης",
        text: "Μέλι, πρόπολη, γύρη και βασιλικός πολτός συνοδεύουν την εμπειρία.",
      },
      {
        title: "Περίοδος & διάρκεια",
        text: "Εφαρμόζεται Απρίλιο–Οκτώβριο: τρεις εβδομάδες, κάθε δεύτερη ημέρα για 20 λεπτά.",
      },
    ],
    benefits: {
      intro:
        "Οι αρχαίοι Αιγύπτιοι ήταν από τους πρώτους που κάθισαν δίπλα στην κυψέλη για να αναπνεύσουν τον αέρα της. Σήμερα, στο δικό μας μελισσοκομείο, η εμπειρία παραμένει το ίδιο απλή: κάθεστε αναπαυτικά, φοράτε την ειδική μάσκα και αφήνετε τον θερμό, αρωματικό αέρα της κυψέλης και τον ήχο του μελισσιού να σας συνοδεύσουν για είκοσι λεπτά. Να τι περιλαμβάνει κάθε συνεδρία:",
      items: [
        "Ο θερμός αέρας της κυψέλης, μέσω ειδικής αναπνευστικής μάσκας",
        "Τα φυσικά αρώματα του κεριού, της πρόπολης και του μελιού",
        "Ο χαρακτηριστικός ήχος και ο παλμός του μελισσιού",
        "Είκοσι λεπτά ησυχίας μέσα στη φύση του Μαχαιρά",
        "Ασφαλής, ελεγχόμενος χώρος — χωρίς άμεση επαφή με τις μέλισσες",
        "Καθοδήγηση από έμπειρο μελισσοκόμο σε όλη τη διάρκεια",
      ],
    },
    gallery: Array.from({ length: 10 }, (_, i) => ({
      url: `/images/activities/melissotherapeia/${String(i + 1).padStart(2, "0")}.webp`,
      alt: "Μελισσοθεραπεία στο μελισσοκομείο του Όρους Μαχαιρά",
    })),
    related_slugs: [
      "/drastiriotites/xenagiseis",
      "/drastiriotites/peripeteies-stis-kypseles",
      "/drastiriotites/ergastiria",
    ],
  }

  const existing = await bookings.listActivities({ slug: data.slug })
  if (existing.length) {
    await bookings.updateActivities({ id: existing[0].id, ...data } as any)
    logger.info(`Updated activity ${data.slug}`)
  } else {
    await bookings.createActivities(data as any)
    logger.info(`Created activity ${data.slug}`)
  }
  logger.info("Μελισσοθεραπεία seed complete.")
}
