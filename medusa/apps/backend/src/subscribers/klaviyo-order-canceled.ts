import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { klaviyoEnabled, trackEvent } from "../lib/klaviyo"
import { loadKlaviyoOrder } from "../lib/klaviyo-order"

/**
 * A cancelled order → Klaviyo "Canceled Order" (Klaviyo's spelling). Its id is the
 * order id, matching "Placed Order", so Klaviyo takes it out of customer lifetime value.
 */
export default async function klaviyoOrderCanceled({ event, container }: SubscriberArgs<{ id: string }>) {
  if (!klaviyoEnabled()) return
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const order = await loadKlaviyoOrder(container, event.data.id)
    if (!order) return
    await trackEvent("Canceled Order", order.profile, order.properties, { uniqueId: order.id, value: order.value })
  } catch (e) {
    logger.error(`[klaviyo] cancellation for ${event.data.id} failed: ${(e as Error)?.message ?? e}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.canceled",
}
