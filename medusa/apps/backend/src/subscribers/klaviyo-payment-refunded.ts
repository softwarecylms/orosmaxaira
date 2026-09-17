import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { klaviyoEnabled, trackEvent } from "../lib/klaviyo"
import { loadKlaviyoOrder } from "../lib/klaviyo-order"

/**
 * A refund → Klaviyo "Refunded Order" with the refunded amount. The event only
 * names the payment, so the order is found through its payment collection. Bookings
 * have payments too but no order link, so they are skipped. The id is the order id
 * (Klaviyo's advice, for lifetime value), which means a second partial refund on
 * the same order is not recorded again.
 */
export default async function klaviyoPaymentRefunded({ event, container }: SubscriberArgs<{ id: string }>) {
  if (!klaviyoEnabled()) return
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  try {
    const { data: payments } = await query.graph({
      entity: "payment",
      fields: ["id", "payment_collection_id", "refunds.amount"],
      filters: { id: event.data.id },
    })
    const payment = payments?.[0] as any
    if (!payment?.payment_collection_id) return
    const { data: links } = await query.graph({
      entity: "order_payment_collection",
      fields: ["order_id"],
      filters: { payment_collection_id: payment.payment_collection_id },
    })
    const orderId = (links?.[0] as any)?.order_id
    if (!orderId) return

    const order = await loadKlaviyoOrder(container, orderId)
    if (!order) return
    const refunded = (payment.refunds ?? []).reduce(
      (sum: number, r: any) => sum + Number(r?.amount?.numeric_ ?? r?.amount ?? 0),
      0,
    )
    await trackEvent(
      "Refunded Order",
      order.profile,
      { ...order.properties, RefundedValue: refunded },
      { uniqueId: order.id, value: refunded || order.value },
    )
  } catch (e) {
    logger.error(`[klaviyo] refund ${event.data.id} failed: ${(e as Error)?.message ?? e}`)
  }
}

export const config: SubscriberConfig = {
  event: "payment.refunded",
}
