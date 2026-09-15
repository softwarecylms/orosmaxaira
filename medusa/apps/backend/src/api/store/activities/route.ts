import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../modules/bookings"
import type BookingsModuleService from "../../../modules/bookings/service"

/**
 * GET /store/activities
 * The published activities' slugs and last-change dates — what the storefront
 * sitemap needs so an activity created in the admin is listed without a code
 * change. Full content stays on GET /store/activities/:slug.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const activities = await bookings.listActivities(
    { status: "published" },
    { take: 100, select: ["slug", "updated_at"] }
  )
  res.json({ activities })
}
