import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * One-off rename of the English activity name.
 *
 * "Adventures in the Beehives" reads as though visitors climb inside a hive;
 * the activity is now "Adventures at the Hives" in English. The Greek name
 * («Περιπέτειες στις Κυψέλες») and every slug are unchanged, so no links break.
 *
 * The name is referenced by the activity itself and by the workshops that pair
 * with it, so both are rewritten. Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-activity-name.ts
 */

const REPLACEMENTS: [string, string][] = [
  ["Adventures in the Beehives", "Adventures at the Hives"],
  ["Adventures in the beehives", "Adventures at the hives"],
  ["Adventures in the Hives", "Adventures at the Hives"],
  ["Adventures in the hives", "Adventures at the hives"],
]

function rename(value: string): string {
  return REPLACEMENTS.reduce((out, [from, to]) => out.split(from).join(to), value)
}

export default async function fixActivityName({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  let changed = 0

  const activities = await bookings.listActivities({})
  for (const a of activities) {
    const translations = (a as { translations?: unknown }).translations
    if (!translations) continue
    const before = JSON.stringify(translations)
    const after = rename(before)
    if (after === before) continue
    await bookings.updateActivities({ id: a.id, translations: JSON.parse(after) })
    changed++
    logger.info(`activity ${a.slug}: renamed`)
  }

  const workshops = await bookings.listWorkshops({})
  for (const w of workshops) {
    const translations = (w as { translations?: unknown }).translations
    if (!translations) continue
    const before = JSON.stringify(translations)
    const after = rename(before)
    if (after === before) continue
    await bookings.updateWorkshops({ id: w.id, translations: JSON.parse(after) })
    changed++
    logger.info(`workshop ${w.slug}: renamed`)
  }

  logger.info(`✓ Activity renamed in English copy — records updated: ${changed}`)
}
