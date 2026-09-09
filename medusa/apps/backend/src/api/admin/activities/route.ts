import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../modules/bookings"
import type BookingsModuleService from "../../../modules/bookings/service"

/**
 * GET /admin/activities — list all activities.
 * `?deleted=1` lists the trash instead (soft-deleted rows only).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const trashed = req.query.deleted === "1"

  const activities = await bookings.listActivities(
    {},
    // `withDeleted` widens the result to include soft-deleted rows rather than
    // replacing it, so the trash view still has to filter on `deleted_at`.
    { take: 200, order: { title: "ASC" }, withDeleted: trashed },
  )

  res.json({
    activities: trashed ? activities.filter((a: any) => a.deleted_at) : activities,
  })
}

/** POST /admin/activities — create an activity. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const created = await bookings.createActivities(req.body as any)
  const activity = Array.isArray(created) ? created[0] : created
  res.status(201).json({ activity })
}
