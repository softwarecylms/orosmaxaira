import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../../modules/bookings"
import type BookingsModuleService from "../../../../../modules/bookings/service"

/**
 * GET /store/activities/:slug/availability?from=YYYY-MM-DD&to=YYYY-MM-DD&include_full=true
 * Returns open slots (with remaining capacity) for a date range. Dates are text
 * (`YYYY-MM-DD`) so lexicographic comparison is chronological. Full slots are
 * excluded unless `include_full=true`.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const slug = req.params.slug
  const { from, to, include_full } = req.query as Record<string, string | undefined>
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  const [activity] = await bookings.listActivities({ slug, status: "published" })
  if (!activity) {
    return res.status(404).json({ message: "Activity not found" })
  }

  const filters: Record<string, unknown> = { activity_id: activity.id, status: "open" }
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
    }))
    .filter((s) => (include_full === "true" ? true : s.remaining > 0))

  res.json({ slots: result, currency: activity.currency ?? "eur" })
}
