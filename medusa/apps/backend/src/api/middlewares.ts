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

/** Body schema for POST /store/workshops/:slug/bookings (combo × people-by-age). */
export const PostWorkshopBookingSchema = z.object({
  slot_id: z.string().min(1),
  combo_key: z.string().min(1),
  adults: z.number().int().min(0).optional(),
  children: z.number().int().min(0).optional(),
  infants: z.number().int().min(0).optional(),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  notes: z.string().optional(),
  idempotency_key: z.string().optional(),
})

/** Body schema for POST /store/bookings/confirm and /release — the booking's
 *  reference plus the idempotency key only the creating browser knows. */
export const BookingHoldSchema = z.object({
  reference: z.string().min(1),
  idempotency_key: z.string().min(1),
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/bookings",
      method: "POST",
      middlewares: [validateAndTransformBody(PostBookingSchema)],
    },
    {
      matcher: "/store/bookings/confirm",
      method: "POST",
      middlewares: [validateAndTransformBody(BookingHoldSchema)],
    },
    {
      matcher: "/store/bookings/release",
      method: "POST",
      middlewares: [validateAndTransformBody(BookingHoldSchema)],
    },
    {
      matcher: "/store/workshops/:slug/bookings",
      method: "POST",
      middlewares: [validateAndTransformBody(PostWorkshopBookingSchema)],
    },
  ],
})
