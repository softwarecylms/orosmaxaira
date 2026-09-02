import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * One-off copy fix for the English activity translations.
 *
 * "for young and old" appeared on four-plus pages; the English copy now varies
 * the phrasing, and the activity records need to match the storefront strings
 * in src/lib/medusa/activities-en.ts.
 *
 * backfill-translations.ts cannot do this — it only fills MISSING keys, so an
 * already-populated `subtitle` is never rewritten. Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-activity-copy.ts
 */

const REPLACEMENTS: [string, string][] = [
  ["a hands-on experience for young and old.", "a hands-on experience for all ages."],
  ["A hands-on experience for young and old", "A hands-on experience for all ages"],
  // "Getting to Know the Bee" English copy
  [
    "For those who appreciate **knowledge through experience**, we created a space where visitors learn what apitherapy is",
    "For anyone who likes to **learn by doing**, we have created a space where visitors discover what apitherapy is",
  ],
  ["play an interactive question game", "take part in an interactive quiz"],
  [
    "other products made from honey such as mead, honeycomb and the blend of honey-and-nut spreads.",
    "other products from the hive, such as mead, honeycomb and our honey-and-nut spreads.",
  ],
  // a 12-year-old is not an "adult"
  ["Adults (12+)", "Ages 12+"],
  ["Children (4–11)", "Ages 4–11"],
  ["Infants & Toddlers (0–3)", "Under 4"],
  // the header chip already states the age range
  [
    "**Ages:** suitable for the whole family — from young children to adults. No beekeeper suit is needed; the bees are observed safely through glass hives.",
    "**Good to know:** no beekeeper suit is needed — the bees are observed safely through glass hives.",
  ],
  // "Adventures at the Hives" English copy
  ["Dress as beekeepers", "Suit up"],
  ["dress as beekeepers", "suit up"],
  ["when we open their hive", "when we open the hive"],
  ["For young & old", "All ages welcome"],
  // all the constraints in one block instead of two
  [
    "\\n\\nThe experience takes place only at weekends and booking in advance through the website is essential.",
    "",
  ],
  [
    "The experience is offered only in combination with the “Getting to Know the Bee” programme or one of the workshops, at weekends from July to November. It does not take place in winter, as the bees get cold and become aggressive when we open the hive.",
    "The experience runs at weekends from July to November, and only in combination with the “Getting to Know the Bee” programme or one of the workshops — please book in advance through the website. It does not run in winter, as the bees get cold and become aggressive when we open the hive.",
  ],
  // Bee Therapy page: apitherapy terminology, overclaims and Greek-shaped English
  [
    "Bee therapy was first discovered and applied by the ancient Egyptians. It is an extensive therapeutic practice that belongs to alternative medicine and uses the products of the hive (honey, royal jelly, pollen, bee venom, propolis) in a variety of therapeutic applications.",
    "Apitherapy has been practised since antiquity — the ancient Egyptians are among the earliest known users. It is a wide-ranging complementary therapy that uses the products of the hive (honey, royal jelly, pollen, bee venom, propolis) in a variety of applications.",
  ],
  [
    "In a natural way, bee therapy helps us overcome many health problems and is excellent for children, athletes and the elderly alike.",
    "Apitherapy is used as a natural complement to conventional care and is suitable for children, athletes and older adults alike.",
  ],
  [
    "Inhaling the warm air of the hive through a special breathing mask, substances with strong therapeutic action are introduced into the body, which are extremely beneficial to the human psychosomatic state.",
    "When you inhale the warm hive air through a special mask, you take in compounds that are beneficial for overall physical and mental wellbeing.",
  ],
  [
    "The air inside the hive, impregnated with essential aromas,",
    "The air inside the hive, rich in natural aromatic compounds,",
  ],
  [
    "A therapeutic practice of alternative medicine, using the precious products of the hive.",
    "A complementary therapy using the precious products of the hive.",
  ],
  [
    "a therapeutic practice of alternative medicine using the products of the hive",
    "a complementary therapy using the products of the hive",
  ],
  ["\"title\":\"Bee Therapy\"", "\"title\":\"Apitherapy (Bee Therapy)\""],
  ["Bee Therapy (Apitherapy) in Cyprus", "Apitherapy (Bee Therapy) in Cyprus"],
  ["Bee therapy at Oros Machaira:", "Apitherapy at Oros Machaira:"],
  [
    "Every 2nd day, for 3 weeks, 20 minutes per session.",
    "Every other day for three weeks, 20 minutes per session.",
  ],
]

function retarget(value: string): string {
  return REPLACEMENTS.reduce((out, [from, to]) => out.split(from).join(to), value)
}

export default async function fixActivityCopy({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  const activities = await bookings.listActivities({})
  let changed = 0
  for (const activity of activities) {
    const translations = (activity as { translations?: unknown }).translations
    if (!translations) continue
    const before = JSON.stringify(translations)
    const after = retarget(before)
    if (after === before) continue

    await bookings.updateActivities({ id: activity.id, translations: JSON.parse(after) })
    changed++
    logger.info(`activity ${activity.slug}: copy fixed`)
  }

  logger.info(`✓ Activity copy fixed — records updated: ${changed}`)
}
