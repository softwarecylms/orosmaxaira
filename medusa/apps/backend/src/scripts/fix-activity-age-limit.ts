import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Liability fix for «Περιπέτειες στις Κυψέλες»: the activity opens a live hive,
 * so "no age limit" / "there is no limit" is replaced by a **minimum age of 2**
 * with an explicit parent/guardian accompaniment requirement.
 *
 * Rewrites the Greek base record AND the `translations.en` overlay in place —
 * seed-activities.ts skips existing rows and backfill-translations.ts only fills
 * MISSING keys, so neither would touch already-populated copy. Idempotent.
 *
 *   npx medusa exec ./src/scripts/fix-activity-age-limit.ts
 *
 * Run against local AND the Railway prod DB (see the deploy notes).
 */

const REPLACEMENTS: [string, string][] = [
  // ── Greek base record ─────────────────────────────────────────────────────
  [
    "**Ηλικίες:** δεν υπάρχει κάποιο όριο — η δραστηριότητα είναι κατάλληλη για όλη την οικογένεια. Παρέχονται στολές",
    "**Ηλικίες:** από 2 ετών και άνω. Οι ανήλικοι συμμετέχουν αποκλειστικά με συνοδεία γονέα ή κηδεμόνα, ο οποίος παραμένει μαζί τους σε όλη τη διάρκεια. Παρέχονται στολές",
  ],
  ["Χωρίς όριο ηλικίας", "Από 2 ετών, με συνοδεία γονέα"],
  [
    "μια βιωματική εμπειρία για μικρούς και μεγάλους.",
    "μια βιωματική εμπειρία για παιδιά από 2 ετών και ενήλικες.",
  ],
  [
    "Μια βιωματική εμπειρία για μικρούς και μεγάλους — σε συνδυασμό",
    "Μια βιωματική εμπειρία για παιδιά από 2 ετών και ενήλικες — σε συνδυασμό",
  ],
  ["Για μικρούς & μεγάλους", "Από 2 ετών & άνω"],
  // The free tier can no longer start at 0 — there is a 2-year minimum.
  ["Βρέφη & Νήπια (0–3 ετών)", "Νήπια (2–3 ετών)"],
  [
    "Μια ασφαλής, καθοδηγούμενη εμπειρία, κατάλληλη τόσο για παιδιά όσο και για ενήλικες.",
    "Μια ασφαλής, καθοδηγούμενη εμπειρία για παιδιά από 2 ετών και ενήλικες — οι ανήλικοι πάντα με συνοδεία γονέα ή κηδεμόνα.",
  ],
  // ── English overlay ───────────────────────────────────────────────────────
  [
    "**Ages:** there is no limit — the activity is suitable for the whole family. Beekeeper suits",
    "**Ages:** from 2 years and up. Under-18s take part only when accompanied by a parent or guardian, who stays with them throughout. Beekeeper suits",
  ],
  ["No age limit", "Ages 2+, with a parent"],
  [
    "a hands-on experience for all ages.",
    "a hands-on experience for ages 2 and up.",
  ],
  [
    "A hands-on experience for all ages — combined with",
    "A hands-on experience for ages 2 and up — combined with",
  ],
  ["All ages welcome", "Ages 2 and up"],
  ["Under 4", "Ages 2–3"],
  [
    "A safe, guided experience, suitable for children and adults alike.",
    "A safe, guided experience for children from age 2 and adults — under-18s always accompanied by a parent or guardian.",
  ],
]

/** Fields on the base (Greek) record that carry the copy above. */
const TEXT_FIELDS = [
  "subtitle",
  "description",
  "details",
  "note",
  "age_label",
  "meta_description",
] as const

function retarget(value: string): string {
  return REPLACEMENTS.reduce((out, [from, to]) => out.split(from).join(to), value)
}

export default async function fixActivityAgeLimit({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  // Only the hive-opening activity — the glass-hive tour and apitherapy keep
  // their "για όλες τις ηλικίες" wording.
  const activities = (await bookings.listActivities({})).filter(
    (a: { slug?: string }) => a.slug === "peripeteies-stis-kypseles"
  )

  let changed = 0
  for (const activity of activities) {
    const update: Record<string, unknown> = {}

    for (const field of TEXT_FIELDS) {
      const value = (activity as Record<string, unknown>)[field]
      if (typeof value !== "string") continue
      const next = retarget(value)
      if (next !== value) update[field] = next
    }

    // `features` / `price_tiers` (and the EN overlay) round-trip through their
    // serialised form — labels only, prices and tier keys are untouched.
    for (const field of ["features", "price_tiers", "translations"] as const) {
      const value = (activity as Record<string, unknown>)[field]
      if (!value) continue
      const before = JSON.stringify(value)
      const after = retarget(before)
      if (after !== before) update[field] = JSON.parse(after)
    }

    if (!Object.keys(update).length) continue
    await bookings.updateActivities({ id: activity.id, ...update })
    changed++
    logger.info(
      `activity ${activity.slug}: age limit applied (${Object.keys(update).join(", ")})`
    )
  }

  logger.info(`✓ Age limit (2+, parent accompanied) applied — records updated: ${changed}`)
}
