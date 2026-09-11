import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * GO-LIVE STEP — attach the Stripe payment provider to the EUR region.
 *
 * Stripe only registers when STRIPE_API_KEY is set (see medusa-config.ts). This
 * script is a no-op until then: it finds the Stripe CARD provider
 * (pp_stripe_stripe) and makes it the Europe/EUR region's only Stripe provider,
 * keeping pp_system_default. Fully idempotent.
 *
 * The Stripe module registers one provider per payment method
 * (pp_stripe-bancontact_stripe, pp_stripe-blik_stripe, …), and only the card
 * provider has "_" right after "pp_stripe". An earlier version matched
 * "pp_stripe" alone and attached Bancontact on production; a re-run swaps any
 * such provider for the card one.
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

  // 1. Is the Stripe card provider registered? (only when STRIPE_API_KEY is set)
  const providers = await payment.listPaymentProviders({}, { take: 100 })
  const stripe = providers.find((p) => p.id.startsWith("pp_stripe_"))
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
  const current = (region.payment_providers ?? [])
    .map((p) => p?.id)
    .filter((x): x is string => !!x)

  // 3. Idempotent: every non-Stripe provider stays and the card provider is
  //    the only Stripe one (payment_providers on update replaces the whole set).
  const wanted = [...current.filter((id) => !id.startsWith("pp_stripe")), stripe.id]
  const dropped = current.filter((id) => !wanted.includes(id))
  if (!dropped.length && current.includes(stripe.id)) {
    logger.info(`${region.name}: Stripe cards already enabled. Nothing to do.`)
    return
  }
  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: region.id },
      update: { payment_providers: wanted },
    },
  })
  logger.info(
    `✓ Region "${region.name}" now takes: ${wanted.join(", ")}` +
      (dropped.length ? ` (removed ${dropped.join(", ")})` : "") +
      ".",
  )
}
