import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  findClientBooking,
  publicBookingOf,
  tryConfirmBooking,
} from "../../../../lib/booking-payment"

type ConfirmBody = { reference: string; idempotency_key: string }

/**
 * POST /store/bookings/confirm
 *
 * Called by the booking modal once Stripe has taken the card. Confirms the
 * booking only if the PaymentIntent really succeeded — authorising the session
 * asks Stripe, so a browser cannot claim a payment that never happened. Covers
 * activity and workshop bookings alike. Safe to call twice.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = ((req as any).validatedBody ?? req.body) as ConfirmBody
  const booking = await findClientBooking(req.scope, body.reference, body.idempotency_key)
  if (!booking) {
    return res
      .status(404)
      .json({ message: "Η κράτηση δεν βρέθηκε ή έληξε. Ξεκινήστε ξανά την κράτηση." })
  }

  const confirmed = await tryConfirmBooking(req.scope, booking)
  if (!confirmed) {
    return res.status(402).json({ message: "Η πληρωμή δεν έχει ολοκληρωθεί." })
  }

  res.json({ booking: await publicBookingOf(req.scope, booking) })
}
