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
  // How the storefront books this activity: the real seat/slot checkout, or an
  // enquiry (appointment) request — e.g. Μελισσοθεραπεία, which has no slots.
  booking_type: model.enum(["seats", "enquiry"]).default("seats"),
  meta_title: model.text().nullable(),
  meta_description: model.text().nullable(),
  // Structured content — small arrays edited via repeater sub-forms in admin.
  price_tiers: model.json().nullable(), // [{ key, label, price, note? }]
  gallery: model.json().nullable(), //     [{ url, alt }]
  features: model.json().nullable(), //    [{ title, text }]
  policies: model.json().nullable(), //    [{ title, body }]
  reviews: model.json().nullable(), //     [{ name, date, rating, body }]
  // Optional "Οφέλη" list (e.g. Μελισσοθεραπεία conditions): { intro?, items[] }.
  benefits: model.json().nullable(),
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

/**
 * A seasonal βιωματικό εργαστήρι — the /drastiriotites/ergastiria hub + each
 * per-workshop page. The farm runs one workshop per season; `months` (1–12, in
 * season order) drives the seasonal calendar. Empty `months` = "κατόπιν ραντεβού".
 * Content-only (booking is an enquiry), so no slots/pricing here.
 */
export const Workshop = model.define("workshop", {
  id: model.id({ prefix: "wsh" }).primaryKey(),
  slug: model.text().unique(),
  title: model.text(),
  excerpt: model.text().nullable(),
  description: model.text().nullable(),
  season_label: model.text().nullable(),
  months: model.json().nullable(), // number[] 1–12, in season order
  image: model.text().nullable(), // hero image
  gallery: model.json().nullable(), // [{ url, alt }]
  duration_label: model.text().nullable(),
  age_label: model.text().nullable(),
  currency: model.text().default("eur"),
  // Demo pricing = the bookable experience combinations, each a priced tier:
  //   [{ key, label: "Γνωρίζω τη Μέλισσα (+ Περιπέτειες)", price, note? }]
  price_tiers: model.json().nullable(),
  features: model.json().nullable(), // [{ title, text }]
  rank: model.number().default(0), // display order in the hub
  status: model.enum(["draft", "published"]).default("draft"),
  meta_title: model.text().nullable(),
  meta_description: model.text().nullable(),
})

/**
 * The "Εκπαιδευτικές Επισκέψεις Σχολείων" program driving /drastiriotites/scholeia.
 * A singleton content record (one published row, `slug` = "default"). Booking is
 * an enquiry (headcount + weekday), so there are no slots; pricing is per-child
 * headcount tiers rather than seat tiers.
 */
export const SchoolProgram = model.define("school_program", {
  id: model.id({ prefix: "sprog" }).primaryKey(),
  slug: model.text().unique(), // "default" — the one published program
  title: model.text(),
  hero_image: model.text().nullable(),
  hero_image_alt: model.text().nullable(),
  intro: model.text().nullable(), // Περιγραφή
  closing: model.text().nullable(),
  program_note: model.text().nullable(), // "Τα παιδιά χωρίζονται σε ομάδες…"
  tour_title: model.text().nullable(),
  tour_intro: model.text().nullable(),
  tour_stops: model.json().nullable(), // [{ text }]
  workshop_intro: model.text().nullable(),
  workshop_options: model.json().nullable(), // [{ key, short, description }]
  workshop_note: model.text().nullable(),
  play_title: model.text().nullable(),
  play_text: model.text().nullable(),
  duration_text: model.text().nullable(),
  max_students: model.number().default(50),
  pricing: model.json().nullable(), // [{ range, price, note }]
  notes: model.json().nullable(), // [{ title, body }]
  allergy_title: model.text().nullable(),
  allergy_body: model.json().nullable(), // string[] paragraphs
  status: model.enum(["draft", "published"]).default("published"),
  meta_title: model.text().nullable(),
  meta_description: model.text().nullable(),
})
