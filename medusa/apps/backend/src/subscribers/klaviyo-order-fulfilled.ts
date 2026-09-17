import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { klaviyoEnabled, trackEvent } from "../lib/klaviyo"
import { loadKlaviyoOrder } from "../lib/klaviyo-order"

/** An order marked fulfilled in the admin → Klaviyo "Fulfilled Order" (powers the after-delivery flow). */
export default async function klaviyoOrderFulfilled({
  event,
  container,
}: SubscriberArgs<{ order_id: string; fulfillment_id: string }>) {
  if (!klaviyoEnabled()) return
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const order = await loadKlaviyoOrder(container, event.data.order_id)
    if (!order) return
    await trackEvent("Fulfilled Order", order.profile, order.properties, {
      uniqueId: `${order.id}-${event.data.fulfillment_id}`,
      value: order.value,
    })
  } catch (e) {
    logger.error(`[klaviyo] fulfillment for ${event.data.order_id} failed: ${(e as Error)?.message ?? e}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
}
