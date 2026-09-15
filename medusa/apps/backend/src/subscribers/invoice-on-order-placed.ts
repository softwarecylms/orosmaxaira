import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ensureInvoice } from "../lib/invoice/issue"

/** Every new order gets its invoice (and the next OMW number) as soon as it is placed. */
export default async function invoiceOnOrderPlaced({ event, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const invoice = await ensureInvoice(container, event.data.id)
    logger.info(`[invoice] ${invoice.code} issued for order ${event.data.id}`)
  } catch (e) {
    logger.error(`[invoice] issuing for order ${event.data.id} failed: ${(e as Error)?.message ?? e}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
