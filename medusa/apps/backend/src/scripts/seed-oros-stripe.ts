import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * GO-LIVE STEP — attach the Stripe payment provider to the EUR region.
 *
 * Stripe only registers when STRIPE_API_KEY is set (see medusa-config.ts). This
 * script is a no-op until then: it looks for a registered provider whose id
 * starts with "pp_stripe" and, if found, adds it to the Europe/EUR region's
 * payment_providers (keeping pp_system_default). Fully idempotent.
 *
 *   npx medusa exec ./src/scripts/seed-oros-stripe.ts
 *
 * Run it against BOTH local and prod DBs after setting the keys + redeploying.
 * (Alternative: enable Stripe from the admin → Settings → Regions.)
 */
export default async function seedOrosStripe({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const payment = container.resolve(Modules.PAYMENT)

  // 1. Is a Stripe provider actually registered? (only when STRIPE_API_KEY is set)
  const providers = await payment.listPaymentProviders({}, { take: 100 })
  const stripe = providers.find((p) => p.id.startsWith("pp_stripe"))
  if (!stripe) {
    logger.warn(
      "Stripe is not registered — set STRIPE_API_KEY (and STRIPE_WEBHOOK_SECRET) " +
        "and redeploy, then re-run this script. No changes made.",
    )
    return
  }
  logger.info(`Found Stripe provider: ${stripe.id}`)

  // 2. Find the EUR region + its current payment providers
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "payment_providers.id"],
  })
  const region = regions.find((r) => r.currency_code === "eur") ?? regions[0]
  if (!region) {
    throw new Error("No region found — run the initial seed first.")
  }
  const current = (region.payment_providers ?? []).map((p: { id: string }) => p.id)

  // 3. Idempotent attach (payment_providers on update replaces the set → send the union)
  if (current.includes(stripe.id)) {
    logger.info(`${region.name}: Stripe already enabled. Nothing to do.`)
    return
  }
  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: region.id },
      update: { payment_providers: [...current, stripe.id] },
    },
  })
  logger.info(`✓ Enabled ${stripe.id} on region "${region.name}" (kept: ${current.join(", ")}).`)
}
