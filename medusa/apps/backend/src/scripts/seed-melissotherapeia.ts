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
      "Μια θεραπευτική πρακτική της εναλλακτικής ιατρικής, με τα πολύτιμα προϊόντα της κυψέλης.",
    hero_image: "/images/activities/melisotherapia.webp",
    hero_image_alt: "Μελισσοθεραπεία — εισπνοή του αέρα της κυψέλης",
    video_url:
      "https://www.youtube.com/embed/oN8yOrjoJY4?autoplay=1&mute=1&loop=1&playlist=oN8yOrjoJY4&controls=0&modestbranding=1&rel=0&playsinline=1",
    description:
      "Πρώτοι ανακάλυψαν και εφάρμοσαν τη Μελισσοθεραπεία οι αρχαίοι Αιγύπτιοι. Η Μελισσοθεραπεία είναι μία εκτενής θεραπευτική πρακτική η οποία ανήκει στην **εναλλακτική ιατρική** και χρησιμοποιεί τα **παράγωγα της κυψέλης** (μέλι, βασιλικό πολτό, γύρη, δηλητήριο μέλισσας, πρόπολη) σε διάφορες θεραπευτικές εφαρμογές.\n\nΗ Μελισσοθεραπεία, με φυσικό τρόπο, μας βοηθά να ξεπεράσουμε πολλά **προβλήματα υγείας** και είναι εξαιρετική για παιδιά, αθλητές αλλά και ηλικιωμένους.",
    // Rendered as the "Συχνότητα" line on the storefront.
    details: "Κάθε 2η ημέρα, για 3 εβδομάδες",
    note: "Τα παράγωγα της μέλισσας και η εισπνοή του αέρα της κυψέλης δεν είναι φάρμακα ούτε υποκαθιστούν τα ειδικά φάρμακα. Λειτουργούν παράλληλα και συμπληρωματικά με την κανονική θεραπεία — όχι ως αντικατάστασή της.",
    duration_label: "20 λεπτά / συνεδρία",
    age_label: "Για όλες τις ηλικίες",
    season_start_month: 4,
    season_end_month: 10,
    currency: "eur",
    status: "published",
    booking_type: "enquiry",
    meta_title: "Μελισσοθεραπεία στην Κύπρο — Όρος Μαχαιρά",
    meta_description:
      "Μελισσοθεραπεία στο Όρος Μαχαιρά: μια θεραπευτική πρακτική της εναλλακτικής ιατρικής με τα προϊόντα της κυψέλης και την εισπνοή του αέρα της. Ραντεβού Απρίλιο–Οκτώβριο.",
    features: [
      {
        title: "Εισπνοή αέρα κυψέλης",
        text: "Μέσω ειδικής αναπνευστικής μάσκας εισπνέετε τον θερμό αέρα της κυψέλης, με τις ευεργετικές του ουσίες.",
      },
      {
        title: "Προϊόντα της κυψέλης",
        text: "Μέλι, πρόπολη, γύρη, βασιλικός πολτός και δηλητήριο μέλισσας αξιοποιούνται για τις ευεργετικές τους ιδιότητες.",
      },
      {
        title: "Περίοδος & διάρκεια",
        text: "Εφαρμόζεται Απρίλιο–Οκτώβριο: για αισθητά αποτελέσματα, τρεις εβδομάδες, κάθε δεύτερη ημέρα για 20 λεπτά.",
      },
    ],
    benefits: {
      intro:
        "Οι αρχαίοι Αιγύπτιοι, εκτός των άλλων, χρησιμοποιούσαν την εισπνοή αέρα από το εσωτερικό της κυψέλης στη θεραπεία διάφορων αναπνευστικών προβλημάτων. Εισπνέοντας τον θερμό αέρα της κυψέλης, μέσω μιας ειδικής αναπνευστικής μάσκας εισάγονται στον οργανισμό ουσίες με ισχυρή θεραπευτική δράση, οι οποίες είναι εξαιρετικά ευεργετικές στην ανθρώπινη ψυχοσωματική κατάσταση. Ο αέρας του εσωτερικού της κυψέλης, διαποτισμένος με ουσιώδη αρώματα, βοηθά τους ανθρώπους στην αντιμετώπιση των πιο κάτω καταστάσεων:",
      items: [
        "Βρογχίτιδα",
        "Άσθμα",
        "Χρόνιες παθήσεις των πνευμόνων",
        "Ευαισθησία στις λοιμώξεις",
        "Αδύνατο ανοσοποιητικό σύστημα",
        "Λοιμώξεις του αναπνευστικού συστήματος",
        "Χρόνιοι πονοκέφαλοι, ημικρανίες",
        "Στρες",
        "Κατάθλιψη",
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
