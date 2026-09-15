import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { INVOICES_MODULE } from "../modules/invoices"
import type InvoicesModuleService from "../modules/invoices/service"
import { findInvoice, refreshInvoice, sendInvoice } from "../lib/invoice/issue"

/**
 * When an order is first fulfilled, email the customer its invoice (unless
 * turned off in the invoice settings). An invoice nobody has received yet is
 * rebuilt from the order first, so edits made since it was placed are on it.
 * Later fulfillments of the same order don't send it again — use the order
 * page's «Αποστολή στον πελάτη» for that.
 */
export default async function invoiceOnFulfillment({
  event,
  container,
}: SubscriberArgs<{ order_id: string; fulfillment_id: string; no_notification?: boolean }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderId = event.data.order_id
  try {
    const { config } = await container.resolve<InvoicesModuleService>(INVOICES_MODULE).getSettings()
    // Also skipped when the fulfillment was created with «Send notification» unticked.
    if (!config.send_on_fulfillment || event.data.no_notification) return
    const existing = await findInvoice(container, orderId)
    if (existing?.sent_at) return
    if (existing) await refreshInvoice(container, orderId)
    const invoice = await sendInvoice(container, orderId)
    logger.info(`[invoice] ${invoice.code} sent to ${invoice.sent_to}`)
  } catch (e) {
    logger.error(`[invoice] sending for order ${orderId} failed: ${(e as Error)?.message ?? e}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
}
