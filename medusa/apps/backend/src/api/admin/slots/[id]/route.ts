import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../modules/bookings"
import type BookingsModuleService from "../../../../modules/bookings/service"

/** POST /admin/slots/:id — update a slot (capacity / status / times). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const b = req.body as any
  const patch: Record<string, unknown> = { id: req.params.id }
  for (const k of ["capacity", "status", "start_time", "end_time", "date"]) {
    if (b[k] !== undefined) patch[k] = b[k]
  }
  await bookings.updateAvailabilitySlots(patch as any)
  const slot = await bookings.retrieveAvailabilitySlot(req.params.id)
  res.json({ slot })
}

/** DELETE /admin/slots/:id */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  await bookings.deleteAvailabilitySlots(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
