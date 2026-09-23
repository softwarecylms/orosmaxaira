import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../../modules/bookings"
import type BookingsModuleService from "../../../../../modules/bookings/service"

/** GET /admin/activities/:id/slots — list slots (optionally ?from=). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const { from } = req.query as Record<string, string | undefined>
  const filters: Record<string, unknown> = { activity_id: req.params.id }
  if (from) filters.date = { $gte: from }
  // with_deleted=1 also returns archived slots, so a booking whose slot was
  // removed still shows its date in the «Κρατήσεις» tab.
  const slots = await bookings.listAvailabilitySlots(filters, {
    take: 2000,
    order: { date: "ASC", start_time: "ASC" },
    ...((req.query as Record<string, string | undefined>).with_deleted ? { withDeleted: true } : {}),
  })
  res.json({ slots })
}

/** POST /admin/activities/:id/slots — create a single slot. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const body = req.body as any
  const created = await bookings.createAvailabilitySlots({
    activity_id: req.params.id,
    date: body.date,
    start_time: body.start_time,
    end_time: body.end_time ?? null,
    capacity: Number(body.capacity) || 0,
    status: body.status ?? "open",
  })
  const slot = Array.isArray(created) ? created[0] : created
  res.status(201).json({ slot })
}
