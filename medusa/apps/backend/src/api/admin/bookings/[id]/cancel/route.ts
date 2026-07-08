import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../../modules/bookings"
import type BookingsModuleService from "../../../../../modules/bookings/service"

/**
 * POST /admin/bookings/:id/cancel — cancel a booking and release its seats.
 * (Payment refunds are out of scope for dev; do them in the payment provider.)
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const booking: any = await bookings
    .retrieveBooking(req.params.id)
    .catch(() => null)
  if (!booking) return res.status(404).json({ message: "Booking not found" })

  if (booking.status !== "cancelled") {
    const seats =
      (booking.adults ?? 0) + (booking.children ?? 0) + (booking.infants ?? 0)
    if (booking.slot_id) {
      // Release first, un-swallowed: if it fails we surface a 500 rather than
      // marking the booking cancelled while its seats stay reserved forever.
      await bookings.releaseSeats(booking.slot_id, seats)
    }
    await bookings.updateBookings({ id: booking.id, status: "cancelled" })
  }

  const updated = await bookings.retrieveBooking(req.params.id)
  res.json({ booking: updated })
}
