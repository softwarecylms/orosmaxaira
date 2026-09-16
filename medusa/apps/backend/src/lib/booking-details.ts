import type { MedusaContainer } from "@medusajs/framework/types"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * What a booking is *for*, in the customer's language: the activity or workshop
 * title, the workshop combo, and the practical note for the confirmation
 * ("please arrive 5 minutes early…").
 *
 * Greek is the base record; English comes from the `translations.en` overlay the
 * admin edits (`title`, `confirmation_note`, and for workshops
 * `combo_labels[key].{label,long_label,confirmation_note}`). A blank English
 * field falls back to the Greek one.
 */

export type BookingLocale = "el" | "en"

export const bookingLocale = (value?: string | null): BookingLocale =>
  value === "en" ? "en" : "el"

type BookingRef = {
  slot_id: string
  activity_id?: string | null
  workshop_id?: string | null
  combo_label?: string | null
  locale?: string | null
}

type Tier = {
  key: string
  label?: string
  long_label?: string
  confirmation_note?: string
}

export type BookingDetails = {
  locale: BookingLocale
  kind: "activity" | "workshop"
  title: string
  combo: string | null
  note: string | null
  slot: { date?: string; start_time?: string; combo_key?: string | null } | null
}

const text = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null

export async function bookingDetails(
  container: MedusaContainer,
  booking: BookingRef,
  localeOverride?: string | null,
): Promise<BookingDetails> {
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const locale = bookingLocale(localeOverride ?? booking.locale)
  const en = locale === "en"
  const slot = (await bookings.retrieveAvailabilitySlot(booking.slot_id).catch(() => null)) as
    | BookingDetails["slot"]
    | null

  if (booking.workshop_id) {
    const [w] = (await bookings.listWorkshops({ id: booking.workshop_id })) as any[]
    const tiers: Tier[] = Array.isArray(w?.price_tiers) ? w.price_tiers : []
    // The slot fixes the combo; older bookings are matched by their stored label.
    const tier =
      tiers.find((t) => slot?.combo_key && t.key === slot.combo_key) ??
      tiers.find((t) => booking.combo_label && [t.long_label, t.label].includes(booking.combo_label))
    const enW = en ? (w?.translations?.en ?? {}) : {}
    const enTier = (tier && enW.combo_labels?.[tier.key]) ?? {}
    return {
      locale,
      kind: "workshop",
      title: text(enW.title) ?? w?.title ?? "",
      combo:
        text(enTier.long_label) ??
        text(enTier.label) ??
        booking.combo_label ??
        text(tier?.long_label) ??
        text(tier?.label),
      note: text(enTier.confirmation_note) ?? text(tier?.confirmation_note),
      slot,
    }
  }

  const [a] = (await bookings.listActivities({ id: booking.activity_id ?? "" })) as any[]
  const enA = en ? (a?.translations?.en ?? {}) : {}
  return {
    locale,
    kind: "activity",
    title: text(enA.title) ?? a?.title ?? "",
    combo: null,
    note: text(enA.confirmation_note) ?? text(a?.confirmation_note),
    slot,
  }
}
