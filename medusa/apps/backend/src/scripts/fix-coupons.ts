import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Bring the live discount codes in line with the current offer:
 *
 *   WELCOME5  → withdrawn
 *   MELI10    → withdrawn, replaced by BEE10
 *   BEE10     → 10% off, on orders of €150 or more
 *
 * `seed-oros-checkout.ts` skips any code that already exists, so it will never
 * retire or re-price one — hence this script. Withdrawn codes are set to
 * `inactive` rather than deleted: a code that stops working still has to be
 * recognisable on an old order, and Medusa keeps promotion rows referenced by
 * the adjustments it already wrote.
 *
 *   npx medusa exec ./src/scripts/fix-coupons.ts
 *
 * Run against local AND the Railway prod DB (see the deploy notes). Idempotent.
 */

const WITHDRAWN = ["WELCOME5", "MELI10"]

const NEW_CODE = "BEE10"
/** Minimum goods subtotal in euros — mirrors `src/lib/coupons.ts`. */
const MIN_ORDER_EUR = 150

export default async function fixCoupons({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const promotions = container.resolve(Modules.PROMOTION)

  const existing = await promotions.listPromotions(
    { code: [...WITHDRAWN, NEW_CODE] },
    { relations: ["application_method", "rules", "rules.values"] },
  )
  const byCode = new Map(existing.map((p: any) => [p.code, p]))

  // 1. Retire the old codes.
  for (const code of WITHDRAWN) {
    const promo: any = byCode.get(code)
    if (!promo) {
      logger.info(`${code}: not present — nothing to withdraw`)
      continue
    }
    if (promo.status === "inactive") {
      logger.info(`${code}: already inactive`)
      continue
    }
    await promotions.updatePromotions({ id: promo.id, status: "inactive" })
    logger.info(`${code}: withdrawn (status → inactive)`)
  }

  // 2. Create or correct BEE10.
  const bee: any = byCode.get(NEW_CODE)
  if (!bee) {
    await createPromotionsWorkflow(container).run({
      input: {
        promotionsData: [
          {
            code: NEW_CODE,
            type: "standard",
            status: "active",
            application_method: {
              type: "percentage",
              target_type: "order",
              allocation: "across",
              value: 10,
              currency_code: "eur",
            },
            rules: [
              {
                attribute: "item_subtotal",
                operator: "gte",
                values: [String(MIN_ORDER_EUR)],
              },
            ],
          },
        ],
      },
    })
    logger.info(`${NEW_CODE}: created — 10% off from €${MIN_ORDER_EUR}`)
  } else {
    if (bee.status !== "active") {
      await promotions.updatePromotions({ id: bee.id, status: "active" })
      logger.info(`${NEW_CODE}: re-activated`)
    }

    // Replace the minimum-order rule outright rather than editing it in place —
    // an older BEE10 may carry no rule at all, or one at a different threshold.
    const current = (bee.rules ?? []).filter(
      (r: any) => r.attribute === "item_subtotal",
    )
    const alreadyRight =
      current.length === 1 &&
      current[0].operator === "gte" &&
      (current[0].values ?? []).map((v: any) => String(v.value)).join() ===
        String(MIN_ORDER_EUR)

    if (alreadyRight) {
      logger.info(`${NEW_CODE}: minimum already €${MIN_ORDER_EUR}`)
    } else {
      if (current.length) {
        await promotions.removePromotionRules(
          bee.id,
          current.map((r: any) => r.id),
        )
      }
      await promotions.addPromotionRules(bee.id, [
        {
          attribute: "item_subtotal",
          operator: "gte",
          values: [String(MIN_ORDER_EUR)],
        },
      ])
      logger.info(`${NEW_CODE}: minimum set to €${MIN_ORDER_EUR}`)
    }
  }

  logger.info("✓ Coupons up to date.")
}
