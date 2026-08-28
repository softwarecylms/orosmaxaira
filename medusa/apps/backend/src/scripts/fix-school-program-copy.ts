import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * One-off copy fix for the school-programme English translations.
 *
 * "Escort" reads as a sexual euphemism in English — the Greek source says
 * «συνοδοί», so the price table now says "Teachers & accompanying adults",
 * matching the wording already used in the supervision note.
 *
 * backfill-translations.ts cannot do this: it only fills MISSING keys, so an
 * already-populated `pricing` array is never rewritten. Idempotent — re-run any
 * time.
 *   npx medusa exec ./src/scripts/fix-school-program-copy.ts
 */

const REPLACEMENTS: [string, string][] = [
  ["Teachers & escorts", "Teachers & accompanying adults"],
]

function retarget(value: string): string {
  return REPLACEMENTS.reduce((out, [from, to]) => out.split(from).join(to), value)
}

export default async function fixSchoolProgramCopy({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  const programs = await bookings.listSchoolPrograms({})
  let changed = 0
  for (const program of programs) {
    const translations = (program as { translations?: unknown }).translations
    if (!translations) continue
    const before = JSON.stringify(translations)
    const after = retarget(before)
    if (after === before) continue

    await bookings.updateSchoolPrograms({
      id: program.id,
      translations: JSON.parse(after),
    })
    changed++
    logger.info(`school program ${program.id}: copy fixed`)
  }

  logger.info(`✓ School-programme copy fixed — records updated: ${changed}`)
}
