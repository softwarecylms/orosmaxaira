import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../modules/bookings"
import type BookingsModuleService from "../../../modules/bookings/service"

/** GET /admin/bookings?activity_id= — list bookings (newest first). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const { activity_id } = req.query as Record<string, string | undefined>
  const filters: Record<string, unknown> = {}
  if (activity_id) filters.activity_id = activity_id
  const list = await bookings.listBookings(filters, {
    take: 500,
    order: { created_at: "DESC" },
  })
  res.json({ bookings: list })
}
