import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * A €1 product for testing real checkouts and payments end to end.
 *
 * `metadata.hidden` keeps it out of the storefront's shop grid, category pages,
 * search and sitemap, and its page is noindex; it is reachable only by link:
 *   https://orosmaxaira.com/product/dokimastiko-proion/
 *
 * It copies the sales channel and shipping profile of a real product, so the
 * checkout offers the same delivery options. No inventory tracking, so it never
 * runs out. Idempotent: does nothing if the handle already exists.
 *
 *   npx medusa exec ./src/scripts/create-test-product.ts
 */

const HANDLE = "dokimastiko-proion"
const REFERENCE_HANDLE = "ydromelo"

export default async function createTestProduct({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "status"],
    filters: { handle: HANDLE },
  })
  if (existing.length) {
    logger.info(`Test product already exists (${existing[0].id}, ${existing[0].status}).`)
    return
  }

  const { data: refs } = await query.graph({
    entity: "product",
    fields: ["id", "sales_channels.id", "shipping_profile.id"],
    filters: { handle: REFERENCE_HANDLE },
  })
  const ref = refs[0] as
    | { sales_channels?: { id: string }[] | null; shipping_profile?: { id: string } | null }
    | undefined
  const salesChannelIds = (ref?.sales_channels ?? []).map((c) => c.id)
  const shippingProfileId = ref?.shipping_profile?.id
  if (!salesChannelIds.length || !shippingProfileId) {
    throw new Error(`Reference product "${REFERENCE_HANDLE}" has no sales channel or shipping profile.`)
  }

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Δοκιμαστικό προϊόν (€1)",
          handle: HANDLE,
          description:
            "Εσωτερικό προϊόν για δοκιμές παραγγελιών και πληρωμών. Δεν εμφανίζεται στο κατάστημα.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfileId,
          sales_channels: salesChannelIds.map((id) => ({ id })),
          thumbnail: "https://orosmaxaira.com/images/og/logo.png",
          images: [{ url: "https://orosmaxaira.com/images/og/logo.png" }],
          weight: 100,
          metadata: { hidden: "true", title_en: "Test product (€1)" },
          options: [{ title: "Συσκευασία", values: ["Τεμάχιο"] }],
          variants: [
            {
              title: "Τεμάχιο",
              sku: "TEST-1EUR",
              manage_inventory: false,
              options: { "Συσκευασία": "Τεμάχιο" },
              prices: [{ amount: 1, currency_code: "eur" }],
            },
          ],
        },
      ],
    },
  })

  logger.info(`Created hidden test product "${HANDLE}" at €1.`)
}
