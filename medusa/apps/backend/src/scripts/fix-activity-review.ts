import type { ExecArgs } from "@medusajs/framework/types"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Replaces the placeholder review on «Περιπέτειες στις Κυψέλες» with a real
 * Google review.
 *
 * The one it replaces was signed "Valentinos Filippou" — the company's own
 * Deputy Director — which is a fabricated testimonial under a real officer's
 * name. Both the Greek record and its `translations.en` overlay are updated.
 *
 * Dated "2025-10" (month precision) because Google shows only "11 months ago";
 * `formatReviewDate` renders a month-only value as "Οκτώβριος 2025".
 *
 * Idempotent — matches on the reviewer name, so re-running is a no-op.
 *   npx medusa exec ./src/scripts/fix-activity-review.ts
 */

const OLD_NAME = "Valentinos Filippou"

const EL_REVIEW = {
  name: "Nedi Kaffa",
  date: "2025-10",
  rating: 5,
  body: "Κορυφαίο μέρος για να πάτε τα παιδιά σε μια περιπέτεια, να γνωρίσουν και να σεβαστούν τη φύση! Κάναμε ξενάγηση με στολές μελισσοκόμου, μάθαμε για τις μέλισσες σε δύο διαφορετικούς χώρους, κάναμε γευσιγνωσία μελιού και στη συνέχεια φτιάξαμε ένα ξενοδοχείο για μέλισσες!",
}

const EN_REVIEW = {
  name: "Nedi Kaffa",
  date: "2025-10",
  rating: 5,
  body: "Top place to take kids for an adventure to get to know and respect nature! We had a tour with bee suits, learnt about bees in two different settings did a honey tasting and then constructed a bee hotel!",
}

type Review = { name?: string; date?: string; rating?: number; body?: string }

/** Swap the placeholder for `next`, leaving every other review untouched. */
function swap(reviews: unknown, next: Review): { list: Review[]; changed: boolean } {
  const list = Array.isArray(reviews) ? (reviews as Review[]) : []
  let changed = false
  const out = list.map((r) => {
    if (r?.name !== OLD_NAME) return r
    changed = true
    return next
  })
  return { list: out, changed }
}

export default async function fixActivityReview({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const bookings = container.resolve(BOOKINGS_MODULE) as BookingsModuleService

  const [activity] = await bookings.listActivities({ slug: "peripeteies-stis-kypseles" })
  if (!activity) {
    logger.warn("No 'peripeteies-stis-kypseles' activity found — nothing to do.")
    return
  }

  const record = activity as any
  const patch: Record<string, unknown> = { id: record.id }
  let changed = false

  const el = swap(record.reviews, EL_REVIEW)
  if (el.changed) {
    patch.reviews = el.list
    changed = true
  }

  const translations = (record.translations ?? {}) as Record<string, any>
  if (translations.en) {
    const en = swap(translations.en.reviews, EN_REVIEW)
    if (en.changed) {
      patch.translations = { ...translations, en: { ...translations.en, reviews: en.list } }
      changed = true
    }
  }

  if (!changed) {
    logger.info("Placeholder review not present — already replaced.")
    return
  }

  await bookings.updateActivities(patch as any)
  logger.info(`✓ Replaced the "${OLD_NAME}" placeholder with the Nedi Kaffa Google review (el + en).`)
}
