import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { findClientBooking, releaseBooking } from "../../../../lib/booking-payment"

type ReleaseBody = { reference: string; idempotency_key: string }

/**
 * POST /store/bookings/release
 *
 * Back or close during the payment step: cancel the PaymentIntent and give the
 * held seats back now, rather than making other customers wait out the hold. If
 * the card had in fact been paid, the intent cannot be cancelled and the booking
 * is confirmed instead — `status` says which.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = ((req as any).validatedBody ?? req.body) as ReleaseBody
  const booking = await findClientBooking(req.scope, body.reference, body.idempotency_key)
  // Unknown, or already released (a released booking's key is cleared): nothing
  // is held any more, which is exactly what the caller wants.
  if (!booking) return res.json({ status: "cancelled" })

  const status = await releaseBooking(req.scope, booking)
  res.json({ status })
}
