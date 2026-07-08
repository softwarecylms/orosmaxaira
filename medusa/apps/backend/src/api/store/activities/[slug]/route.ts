import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../modules/bookings"
import type BookingsModuleService from "../../../../modules/bookings/service"

/**
 * GET /store/activities/:slug
 * Returns the published activity content for the storefront detail page.
 * (Availability is a separate, always-fresh endpoint — see ./availability.)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const slug = req.params.slug
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  const [activity] = await bookings.listActivities({ slug, status: "published" })
  if (!activity) {
    return res.status(404).json({ message: "Activity not found" })
  }

  res.json({ activity })
}
