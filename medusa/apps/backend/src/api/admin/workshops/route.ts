import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../modules/bookings"
import type BookingsModuleService from "../../../modules/bookings/service"

/**
 * GET /admin/workshops — list all workshops.
 * `?deleted=1` lists the trash instead (soft-deleted rows only).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const trashed = req.query.deleted === "1"

  const workshops = await bookings.listWorkshops(
    {},
    // `withDeleted` widens the result to include soft-deleted rows rather than
    // replacing it, so the trash view still has to filter on `deleted_at`.
    { take: 200, order: { rank: "ASC" }, withDeleted: trashed },
  )

  res.json({
    workshops: trashed ? workshops.filter((w: any) => w.deleted_at) : workshops,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const created = await bookings.createWorkshops(req.body as any)
  const workshop = Array.isArray(created) ? created[0] : created
  res.status(201).json({ workshop })
}
