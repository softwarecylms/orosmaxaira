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

/** Body for publishing or drafting a content entry (POST /admin/content/:key[/draft]):
 *  the Greek content tree and the per-locale overlay. The tree's shape is the
 *  storefront's business — the admin's field schemas keep it in step. */
export const ContentBodySchema = z.object({
  data: z.record(z.string(), z.unknown()),
  translations: z.record(z.string(), z.unknown()).nullable().optional(),
})
export type ContentBody = z.infer<typeof ContentBodySchema>

/** Body for POST /admin/media-assets — an image stored via POST /admin/uploads. */
export const MediaAssetSchema = z.object({
  url: z.string().min(1),
  file_key: z.string().nullable().optional(),
  name: z.string().min(1),
  mime_type: z.string().nullable().optional(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  size: z.number().int().nonnegative().nullable().optional(),
  alt: z.string().nullable().optional(),
})
export type MediaAssetBody = z.infer<typeof MediaAssetSchema>

export default defineMiddlewares({
  routes: [
    {
      // A whole page's content tree, both languages: allow well past the
      // 100 kB default (the largest page today is ~25 kB).
      matcher: "/admin/content/:key",
      method: "POST",
      bodyParser: { sizeLimit: "2mb" },
      middlewares: [validateAndTransformBody(ContentBodySchema)],
    },
    {
      matcher: "/admin/content/:key/draft",
      method: "POST",
      bodyParser: { sizeLimit: "2mb" },
      middlewares: [validateAndTransformBody(ContentBodySchema)],
    },
    {
      matcher: "/admin/media-assets",
      method: "POST",
      middlewares: [validateAndTransformBody(MediaAssetSchema)],
    },
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
