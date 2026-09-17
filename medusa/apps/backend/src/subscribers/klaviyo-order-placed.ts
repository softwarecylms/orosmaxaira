import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { klaviyoEnabled, subscribeToNewsletter } from "../lib/klaviyo"
import { loadKlaviyoOrder, sendPlacedOrder } from "../lib/klaviyo-order"

/**
 * A new order → Klaviyo "Placed Order" + "Ordered Product" per line. If the
 * customer ticked the newsletter box at checkout, subscribe them to the list for
 * their language (double opt-in: Klaviyo asks them to confirm first).
 */
export default async function klaviyoOrderPlaced({ event, container }: SubscriberArgs<{ id: string }>) {
  if (!klaviyoEnabled()) return
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const order = await loadKlaviyoOrder(container, event.data.id)
    if (!order) return
    await sendPlacedOrder(order)
    if (order.optedIn) await subscribeToNewsletter(order.profile.email, order.language, "Checkout")
    logger.info(`[klaviyo] order ${event.data.id} sent${order.optedIn ? " + newsletter opt-in" : ""}`)
  } catch (e) {
    logger.error(`[klaviyo] order ${event.data.id} failed: ${(e as Error)?.message ?? e}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
