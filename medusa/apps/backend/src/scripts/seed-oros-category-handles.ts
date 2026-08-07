import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Align the honey category handles with the storefront's Greek URL slugs
 * (/proionta/<slug>/). Idempotent.
 *   npx medusa exec ./src/scripts/seed-oros-category-handles.ts
 */
const SLUGS: Record<string, string> = {
  Μέλι: "meli",
  "Προϊόντα Μέλισσας": "proionta-melissas",
  Καλλυντικά: "kallyntika",
  "Πακέτα Δώρων": "paketa-doron",
}

export default async function seedCategoryHandles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: cats } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
  })

  for (const [name, handle] of Object.entries(SLUGS)) {
    const cat = cats.find((c: { name: string }) => c.name === name)
    if (!cat) {
      logger.warn(`Category not found: ${name}`)
      continue
    }
    if (cat.handle === handle) {
      logger.info(`${name}: already "${handle}"`)
      continue
    }
    await updateProductCategoriesWorkflow(container).run({
      input: { selector: { id: cat.id }, update: { handle } },
    })
    logger.info(`${name}: "${cat.handle}" → "${handle}"`)
  }
  logger.info("✓ Category handles aligned with storefront slugs.")
}
