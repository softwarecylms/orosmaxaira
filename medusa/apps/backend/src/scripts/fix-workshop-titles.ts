import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Two workshop names were descriptions rather than titles — weak as product
 * names on the hub cards, the detail H1 and in search results. Renamed in both
 * locales:
 *
 *   Φύτευση σπόρων σε γλαστράκια & διακόσμηση → Φύτεψε & Ζωγράφισε το Γλαστράκι σου
 *   Planting Seeds in Pots & Decorating       → Plant & Paint Your Own Pot
 *   Εργαστήρι Μαγειρικής για Τρουφάκια        → Τρουφάκια Μελιού
 *   Cooking Workshop for Honey Truffles       → Honey Truffle Cooking Workshop
 *
 * Rewrites the Greek base row AND the `translations.en` overlay. A re-seed would
 * also update titles, but it re-syncs availability and clobbers admin edits —
 * this only touches the names. Idempotent.
 *
 *   npx medusa exec ./src/scripts/fix-workshop-titles.ts
 *
 * Run against local AND the Railway prod DB (see the deploy notes).
 */

const REPLACEMENTS: [string, string][] = [
  // Greek base row (title + meta_title)
  ["Φύτευση σπόρων σε γλαστράκια & διακόσμηση", "Φύτεψε & Ζωγράφισε το Γλαστράκι σου"],
  ["Φύτευση σπόρων σε γλαστράκια — Εργαστήρι", "Φύτεψε & Ζωγράφισε το Γλαστράκι σου — Εργαστήρι"],
  ["Εργαστήρι Μαγειρικής — Τρουφάκια με μέλι", "Τρουφάκια Μελιού — Εργαστήρι Μαγειρικής"],
  ["Εργαστήρι Μαγειρικής για Τρουφάκια", "Τρουφάκια Μελιού"],
  // English overlay
  ["Planting Seeds in Pots & Decorating", "Plant & Paint Your Own Pot"],
  ["Cooking Workshop for Honey Truffles", "Honey Truffle Cooking Workshop"],
]

const SLUGS = ["fytefsi-sporon", "ergastiria-mageirikis"]

function retarget(value: string): string {
  return REPLACEMENTS.reduce((out, [from, to]) => out.split(from).join(to), value)
}

export default async function fixWorkshopTitles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  const workshops = (await bookings.listWorkshops({})).filter((w: { slug?: string }) =>
    SLUGS.includes(w.slug ?? "")
  )

  let changed = 0
  for (const workshop of workshops) {
    const update: Record<string, unknown> = {}

    for (const field of ["title", "meta_title"] as const) {
      const value = (workshop as Record<string, unknown>)[field]
      if (typeof value !== "string") continue
      const next = retarget(value)
      if (next !== value) update[field] = next
    }

    // The EN overlay round-trips through its serialised form.
    const translations = (workshop as { translations?: unknown }).translations
    if (translations) {
      const before = JSON.stringify(translations)
      const after = retarget(before)
      if (after !== before) update.translations = JSON.parse(after)
    }

    if (!Object.keys(update).length) continue
    await bookings.updateWorkshops({ id: workshop.id, ...update })
    changed++
    logger.info(`workshop ${workshop.slug}: renamed (${Object.keys(update).join(", ")})`)
  }

  logger.info(`✓ Workshop titles fixed — records updated: ${changed}`)
}
