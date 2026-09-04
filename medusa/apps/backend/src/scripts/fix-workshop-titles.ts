import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Two workshop names were descriptions rather than titles — weak as product
 * names on the hub cards, the detail H1 and in search results.
 *
 *   Φύτευση σπόρων σε γλαστράκια & διακόσμηση → Φύτεψε & Ζωγράφισε το Γλαστράκι σου
 *   Planting Seeds in Pots & Decorating       → Plant & Paint Your Own Pot
 *   Εργαστήρι Μαγειρικής για Τρουφάκια        → Εργαστήρι Μαγειρικής για Τρουφάκια Μελιού
 *   Cooking Workshop for Honey Truffles       → Honey Truffle Cooking Workshop
 *
 * The names below are ASSIGNED, not phrase-replaced: each new name contains the
 * old one as a substring, so a replace would re-fire on itself. Assigning makes
 * the script idempotent whatever the row currently holds — and safe to run on a
 * DB that is one rename behind. A re-seed would also rename these, but it
 * re-syncs availability and clobbers admin edits; this only touches the names.
 *
 *   npx medusa exec ./src/scripts/fix-workshop-titles.ts
 *
 * Run against local AND the Railway prod DB (see the deploy notes).
 */

type Rename = {
  title: string
  meta_title: string
  en: { title: string; meta_title: string }
}

const RENAMES: Record<string, Rename> = {
  "fytefsi-sporon": {
    title: "Φύτεψε & Ζωγράφισε το Γλαστράκι σου",
    meta_title: "Φύτεψε & Ζωγράφισε το Γλαστράκι σου — Εργαστήρι | Όρος Μαχαιρά",
    en: {
      title: "Plant & Paint Your Own Pot",
      meta_title: "Plant & Paint Your Own Pot — Hands-on Workshop | Oros Machaira",
    },
  },
  "ergastiria-mageirikis": {
    title: "Εργαστήρι Μαγειρικής για Τρουφάκια Μελιού",
    meta_title: "Εργαστήρι Μαγειρικής για Τρουφάκια Μελιού | Όρος Μαχαιρά",
    en: {
      title: "Honey Truffle Cooking Workshop",
      meta_title: "Honey Truffle Cooking Workshop — Hands-on Workshop | Oros Machaira",
    },
  },
}

export default async function fixWorkshopTitles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  const workshops = (await bookings.listWorkshops({})).filter(
    (w: { slug?: string }) => !!w.slug && w.slug in RENAMES
  )

  let changed = 0
  for (const workshop of workshops) {
    const target = RENAMES[workshop.slug as string]
    const update: Record<string, unknown> = {}

    if (workshop.title !== target.title) update.title = target.title
    if (workshop.meta_title !== target.meta_title) update.meta_title = target.meta_title

    // Keep the EN overlay in step — everything else in `translations.en` stays.
    const translations = ((workshop as { translations?: Record<string, any> }).translations ??
      {}) as Record<string, any>
    const en = translations.en ?? {}
    if (en.title !== target.en.title || en.meta_title !== target.en.meta_title) {
      update.translations = { ...translations, en: { ...en, ...target.en } }
    }

    if (!Object.keys(update).length) continue
    await bookings.updateWorkshops({ id: workshop.id, ...update })
    changed++
    logger.info(`workshop ${workshop.slug}: renamed (${Object.keys(update).join(", ")})`)
  }

  logger.info(`✓ Workshop titles fixed — records updated: ${changed}`)
}
