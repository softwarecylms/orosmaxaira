import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "zod"

/** Body schema for POST /store/bookings. */
export const PostBookingSchema = z.object({
  slug: z.string().min(1),
  slot_id: z.string().min(1),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  adults: z.number().int().min(0).optional(),
  children: z.number().int().min(0).optional(),
  infants: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  idempotency_key: z.string().optional(),
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/bookings",
      method: "POST",
      middlewares: [validateAndTransformBody(PostBookingSchema)],
    },
  ],
})
