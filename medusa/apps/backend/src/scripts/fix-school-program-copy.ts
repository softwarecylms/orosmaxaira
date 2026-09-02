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
  // English phrasing on the school-visits page
  [
    "Our apiary is open for visits by primary schools. We have shaped a programme that meets the educational needs of pupils, combining information, creativity and contact with nature.",
    "Our apiary is open to primary school groups. We have designed a programme that meets pupils’ educational needs, combining information, creativity and contact with nature.",
  ],
  [
    "rotate through the following three activities — every 45 minutes.",
    "rotate through the three activities below, changing every 45 minutes.",
  ],
  ["A visit to the bee-therapy house to get to know", "A visit to our apitherapy room to get to know"],
  [
    "A knowledge quiz with small gifts from our shop for the participants.",
    "A quiz, with a small gift from our shop for every participant.",
  ],
  ["Free Play in the Playground", "Free play"],
  [
    "The children will enjoy free play in the playground area, with time to rest and have a snack.",
    "Time in the playground to run around, rest and have a snack.",
  ],
  ["It is flexible depending on your arrival time", "The schedule is flexible, depending on your arrival time"],
  [
    "The children should bring their own snacks. Only honey and bee products are available at our premises.",
    "The children should bring their own snacks. The only food and drink available on site are our honey and bee products.",
  ],
  // liability: advice becomes a requirement, in both languages
  [
    "children or staff with a bee allergy are strongly advised not to take part in the visit.",
    "children or staff with a bee allergy must not take part in the visit.",
  ],
  [
    "παιδιά ή προσωπικό με αλλεργία στις μέλισσες συνιστάται έντονα να μην συμμετέχουν στην επίσκεψη.",
    "παιδιά ή προσωπικό με αλλεργία στις μέλισσες δεν πρέπει να συμμετέχουν στην επίσκεψη.",
  ],
  // Greek: title repeated inside its own description, and a dangling "It"
  ["Ελεύθερο Παιχνίδι στον Παιδότοπο", "Ελεύθερο παιχνίδι"],
  [
    "Τα παιδιά θα απολαύσουν ελεύθερο παιχνίδι στον χώρο της παιδικής χαράς, με χρόνο για ξεκούραση και σνακ.",
    "Χρόνος στον παιδότοπο για παιχνίδι, ξεκούραση και σνακ.",
  ],
  ["Είναι ευέλικτο ανάλογα με την ώρα άφιξής σας", "Το πρόγραμμα είναι ευέλικτο ανάλογα με την ώρα άφιξής σας"],
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

    // The Greek copy lives in the record’s own columns, not in `translations`.
    const greek = program as unknown as Record<string, unknown>
    const greekUpdate: Record<string, unknown> = {}
    for (const key of ["play_title", "play_text", "duration_text", "program_note"]) {
      const value = greek[key]
      if (typeof value !== "string") continue
      const next = retarget(value)
      if (next !== value) greekUpdate[key] = next
    }
    const allergy = greek.allergy_body
    if (Array.isArray(allergy)) {
      const next = allergy.map((p) => (typeof p === "string" ? retarget(p) : p))
      if (JSON.stringify(next) !== JSON.stringify(allergy)) greekUpdate.allergy_body = next
    }

    if (after === before && !Object.keys(greekUpdate).length) continue

    await bookings.updateSchoolPrograms({
      id: program.id,
      ...(after !== before ? { translations: JSON.parse(after) } : {}),
      ...greekUpdate,
    })
    changed++
    logger.info(`school program ${program.id}: copy fixed`)
  }

  logger.info(`✓ School-programme copy fixed — records updated: ${changed}`)
}
