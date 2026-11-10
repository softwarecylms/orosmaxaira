import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createCampaignsWorkflow, createPromotionsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * WELCOME10 — the code in the Klaviyo welcome email for new subscribers.
 *
 *   - 10% off the whole order (`target_type: "order"`, spread across the lines,
 *     exactly like BEE10 — so the checkout's own 10% matches Medusa's).
 *   - No minimum order: no rules at all, so every product and gift set counts.
 *   - Once per customer: a campaign budget of type `use_by_attribute` tracked
 *     by `customer_email`, limit 1. By email rather than customer id because
 *     most orders are guest checkouts; the storefront sets the cart email
 *     before it applies the code, which this budget requires.
 *   - Not with other offers: only one code fits the checkout, and the sale-price
 *     exclusion is enforced by the storefront (`noSaleItems` in
 *     src/lib/coupons.ts, checked in place-order.ts) — Medusa has no rule for it.
 *
 *   npx medusa exec ./src/scripts/create-welcome10.ts
 *
 * Run against local AND the Railway prod DB (see the deploy notes). Idempotent:
 * an existing code or campaign is left as it is and reported.
 */

const CODE = "WELCOME10"
const CAMPAIGN = "welcome-email"

export default async function createWelcome10({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const promotions = container.resolve(Modules.PROMOTION)

  const [existing] = await promotions.listPromotions(
    { code: [CODE] },
    { relations: ["application_method", "rules", "campaign", "campaign.budget"] },
  )
  if (existing) {
    const p: any = existing
    logger.info(
      `${CODE}: already exists — status ${p.status}, ${p.application_method?.value}% ` +
        `${p.application_method?.target_type}, rules ${p.rules?.length ?? 0}, ` +
        `budget ${p.campaign?.budget?.type ?? "none"}/${p.campaign?.budget?.attribute ?? "-"}/${p.campaign?.budget?.limit ?? "-"}`,
    )
    return
  }

  let [campaign] = await promotions.listCampaigns({ campaign_identifier: [CAMPAIGN] })
  if (!campaign) {
    const { result } = await createCampaignsWorkflow(container).run({
      input: {
        campaignsData: [
          {
            name: "Welcome email (Klaviyo)",
            campaign_identifier: CAMPAIGN,
            description: "WELCOME10 — one use per email address",
            budget: { type: "use_by_attribute", attribute: "customer_email", limit: 1 },
          },
        ],
      },
    })
    campaign = result[0]
    logger.info(`campaign ${CAMPAIGN}: created (once per customer_email)`)
  }

  await createPromotionsWorkflow(container).run({
    input: {
      promotionsData: [
        {
          code: CODE,
          type: "standard",
          status: "active",
          campaign_id: campaign.id,
          application_method: {
            type: "percentage",
            target_type: "order",
            allocation: "across",
            value: 10,
            currency_code: "eur",
          },
          rules: [],
        },
      ],
    },
  })
  logger.info(`${CODE}: created — 10% off any order, once per email`)
}
