import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * House style: a space between a number and its unit. The beeswax product title
 * read "Beeswax (200–250g)" in English and "Κερί Μέλισσας (200-250γρ)" in Greek
 * — the Greek also used a hyphen where the range needs an en dash.
 *
 * Idempotent.  npx medusa exec ./src/scripts/fix-beeswax-title.ts
 */
export default async function fixBeeswaxTitle({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title", "metadata"],
  })
  const p = products.find((x) => x.handle === "melissokeri")
  if (!p) { logger.warn("melissokeri not found"); return }

  const metadata = (p.metadata ?? {}) as Record<string, unknown>
  const update: Record<string, unknown> = {}

  const el = String(p.title ?? "").replace("(200-250γρ)", "(200–250 γρ)")
  if (el !== p.title) update.title = el

  if (typeof metadata.title_en === "string") {
    const en = metadata.title_en.replace("(200–250g)", "(200–250 g)").replace("(200-250g)", "(200–250 g)")
    if (en !== metadata.title_en) update.metadata = { ...metadata, title_en: en }
  }

  if (!Object.keys(update).length) { logger.info("Already correct."); return }
  await productService.updateProducts(p.id, update)
  logger.info("✓ Beeswax title spacing fixed (el + en).")
}
