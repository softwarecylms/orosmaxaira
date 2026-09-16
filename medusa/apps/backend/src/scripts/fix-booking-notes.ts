import type { ExecArgs } from "@medusajs/framework/types"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Booking confirmation notes + the Full-programme option on «Περιπέτειες στις
 * Κυψέλες» (2026-09-16).
 *
 *   npx medusa exec ./src/scripts/fix-booking-notes.ts          # fills blanks only
 *   npx medusa exec ./src/scripts/fix-booking-notes.ts force    # overwrites
 *
 * - Περιπέτειες στις Κυψέλες, and every workshop's «Πλήρες πρόγραμμα» (which
 *   includes it): arrive 5 minutes early + closed shoes and socks.
 * - Γνωρίζω τη Μέλισσα, Μελισσοθεραπεία, and every other workshop combo:
 *   arrive 5 minutes early.
 * - Περιπέτειες στις Κυψέλες is also bookable as the "full" workshop combo.
 *
 * Without `force` a note that is already set (e.g. edited in the admin) is kept.
 * Everything here stays editable in the Medusa admin afterwards.
 */

const HIVES = {
  el: "Παρακαλούμε όπως βρίσκεστε στον χώρο 5 λεπτά πριν από την έναρξη της δραστηριότητας. Για τη συμμετοχή σας απαιτούνται κλειστά παπούτσια και κάλτσες.",
  en: "Please arrive 5 minutes before the activity starts. Closed shoes and socks are required to take part.",
}
const EARLY = {
  el: "Παρακαλούμε όπως βρίσκεστε στον χώρο 5 λεπτά πριν από την έναρξη.",
  en: "Please arrive 5 minutes before the start.",
}

const ACTIVITY_NOTES: Record<string, typeof EARLY> = {
  "peripeteies-stis-kypseles": HIVES,
  xenagiseis: EARLY,
  melissotherapeia: EARLY,
}
const HIVES_SLUG = "peripeteies-stis-kypseles"
const FULL_COMBO = "full"

export default async function fixBookingNotes({ container, args }: ExecArgs) {
  const logger = container.resolve("logger")
  const bookings = container.resolve(BOOKINGS_MODULE) as BookingsModuleService
  const force = (args ?? []).includes("force")
  const fill = (current: unknown, next: string) =>
    force || !(typeof current === "string" && current.trim()) ? next : (current as string)

  for (const [slug, note] of Object.entries(ACTIVITY_NOTES)) {
    const [a] = (await bookings.listActivities({ slug })) as any[]
    if (!a) {
      logger.warn(`Activity ${slug} not found — skipped`)
      continue
    }
    const en = a.translations?.en ?? {}
    await bookings.updateActivities({
      id: a.id,
      confirmation_note: fill(a.confirmation_note, note.el),
      translations: {
        ...(a.translations ?? {}),
        en: { ...en, confirmation_note: fill(en.confirmation_note, note.en) },
      },
      ...(slug === HIVES_SLUG && !a.combo_program_key ? { combo_program_key: FULL_COMBO } : {}),
    } as any)
    logger.info(`Activity ${slug}: confirmation note set`)
  }

  const workshops = (await bookings.listWorkshops({}, { take: 100 })) as any[]
  for (const w of workshops) {
    const tiers = Array.isArray(w.price_tiers) ? w.price_tiers : []
    if (!tiers.length) continue
    const en = w.translations?.en ?? {}
    const labels = { ...(en.combo_labels ?? {}) }
    const nextTiers = tiers.map((t: any) => {
      const note = t.key === FULL_COMBO ? HIVES : EARLY
      labels[t.key] = {
        ...(labels[t.key] ?? {}),
        confirmation_note: fill(labels[t.key]?.confirmation_note, note.en),
      }
      return { ...t, confirmation_note: fill(t.confirmation_note, note.el) }
    })
    await bookings.updateWorkshops({
      id: w.id,
      price_tiers: nextTiers,
      translations: { ...(w.translations ?? {}), en: { ...en, combo_labels: labels } },
    } as any)
    logger.info(`Workshop ${w.slug}: ${nextTiers.length} combo notes set`)
  }

  logger.info("Booking notes done.")
}
