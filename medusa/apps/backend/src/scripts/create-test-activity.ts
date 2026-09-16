import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * A €1 activity for testing real bookings end to end: choose a date, pay by
 * card (Stripe), get the confirmation emails.
 *
 * `hidden` keeps it out of the sitemap and the storefront serves its page
 * noindex; nothing on the site links to it, so it is reachable only by link:
 *   https://orosmaxaira.com/drastiriotites/dokimastiki-drastiriotita/
 *
 * Seats: €1 per adult or child, infants free. Open slots at 10:00 every day for
 * the next 60 days (capacity 20). Re-running tops the slots up to 60 days ahead
 * and changes nothing else.
 *
 *   npx medusa exec ./src/scripts/create-test-activity.ts
 */

const SLUG = "dokimastiki-drastiriotita"
const DAYS_AHEAD = 60

/** YYYY-MM-DD in Cyprus time, `offset` days from today. */
function cyprusDate(offset: number): string {
  const d = new Date(Date.now() + offset * 86_400_000)
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Nicosia" }).format(d)
}

export default async function createTestActivity({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  // `listActivities` is typed as the single-record overload here, so the array
  // it actually returns has to go through `unknown` (ts(2352) otherwise —
  // `medusa build` typechecks src/scripts and fails the Railway deploy on it).
  let [activity] = (await bookings.listActivities({ slug: SLUG })) as unknown as { id: string }[]
  if (activity) {
    logger.info(`Test activity already exists (${activity.id}).`)
  } else {
    const [created] = (await bookings.createActivities([
      {
        slug: SLUG,
        title: "Δοκιμαστική δραστηριότητα (€1)",
        subtitle: "Εσωτερική δραστηριότητα για δοκιμές κρατήσεων και πληρωμών. Δεν εμφανίζεται στο site.",
        hero_image: "/images/activities/gnorizw.webp",
        hero_image_alt: "Δοκιμαστική δραστηριότητα",
        description:
          "Χρησιμοποιήστε αυτή τη σελίδα για να δοκιμάσετε ολόκληρη τη διαδικασία κράτησης: επιλογή ημερομηνίας, πληρωμή με κάρτα και email επιβεβαίωσης.",
        duration_label: "1 ώρα",
        age_label: "Όλες οι ηλικίες",
        currency: "eur",
        status: "published",
        booking_type: "seats",
        hidden: true,
        meta_title: "Δοκιμαστική δραστηριότητα",
        price_tiers: [
          { key: "adult", label: "Ενήλικες", price: 1 },
          { key: "child", label: "Παιδιά", price: 1 },
          { key: "infant", label: "Βρέφη", price: 0, note: "Δωρεάν" },
        ],
        policies: [
          { title: "Δοκιμαστική κράτηση", body: "Οι κρατήσεις εδώ χρησιμοποιούνται μόνο για δοκιμές." },
        ],
        related_slugs: [],
      },
    ] as any)) as unknown as { id: string }[]
    activity = created
    logger.info(`Created hidden test activity "${SLUG}" (${activity.id}).`)
  }

  const existing = (await bookings.listAvailabilitySlots(
    { activity_id: activity.id },
    { take: 10_000, select: ["date", "start_time"] },
  )) as { date: string; start_time: string }[]
  const have = new Set(existing.map((s) => `${s.date} ${s.start_time}`))

  const toCreate = Array.from({ length: DAYS_AHEAD }, (_, i) => cyprusDate(i + 1))
    .filter((date) => !have.has(`${date} 10:00`))
    .map((date) => ({
      activity_id: activity.id,
      date,
      start_time: "10:00",
      end_time: "11:00",
      capacity: 20,
      status: "open",
    }))
  if (toCreate.length) await bookings.createAvailabilitySlots(toCreate as any)
  logger.info(`Test activity slots: ${toCreate.length} added, ${existing.length} already there.`)
}
