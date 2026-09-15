import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/order-counts — { new_orders }: placed orders still waiting to be
 * handled (not canceled, no live fulfillment). Read by the Payload sidebar's
 * «Orders» badge with a secret API key (MEDUSA_SECRET_API_KEY on Vercel).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: ["id", "fulfillments.id", "fulfillments.canceled_at"],
    filters: { status: "pending" },
    pagination: { take: 1000 },
  })
  const newOrders = data.filter((o: any) => !(o.fulfillments ?? []).some((f: any) => f && !f.canceled_at)).length
  res.json({ new_orders: newOrders })
}
