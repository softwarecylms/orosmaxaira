import type { MedusaContainer } from "@medusajs/framework/types"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"
import { HOLD_MINUTES, releaseBooking, type BookingRow } from "../lib/booking-payment"

/**
 * Settle card-payment holds that were never finished.
 *
 * A booking stays `pending` — its seats reserved — while the customer types
 * their card. If they close the tab, nothing tells the server, so every five
 * minutes this settles holds older than HOLD_MINUTES:
 *
 *   - paid, but the page never confirmed (the customer left straight after
 *     paying) → confirmed, because Stripe will not cancel a succeeded intent
 *   - anything else → the PaymentIntent is cancelled, and only then are the
 *     seats put back on sale
 *
 * See src/lib/booking-payment.ts for the full lifecycle.
 */
export default async function releaseStaleBookings(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const cutoff = new Date(Date.now() - HOLD_MINUTES * 60_000)

  const stale = await bookings.listBookings(
    { status: "pending", created_at: { $lt: cutoff } } as any,
    { take: 100 },
  )
  if (!stale.length) return

  for (const row of stale) {
    const booking = row as unknown as BookingRow
    try {
      const outcome = await releaseBooking(container, booking)
      logger.info(`[bookings] expired hold ${booking.reference}: ${outcome}`)
    } catch (e: unknown) {
      logger.warn(`[bookings] could not settle ${booking.reference}: ${(e as Error)?.message ?? e}`)
    }
  }
}

export const config = {
  name: "release-stale-booking-holds",
  schedule: "*/5 * * * *",
}
