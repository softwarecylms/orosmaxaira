import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../modules/bookings"
import type BookingsModuleService from "../../../modules/bookings/service"

// Singleton — GET returns the one program (or null); POST upserts it.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const [program] = await bookings.listSchoolPrograms({}, { take: 1 })
  res.json({ program: program ?? null })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const body = req.body as Record<string, unknown>
  const [existing] = await bookings.listSchoolPrograms({}, { take: 1 })
  if (existing) {
    await bookings.updateSchoolPrograms({ id: (existing as any).id, ...body })
    const [program] = await bookings.listSchoolPrograms({}, { take: 1 })
    return res.json({ program })
  }
  const created = await bookings.createSchoolPrograms({ slug: "default", ...body } as any)
  res.status(201).json({ program: Array.isArray(created) ? created[0] : created })
}
