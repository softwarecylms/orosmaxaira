import { model } from "@medusajs/framework/utils"

/**
 * Bookings module data models — the single source of truth for the site's
 * activities (content + pricing), their availability, and customer bookings.
 * All of this is editable from the Medusa admin.
 *
 * Notes:
 * - Money is stored as **decimals** (e.g. 20 = €20.00), matching Medusa v2 +
 *   the storefront's `src/lib/medusa/prices.ts`.
 * - Dates/times are stored as **text** (`YYYY-MM-DD`, `HH:mm`) to avoid the
 *   UTC off-by-one that `dateTime`/`toISOString()` introduces (Europe/Nicosia).
 * - This file lives in `models/` (not `models/index.ts`) because Medusa's module
 *   loader scans the `models` directory and skips any `index.*` file.
 */

export const Activity = model.define("activity", {
  id: model.id({ prefix: "act" }).primaryKey(),
  slug: model.text().unique(),
  title: model.text(),
  subtitle: model.text().nullable(),
  hero_image: model.text().nullable(),
  hero_image_alt: model.text().nullable(),
  video_url: model.text().nullable(),
  description: model.text().nullable(),
  details: model.text().nullable(),
  // The styled "Σημαντική σημείωση" callout (e.g. the winter-bees warning).
  note: model.text().nullable(),
  rating: model.float().nullable(),
  review_count: model.number().default(0),
  duration_label: model.text().nullable(),
  age_label: model.text().nullable(),
  season_start_month: model.number().nullable(),
  season_end_month: model.number().nullable(),
  currency: model.text().default("eur"),
  status: model.enum(["draft", "published"]).default("draft"),
  meta_title: model.text().nullable(),
  meta_description: model.text().nullable(),
  // Structured content — small arrays edited via repeater sub-forms in admin.
  price_tiers: model.json().nullable(), // [{ key, label, price, note? }]
  gallery: model.json().nullable(), //     [{ url, alt }]
  features: model.json().nullable(), //    [{ title, text }]
  policies: model.json().nullable(), //    [{ title, body }]
  reviews: model.json().nullable(), //     [{ name, date, rating, body }]
  related_slugs: model.json().nullable(), // string[]
  slots: model.hasMany(() => AvailabilitySlot, { mappedBy: "activity" }),
  bookings: model.hasMany(() => Booking, { mappedBy: "activity" }),
})

export const AvailabilitySlot = model
  .define("availability_slot", {
    id: model.id({ prefix: "slot" }).primaryKey(),
    date: model.text(), // YYYY-MM-DD
    start_time: model.text(), // HH:mm
    end_time: model.text().nullable(),
    capacity: model.number().default(0),
    booked_count: model.number().default(0),
    status: model.enum(["open", "closed"]).default("open"),
    activity: model.belongsTo(() => Activity, { mappedBy: "slots" }),
    bookings: model.hasMany(() => Booking, { mappedBy: "slot" }),
  })
  .indexes([
    {
      name: "IDX_slot_activity_date_time",
      on: ["activity_id", "date", "start_time"],
      unique: true,
    },
  ])

export const Booking = model.define("booking", {
  id: model.id({ prefix: "bk" }).primaryKey(),
  reference: model.text().unique(), // human code, e.g. OM-7F3K2M
  idempotency_key: model.text().unique().nullable(),
  customer_name: model.text(),
  email: model.text(),
  phone: model.text().nullable(),
  adults: model.number().default(0),
  children: model.number().default(0),
  infants: model.number().default(0),
  total_amount: model.float().default(0),
  currency: model.text().default("eur"),
  payment_collection_id: model.text().nullable(),
  payment_id: model.text().nullable(),
  status: model.enum(["pending", "confirmed", "cancelled"]).default("pending"),
  notes: model.text().nullable(),
  activity: model.belongsTo(() => Activity, { mappedBy: "bookings" }),
  slot: model.belongsTo(() => AvailabilitySlot, { mappedBy: "bookings" }),
})
