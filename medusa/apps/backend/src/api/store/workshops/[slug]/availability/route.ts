import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../../modules/bookings"
import type BookingsModuleService from "../../../../../modules/bookings/service"

/**
 * GET /store/workshops/:slug/availability?from=YYYY-MM-DD&to=YYYY-MM-DD&include_full=true
 * Open slots (with remaining capacity) for a workshop over a date range. Mirrors
 * the activity availability route but filters by `workshop_id`. Dates are text
 * so lexicographic comparison is chronological; full slots are excluded unless
 * `include_full=true`.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const slug = req.params.slug
  const { from, to, include_full } = req.query as Record<string, string | undefined>
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  const [workshop] = await bookings.listWorkshops({ slug, status: "published" })
  if (!workshop) {
    return res.status(404).json({ message: "Workshop not found" })
  }

  const filters: Record<string, unknown> = { workshop_id: workshop.id, status: "open" }
  if (from && to) filters.date = { $gte: from, $lte: to }
  else if (from) filters.date = { $gte: from }
  else if (to) filters.date = { $lte: to }

  const slots = await bookings.listAvailabilitySlots(filters, {
    take: 2000,
    order: { date: "ASC", start_time: "ASC" },
  })

  const result = slots
    .map((s: any) => ({
      id: s.id,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      capacity: s.capacity,
      remaining: Math.max(0, s.capacity - s.booked_count),
      // Which experience combo this session is for ("half" / "full").
      combo_key: s.combo_key ?? null,
    }))
    .filter((s) => (include_full === "true" ? true : s.remaining > 0))

  res.json({ slots: result, currency: (workshop as any).currency ?? "eur" })
}
