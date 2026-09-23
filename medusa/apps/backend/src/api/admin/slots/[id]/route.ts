import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../modules/bookings"
import type BookingsModuleService from "../../../../modules/bookings/service"

/** POST /admin/slots/:id — update a slot (capacity / status / times). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const b = req.body as any
  const patch: Record<string, unknown> = { id: req.params.id }
  for (const k of ["capacity", "status", "start_time", "end_time", "date", "combo_key"]) {
    if (b[k] !== undefined) patch[k] = b[k]
  }
  await bookings.updateAvailabilitySlots(patch as any)
  const slot = await bookings.retrieveAvailabilitySlot(req.params.id)
  res.json({ slot })
}

/**
 * DELETE /admin/slots/:id — take a slot out of the programme.
 *
 * Bookings are history and must stay in the workshop's «Κρατήσεις» tab, so the
 * slot is ARCHIVED (soft-deleted) and its booking rows are left untouched — a
 * hard delete would try to detach them and fail with "You tried to set
 * relationship id … but such entity does not exist", which is why a slot that
 * ever had a booking could not be removed (and the admin showed nothing).
 * A slot with a live booking (pending/confirmed) is refused, with the reason.
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const id = req.params.id

  const [slot] = await bookings.listAvailabilitySlots({ id })
  if (!slot) {
    return res.status(404).json({ message: "Το slot δεν βρέθηκε — ίσως έχει ήδη διαγραφεί. Ανανεώστε τη σελίδα." })
  }

  const rows = await bookings.listBookings({ slot_id: id })
  const live = rows.filter((b: { status?: string }) => b.status !== "cancelled")
  if (live.length) {
    const refs = live
      .map((b: { reference?: string | null }) => b.reference ?? "")
      .filter(Boolean)
      .slice(0, 5)
      .join(", ")
    return res.status(409).json({
      message:
        `Το slot ${slot.date} ${slot.start_time} έχει ${live.length} ενεργή κράτηση` +
        `${live.length === 1 ? "" : "εις"}${refs ? ` (${refs})` : ""}. ` +
        "Ακυρώστε τις πρώτα από την καρτέλα «Κρατήσεις» και δοκιμάστε ξανά.",
    })
  }

  // Archived, not erased: the cancelled bookings keep pointing at it, so they
  // stay in the workshop's «Κρατήσεις» tab with their date.
  await bookings.softDeleteAvailabilitySlots([id])
  res.json({ id, deleted: true, kept_bookings: rows.length })
}
