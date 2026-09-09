import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../modules/bookings"
import type BookingsModuleService from "../../../../modules/bookings/service"

/** GET /admin/activities/:id */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const activity = await bookings.retrieveActivity(req.params.id).catch(() => null)
  if (!activity) return res.status(404).json({ message: "Activity not found" })
  res.json({ activity })
}

/** POST /admin/activities/:id — update an activity. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  await bookings.updateActivities({ id: req.params.id, ...(req.body as any) })
  const activity = await bookings.retrieveActivity(req.params.id)
  res.json({ activity })
}

/**
 * DELETE /admin/activities/:id — move the activity to the trash.
 *
 * A soft delete: the row keeps its slots and bookings but drops out of every
 * `listActivities` call, so it vanishes from the admin list *and* from the
 * storefront (both store routes list rather than retrieve). `POST ./restore`
 * brings it back whole.
 *
 * `?permanent=1` deletes it for good — offered only from the trash view.
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const permanent = req.query.permanent === "1"

  if (permanent) {
    await bookings.deleteActivities(req.params.id)
  } else {
    await bookings.softDeleteActivities(req.params.id)
  }

  res.json({ id: req.params.id, deleted: true, permanent })
}
