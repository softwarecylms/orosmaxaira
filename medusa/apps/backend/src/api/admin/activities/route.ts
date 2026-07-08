import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../modules/bookings"
import type BookingsModuleService from "../../../modules/bookings/service"

/** GET /admin/activities — list all activities. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const activities = await bookings.listActivities(
    {},
    { take: 200, order: { title: "ASC" } },
  )
  res.json({ activities })
}

/** POST /admin/activities — create an activity. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const created = await bookings.createActivities(req.body as any)
  const activity = Array.isArray(created) ? created[0] : created
  res.status(201).json({ activity })
}
