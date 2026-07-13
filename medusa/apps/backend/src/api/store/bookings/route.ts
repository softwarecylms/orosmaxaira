import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { randomBytes } from "crypto"
import { BOOKINGS_MODULE } from "../../../modules/bookings"
import type BookingsModuleService from "../../../modules/bookings/service"

type PriceTier = {
  key: string
  label?: string
  // Values come from an admin-editable JSON blob, so tolerate stringy numbers.
  price: number | string
  // Optional weekend (Sat/Sun) price; falls back to `price` when absent/blank.
  weekend_price?: number | string | null
  note?: string
}

/** True when a `YYYY-MM-DD` date falls on a Saturday or Sunday. Built from
 *  y/m/d components so it's timezone-independent (no UTC off-by-one). */
function isWeekend(date: string): boolean {
  const [y, m, d] = date.split("-").map(Number)
  const wd = new Date(y, (m ?? 1) - 1, d ?? 1).getDay()
  return wd === 0 || wd === 6
}

type BookingBody = {
  slug: string
  slot_id: string
  customer: { name: string; email: string; phone?: string }
  adults?: number
  children?: number
  infants?: number
  notes?: string
  idempotency_key?: string
}

/** Short, human-friendly booking reference, e.g. OM-9F3K2M. */
function makeReference(): string {
  return "OM-" + randomBytes(4).toString("hex").slice(0, 6).toUpperCase()
}

/** Only the fields the storefront needs back (never leak payment ids etc.). */
function publicBooking(b: any, activityTitle?: string, slot?: any) {
  return {
    reference: b.reference,
    status: b.status,
    total_amount: b.total_amount,
    currency: b.currency,
    adults: b.adults,
    children: b.children,
    infants: b.infants,
    email: b.email,
    activity_title: activityTitle,
    date: slot?.date,
    start_time: slot?.start_time,
  }
}

