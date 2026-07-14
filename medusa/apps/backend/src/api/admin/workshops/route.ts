import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../modules/bookings"
import type BookingsModuleService from "../../../modules/bookings/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const workshops = await bookings.listWorkshops({}, { take: 200, order: { rank: "ASC" } })
  res.json({ workshops })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const created = await bookings.createWorkshops(req.body as any)
  const workshop = Array.isArray(created) ? created[0] : created
  res.status(201).json({ workshop })
}
