import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * One-off copy fix for the English workshop translations.
 *
 * Two kinds of problem:
 *   - a mistranslated season: `keraloifes` runs in October and reads
 *     «Φθινόπωρο» in Greek, but its English said "Winter";
 *   - Greek-shaped English: "at our apiary", "our little friends" (ambiguous
 *     between children and bees), "takes home for free the salve", "learning at
 *     the same time", and the ¾ fraction in the duration.
 *
 * Greek fields are untouched. Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-workshop-copy.ts
 */

const REPLACEMENTS: [string, string][] = [
  // season — October is autumn, and the Greek already said so
  ['"season_label":"Winter"', '"season_label":"Autumn"'],
  // preposition + ambiguous "little friends"
  ["at our apiary for", "to our apiary for"],
  ["our little friends", "the little ones"],
  // "for free" in the wrong position
  [
    "takes home **for free** the Easter candle they created, ready for Easter!",
    "takes home the Easter candle they made, **free of charge** — ready for Easter!",
  ],
  [
    "takes home **for free** the beeswax wrap they created, ready to use!",
    "takes home the beeswax wrap they made, **free of charge** — ready to use!",
  ],
  [
    "takes home **for free** the little pot they planted and decorated,",
    "takes home the little pot they planted and decorated, **free of charge**,",
  ],
  [
    "takes home **for free** the plaster creation they painted,",
    "takes home the plaster creation they painted, **free of charge**,",
  ],
  [
    "takes home **for free** the salve they created,",
    "takes home the salve they made, **free of charge**,",
  ],
  [
    "takes home **for free** the truffles they made,",
    "takes home the truffles they made, **free of charge**,",
  ],
  // word order
  [
    "each participant will create their own **natural beeswax salve**, learning at the same time more about",
    "each participant makes their own **natural beeswax salve**, while learning more about",
  ],
  ["learning at the same time", "while learning"],
  // the material is beeswax foundation, not "honeycomb sheets"
  ["from honeycomb sheets", "from sheets of beeswax foundation"],
  ["honeycomb sheets", "sheets of beeswax foundation"],
  // the ¾ fraction is not used this way in English
  ["1¾–3 hours (per programme)", "1 hr 45 min – 3 hrs, depending on the programme"],
]

function retarget(value: string): string {
  return REPLACEMENTS.reduce((out, [from, to]) => out.split(from).join(to), value)
}

export default async function fixWorkshopCopy({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  const workshops = await bookings.listWorkshops({})
  let changed = 0
  for (const w of workshops) {
    const translations = (w as { translations?: unknown }).translations
    if (!translations) continue
    const before = JSON.stringify(translations)
    const after = retarget(before)
    if (after === before) continue

    await bookings.updateWorkshops({ id: w.id, translations: JSON.parse(after) })
    changed++
    logger.info(`workshop ${w.slug}: copy fixed`)
  }

  logger.info(`✓ Workshop copy fixed — records updated: ${changed}`)
}