/**
 * POST /store/bookings
 * Reserve → pay (system default in dev) → confirm → email. Atomic seat
 * reservation prevents oversell; a €0 total skips payment. Idempotent on
 * `idempotency_key` so a double-submit/refresh never double-books.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = ((req as any).validatedBody ?? req.body) as BookingBody
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const logger = req.scope.resolve("logger")

  const adults = body.adults ?? 0
  const children = body.children ?? 0
  const infants = body.infants ?? 0
  const seats = adults + children + infants

  // 1) Idempotency — return the existing booking instead of double-booking.
  if (body.idempotency_key) {
    const [existing] = await bookings.listBookings({
      idempotency_key: body.idempotency_key,
    })
    // Replay only a still-live booking; a cancelled one means a prior attempt
    // failed — fall through and let the customer try again.
    if (existing && (existing as any).status !== "cancelled") {
      const slot = await bookings
        .retrieveAvailabilitySlot((existing as any).slot_id)
        .catch(() => null)
      const [act] = await bookings.listActivities({ slug: body.slug })
      return res.json({ booking: publicBooking(existing, act?.title, slot) })
    }
  }

  if (seats < 1) {
    return res.status(400).json({ message: "Επιλέξτε τουλάχιστον ένα άτομο." })
  }

  // 2) Load activity + slot; compute the total server-side (never trust client).
  const [activity] = await bookings.listActivities({
    slug: body.slug,
    status: "published",
  })
  if (!activity) return res.status(404).json({ message: "Activity not found" })

  const slot = await bookings
    .retrieveAvailabilitySlot(body.slot_id)
    .catch(() => null)
  if (!slot || (slot as any).activity_id !== activity.id) {
    return res.status(404).json({ message: "Slot not found" })
  }

  const tiers: PriceTier[] = ((activity as any).price_tiers ?? []) as PriceTier[]
  // Weekend (Sat/Sun) slots use `weekend_price` when a tier defines it; every
  // other case falls back to the base `price` (so single-price activities are
  // unaffected). The slot's own date is authoritative, never the client.
  const weekend = isWeekend((slot as any).date)
  const priceOf = (key: string) => {
    const t = tiers.find((tt) => tt.key === key)
    if (!t) return 0
    const wp = t.weekend_price
    const raw = weekend && wp != null && wp !== "" ? wp : t.price
    return Number(raw) || 0
  }
  const total =
    Math.round(
      (adults * priceOf("adult") +
        children * priceOf("child") +
        infants * priceOf("infant")) *
        100
    ) / 100
  const currency = (activity as any).currency ?? "eur"

  // 3) Atomic reservation — false ⇒ slot is full/closed.
  const reserved = await bookings.reserveSeats(body.slot_id, seats)
  if (!reserved) {
    return res
      .status(409)
      .json({ message: "Δεν υπάρχει διαθεσιμότητα για αυτή την ώρα." })
  }

  // 4) Create the booking (pending), then pay + confirm.
  let booking: any
  try {
    const created = await bookings.createBookings({
      reference: makeReference(),
      idempotency_key: body.idempotency_key ?? null,
      customer_name: body.customer.name,
      email: body.customer.email,
      phone: body.customer.phone ?? null,
      adults,
      children,
      infants,
      total_amount: total,
      currency,
      status: "pending",
      notes: body.notes ?? null,
      activity_id: activity.id,
      slot_id: body.slot_id,
    })
    booking = Array.isArray(created) ? created[0] : created

    // 5) Payment — skip entirely when free.
    if (total > 0) {
      const payment = req.scope.resolve<any>(Modules.PAYMENT)
      const pc = await payment.createPaymentCollections({
        amount: total,
        currency_code: currency,
      })
      const session = await payment.createPaymentSession(pc.id, {
        provider_id: "pp_system_default",
        amount: total,
        currency_code: currency,
        data: {},
      })
      const authorized = await payment.authorizePaymentSession(session.id, {})
      await bookings.updateBookings({
        id: booking.id,
        status: "confirmed",
        payment_collection_id: pc.id,
        payment_id: authorized?.id ?? null,
      })
    } else {
      await bookings.updateBookings({ id: booking.id, status: "confirmed" })
    }
    booking.status = "confirmed"
  } catch (e: any) {
    // Roll back the reservation + free the idempotency key so the customer can
    // retry (a cancelled row keeps the unique key otherwise and blocks retries).
    await bookings.releaseSeats(body.slot_id, seats).catch(() => {})
    if (booking?.id) {
      await bookings
        .updateBookings({
          id: booking.id,
          status: "cancelled",
          idempotency_key: null,
        })
        .catch(() => {})
    }

    // Concurrent duplicate: another request with the same idempotency_key won
    // the race and created the booking — return it instead of a 500.
    if (
      body.idempotency_key &&
      /unique|duplicate|idempotency/i.test(String(e?.message ?? ""))
    ) {
      const [dup] = await bookings.listBookings({
        idempotency_key: body.idempotency_key,
      })
      if (dup && (dup as any).status !== "cancelled") {
        const dupSlot = await bookings
          .retrieveAvailabilitySlot((dup as any).slot_id)
          .catch(() => null)
        return res.json({ booking: publicBooking(dup, activity.title, dupSlot) })
      }
    }

    logger.error(`Booking failed: ${e?.message ?? e}`)
    return res.status(500).json({
      message: "Δεν ήταν δυνατή η ολοκλήρωση της κράτησης. Δοκιμάστε ξανά.",
    })
  }

  // 6) Confirmation email (inline; log-only via notification-local in dev).
  try {
    const notification = req.scope.resolve<any>(Modules.NOTIFICATION)
    const adminEmail = process.env.BOOKING_ADMIN_EMAIL || "info@orosmaxaira.com"
    const when = `${slot.date} στις ${slot.start_time}`
    const people = `${adults} ενήλικες, ${children} παιδιά, ${infants} βρέφη`
    const money = `${total.toFixed(2)} ${currency.toUpperCase()}`
    const data = {
      reference: booking.reference,
      activity: activity.title,
      when,
      people,
      total: money,
      customer_name: booking.customer_name,
    }
    await notification.createNotifications([
      {
        to: booking.email,
        channel: "email",
        template: "booking-confirmation",
        content: {
          subject: `Επιβεβαίωση κράτησης ${booking.reference} — ${activity.title}`,
          text: `Ευχαριστούμε ${booking.customer_name}! Η κράτησή σας για «${activity.title}» στις ${when} επιβεβαιώθηκε. Άτομα: ${people}. Σύνολο: ${money}. Κωδικός κράτησης: ${booking.reference}.`,
        },
        data,
      },
      {
        to: adminEmail,
        channel: "email",
        template: "booking-notification",
        content: {
          subject: `Νέα κράτηση ${booking.reference} — ${activity.title}`,
          text: `Νέα κράτηση: ${activity.title}, ${when}. ${people}. Σύνολο ${money}. Πελάτης: ${booking.customer_name} (${booking.email}${booking.phone ? ", " + booking.phone : ""}).`,
        },
        data,
      },
    ])
  } catch (e: any) {
    logger.warn(`Booking email not sent: ${e?.message ?? e}`)
  }

  // Emit an event for any future hooks (durability note: in-memory bus in dev).
  try {
    await req.scope
      .resolve<any>(Modules.EVENT_BUS)
      .emit({ name: "booking.confirmed", data: { id: booking.id } })
  } catch {
    /* non-fatal */
  }

  res.json({ booking: publicBooking(booking, activity.title, slot) })
}
