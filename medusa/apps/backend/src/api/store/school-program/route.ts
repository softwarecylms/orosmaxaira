import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../modules/bookings"
import type BookingsModuleService from "../../../modules/bookings/service"

// The (singleton) published school-visits program.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const [program] = await bookings.listSchoolPrograms({ status: "published" }, { take: 1 })
  if (!program) return res.status(404).json({ message: "School program not found" })
  res.json({ program })
}
