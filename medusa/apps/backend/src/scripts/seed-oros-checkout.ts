import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createPromotionsWorkflow,
  createShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Seed the checkout scaffolding the custom Greek checkout maps onto so a real
 * Medusa order can be created with matching totals:
 *   - Shipping options: Cyprus (€4,50), Greece (€7,00), Free (€0).
 *   - Promotion: BEE10 — 10% off, on orders of €150 or more.
 *
 * Idempotent (skips by name / code). Run AFTER seed-oros-products.ts:
 *   npx medusa exec ./src/scripts/seed-oros-checkout.ts
 */

/** BEE10 applies from this goods subtotal up (mirrors `src/lib/coupons.ts`). */
const MIN_ORDER_EUR = 150

const SHIPPING = [
  { name: "ACS Κύπρος", code: "cy-acs", amount: 2.5 }, // pickup point
  { name: "Παράδοση στο σπίτι", code: "cy-home", amount: 5 }, // home delivery (under the threshold)
  // Booked for ACS *or* home delivery once the discounted goods total reaches €70
  // (see src/lib/shipping.ts — the storefront enforces the rule client + server side).
  { name: "Δωρεάν μεταφορικά", code: "free", amount: 0 },
  { name: "Παράδοση Ελλάδα", code: "gr-standard", amount: 7 },
]

export default async function seedOrosCheckout({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })
  const region = regions.find((r) => r.currency_code === "eur") ?? regions[0]
  const { data: zones } = await query.graph({
    entity: "service_zone",
    fields: ["id", "geo_zones.country_code"],
  })
  const serviceZone = zones[0]
  const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] })
  const shippingProfile = profiles[0]
  if (!region || !serviceZone || !shippingProfile) {
    throw new Error("Missing region / service zone / shipping profile — run the initial seed first.")
  }

  // --- Ensure Cyprus + Greece are in the service zone (so shipping options are
  //     offered to carts shipping there) --------------------------------------
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const existingGeo = (serviceZone.geo_zones ?? []).map(
    (g: { country_code: string }) => g.country_code,
  )
  const missingGeo = ["cy", "gr"].filter((c) => !existingGeo.includes(c))
  if (missingGeo.length) {
    await fulfillment.updateServiceZones(serviceZone.id, {
      geo_zones: [
        ...existingGeo.map((country_code: string) => ({ type: "country" as const, country_code })),
        ...missingGeo.map((country_code) => ({ type: "country" as const, country_code })),
      ],
    })
    logger.info(`Added geo zones: ${missingGeo.join(", ")}.`)
  }

  // --- Shipping options (idempotent by name) ----------------------------------
  const { data: existingOpts } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
  })
  const haveOpt = new Set(existingOpts.map((o: { name: string }) => o.name))
  const newOpts = SHIPPING.filter((s) => !haveOpt.has(s.name))
  if (newOpts.length) {
    await createShippingOptionsWorkflow(container).run({
      input: newOpts.map((s) => ({
        name: s.name,
        price_type: "flat" as const,
        provider_id: "manual_manual",
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: { label: s.name, description: s.name, code: s.code },
        prices: [
          { currency_code: "eur", amount: s.amount },
          { region_id: region.id, amount: s.amount },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
          { attribute: "is_return", value: "false", operator: "eq" as const },
        ],
      })),
    })
    logger.info(`Created shipping options: ${newOpts.map((o) => o.name).join(", ")}.`)
  } else {
    logger.info("Shipping options already present.")
  }

  // --- Promotions (idempotent by code) ----------------------------------------
  const { data: existingPromos } = await query.graph({
    entity: "promotion",
    fields: ["id", "code"],
  })
  const havePromo = new Set(existingPromos.map((p: { code: string }) => p.code))
  const promos = [
    {
      code: "BEE10",
      type: "standard" as const,
      status: "active" as const,
      application_method: {
        type: "percentage" as const,
        target_type: "order" as const,
        allocation: "across" as const,
        value: 10,
        currency_code: "eur",
      },
      // Minimum order value. `item_subtotal` is the line-item total before any
      // discount and excluding shipping — the same figure the storefront checks
      // in `src/lib/coupons.ts`, so the two never disagree about eligibility.
      // Medusa v2 totals are decimal euros, and rule values are strings.
      rules: [
        {
          attribute: "item_subtotal",
          operator: "gte" as const,
          values: [String(MIN_ORDER_EUR)],
        },
      ],
    },
  ].filter((p) => !havePromo.has(p.code))

  if (promos.length) {
    await createPromotionsWorkflow(container).run({ input: { promotionsData: promos } })
    logger.info(`Created promotions: ${promos.map((p) => p.code).join(", ")}.`)
  } else {
    logger.info("Promotions already present.")
  }

  logger.info("✓ OROS MACHAIRA checkout scaffolding seeded.")
}
