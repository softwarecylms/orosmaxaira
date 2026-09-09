import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKINGS_MODULE } from "../../../../../modules/bookings"
import type BookingsModuleService from "../../../../../modules/bookings/service"

/** POST /admin/activities/:id/restore — bring an activity back from the trash. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  try {
    await bookings.restoreActivities(req.params.id)
  } catch (e: any) {
    // The unique index on `slug` covers live rows only, so trashing an activity
    // frees its permalink — and a new one may since have claimed it. Restoring
    // would then put two live rows on the same slug, which the index rejects.
    if (/unique|duplicate/i.test(String(e?.message ?? e))) {
      return res.status(409).json({
        message:
          "Το permalink χρησιμοποιείται ήδη από άλλη δραστηριότητα. Αλλάξτε το εκεί και δοκιμάστε ξανά.",
      })
    }
    throw e
  }

  const activity = await bookings.retrieveActivity(req.params.id)
  res.json({ activity })
}
