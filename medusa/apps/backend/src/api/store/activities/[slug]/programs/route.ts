import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../../modules/bookings"
import type BookingsModuleService from "../../../../../modules/bookings/service"

/**
 * GET /store/activities/:slug/programs?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * The combined programmes an activity can also be booked as. An activity with
 * `combo_program_key` (e.g. Περιπέτειες στις Κυψέλες → "full") is part of that
 * combo on every seasonal workshop, so this returns each published, open
 * workshop that prices the combo and has open slots for it in the range — i.e.
 * «Πλήρες πρόγραμμα» with September's, October's and November's εργαστήρι.
 *
 * Nothing is duplicated: dates, times, capacity and prices stay on the workshop
 * (Medusa admin → Εργαστήρια), and the booking itself goes through
 * POST /store/workshops/:slug/bookings.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { from, to } = req.query as Record<string, string | undefined>
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  const [activity] = await bookings.listActivities({ slug: req.params.slug, status: "published" })
  if (!activity) return res.status(404).json({ message: "Activity not found" })

  const comboKey = ((activity as any).combo_program_key ?? "").trim()
  if (!comboKey) return res.json({ programs: [] })

  const workshops = (await bookings.listWorkshops(
    { status: "published", booking_closed: false },
    { order: { rank: "ASC" }, take: 100 },
  )) as any[]

  const programs: unknown[] = []
  for (const w of workshops) {
    const tier = (Array.isArray(w.price_tiers) ? w.price_tiers : []).find(
      (t: { key?: string }) => t.key === comboKey,
    )
    if (!tier) continue

    const filters: Record<string, unknown> = {
      workshop_id: w.id,
      combo_key: comboKey,
      status: "open",
    }
    if (from && to) filters.date = { $gte: from, $lte: to }
    else if (from) filters.date = { $gte: from }
    else if (to) filters.date = { $lte: to }

    const slots = (
      (await bookings.listAvailabilitySlots(filters, {
        take: 2000,
        order: { date: "ASC", start_time: "ASC" },
      })) as any[]
    )
      .map((s) => ({
        id: s.id,
        date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
        capacity: s.capacity,
        remaining: Math.max(0, s.capacity - s.booked_count),
        combo_key: s.combo_key,
      }))
      .filter((s) => s.remaining > 0)
    if (!slots.length) continue

    programs.push({
      workshop: {
        slug: w.slug,
        title: w.title,
        months: w.months,
        currency: w.currency ?? "eur",
        translations: w.translations
          ? { en: { title: w.translations.en?.title, combo_labels: w.translations.en?.combo_labels } }
          : null,
      },
      tier,
      slots,
    })
  }

  res.json({ combo_key: comboKey, programs })
}
