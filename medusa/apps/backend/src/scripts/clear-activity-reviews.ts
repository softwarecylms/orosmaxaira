import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Clears reviews and the aggregate rating from every activity.
 *
 * The seeded reviews were placeholders — invented names, one of them the
 * company's own Deputy Director — alongside a "4.9 based on 300 reviews"
 * aggregate that counted nothing. Presenting either as genuine consumer reviews
 * is a blacklisted practice under the Omnibus Directive (EU) 2019/2161, so they
 * come down until real, verifiable ones are available.
 *
 * `rating` and `review_count` are cleared too, otherwise the stars would keep
 * showing on the hero and the booking card with no reviews behind them. Every
 * render site is already guarded, so clearing the data hides the whole section.
 *
 * Workshops carry no review fields, so there is nothing to clear there.
 *
 * Idempotent.  npx medusa exec ./src/scripts/clear-activity-reviews.ts
 */
export default async function clearActivityReviews({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  const activities = await bookings.listActivities({})
  let changed = 0

  for (const a of activities as any[]) {
    const hasReviews = Array.isArray(a.reviews) && a.reviews.length > 0
    const hasAggregate = a.rating != null || (a.review_count ?? 0) > 0

    const translations = (a.translations ?? {}) as Record<string, any>
    const enHasReviews =
      Array.isArray(translations.en?.reviews) && translations.en.reviews.length > 0

    if (!hasReviews && !hasAggregate && !enHasReviews) continue

    const patch: Record<string, unknown> = {
      id: a.id,
      reviews: [],
      rating: null,
      // `review_count` is not nullable on the model, so it goes to zero.
      review_count: 0,
    }
    if (translations.en) {
      // An empty array, not `delete` — the JSON column is merged on update, so a
      // removed key would leave the stored reviews untouched.
      patch.translations = { ...translations, en: { ...translations.en, reviews: [] } }
    }

    await bookings.updateActivities(patch as any)
    changed++
    logger.info(`  reviews cleared -> ${a.slug}`)
  }

  logger.info(`✓ Activity reviews and ratings cleared — records updated: ${changed}`)
}
