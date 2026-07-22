import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../../../modules/bookings"
import type BookingsModuleService from "../../../../../../modules/bookings/service"

/**
 * POST /admin/workshops/:id/slots/generate
 * Body: { weekday, start_time, end_time?, capacity, from, to }
 * Bulk-create weekly recurring slots for a workshop (idempotent).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const b = req.body as any
  const result = await bookings.generateSlots({
    workshopId: req.params.id,
    weekday: Number(b.weekday),
    start_time: b.start_time,
    end_time: b.end_time ?? null,
    capacity: Number(b.capacity),
    from: b.from,
    to: b.to,
    combo_key: b.combo_key ?? null,
  })
  res.json(result)
}
