import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * The school-visit page contradicted itself: the record's `max_students` is 50,
 * and the page says so twice ("Έως 50 μαθητές", "Μέγιστος αριθμός
 * συμμετεχόντων: 50 μαθητές"), but the middle price tier read "Από 26 έως 54
 * παιδιά" / "From 26 to 54 children" — implying bookings of up to 54.
 *
 * Aligns the tier label with the real cap, in both languages, and derives it
 * from `max_students` so the two can no longer drift apart.
 *
 * Idempotent.  npx medusa exec ./src/scripts/fix-school-max-students.ts
 */
export default async function fixSchoolMaxStudents({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  const programs = await bookings.listSchoolPrograms({})
  let changed = 0

  for (const p of programs as any[]) {
    const cap = Number(p.max_students)
    if (!Number.isFinite(cap) || cap <= 0) continue

    /** Rewrite "…έως <n> παιδιά" / "…to <n> children" to the real cap. */
    const retier = (tiers: unknown) =>
      Array.isArray(tiers)
        ? tiers.map((t: any) =>
            typeof t?.range === "string"
              ? {
                  ...t,
                  range: t.range
                    .replace(/(έως\s+)\d+(\s+παιδιά)/, `$1${cap}$2`)
                    .replace(/(to\s+)\d+(\s+children)/, `$1${cap}$2`),
                }
              : t,
          )
        : tiers

    const update: Record<string, unknown> = { id: p.id }
    let touched = false

    const nextPricing = retier(p.pricing)
    if (JSON.stringify(nextPricing) !== JSON.stringify(p.pricing)) {
      update.pricing = nextPricing
      touched = true
    }

    const translations = (p.translations ?? {}) as Record<string, any>
    if (translations.en?.pricing) {
      const nextEn = retier(translations.en.pricing)
      if (JSON.stringify(nextEn) !== JSON.stringify(translations.en.pricing)) {
        update.translations = {
          ...translations,
          en: { ...translations.en, pricing: nextEn },
        }
        touched = true
      }
    }

    if (!touched) continue
    await bookings.updateSchoolPrograms(update as any)
    changed++
    logger.info(`  price tiers capped at ${cap} → ${p.id}`)
  }

  logger.info(`✓ School price tiers aligned with max_students — records updated: ${changed}`)
}
