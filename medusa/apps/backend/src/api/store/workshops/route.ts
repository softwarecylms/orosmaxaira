import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../modules/bookings"
import type BookingsModuleService from "../../../modules/bookings/service"

// Published workshops for the Εργαστήρια hub, ordered for display.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const workshops = await bookings.listWorkshops(
    { status: "published" },
    { take: 100, order: { rank: "ASC" } }
  )
  res.json({ workshops })
}
