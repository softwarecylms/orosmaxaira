import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { klaviyoEnabled, trackEvent } from "../lib/klaviyo"
import { loadKlaviyoOrder, sendPlacedOrder } from "../lib/klaviyo-order"

/**
 * Send the orders placed before Klaviyo was connected: "Placed Order" and
 * "Ordered Product" at each order's original date, plus "Canceled Order" for
 * cancelled ones. Nobody is subscribed to a newsletter by this.
 *
 * Safe to re-run: every event carries the order's (or line's) id, and Klaviyo
 * keeps only the first.
 *
 *   npx medusa exec ./src/scripts/klaviyo-backfill-orders.ts          # send
 *   npx medusa exec ./src/scripts/klaviyo-backfill-orders.ts dry      # print only
 *
 * Needs KLAVIYO_PRIVATE_KEY in the environment for a real run.
 */
export default async function klaviyoBackfillOrders({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const dry = (args ?? []).includes("dry")

  if (!dry && !klaviyoEnabled()) {
    throw new Error("KLAVIYO_PRIVATE_KEY is not set — nothing would be sent. Use `dry` to preview.")
  }

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "status", "created_at"],
    pagination: { order: { created_at: "ASC" } },
  })
  logger.info(`[klaviyo-backfill] ${orders.length} order(s)${dry ? " — dry run, nothing is sent" : ""}`)

  let sent = 0
  for (const row of orders as any[]) {
    const order = await loadKlaviyoOrder(container, row.id)
    if (!order) {
      logger.info(`  #${row.display_id} skipped (no email)`)
      continue
    }
    const summary = `#${row.display_id} ${order.time.slice(0, 10)} ${order.profile.email.replace(/^(.).*(@.*)$/, "$1…$2")} €${order.value} ${order.lines.length} line(s) ${order.status}`
    if (dry) {
      logger.info(`  ${summary}`)
      continue
    }
    await sendPlacedOrder(order)
    if (order.status === "canceled") {
      await trackEvent("Canceled Order", order.profile, order.properties, {
        uniqueId: order.id,
        value: order.value,
        time: order.time,
      })
    }
    sent++
    logger.info(`  sent ${summary}`)
  }
  logger.info(`[klaviyo-backfill] done — ${dry ? "previewed" : "sent"} ${dry ? orders.length : sent}`)
}
