import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../modules/bookings"
import type BookingsModuleService from "../../../../modules/bookings/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const slug = req.params.slug
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const [workshop] = await bookings.listWorkshops({ slug, status: "published" })
  if (!workshop) return res.status(404).json({ message: "Workshop not found" })
  res.json({ workshop })
}
