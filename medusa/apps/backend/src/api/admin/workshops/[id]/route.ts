import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../modules/bookings"
import type BookingsModuleService from "../../../../modules/bookings/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const workshop = await bookings.retrieveWorkshop(req.params.id).catch(() => null)
  if (!workshop) return res.status(404).json({ message: "Workshop not found" })
  res.json({ workshop })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  await bookings.updateWorkshops({ id: req.params.id, ...(req.body as any) })
  const workshop = await bookings.retrieveWorkshop(req.params.id)
  res.json({ workshop })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  await bookings.deleteWorkshops(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
