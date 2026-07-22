import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { randomBytes } from "crypto"
import { BOOKINGS_MODULE } from "../../../../../modules/bookings"
import type BookingsModuleService from "../../../../../modules/bookings/service"

/**
 * A workshop combo (experience combination) is a price tier. Each combo carries
 * age-tiered prices — the Half and Full programs are booked online + paid, priced
 * per person by age (adults / children / infants). A legacy flat `price` is still
 * honoured as a fallback (charged to every seat) for older combo shapes.
 */
type ComboPrices = {
  adult?: number | string
  child?: number | string
  infant?: number | string
}
type PriceTier = {
  key: string
  label?: string
  long_label?: string
  start_time?: string
  end_time?: string
  // Admin-editable JSON blob, so tolerate stringy numbers.
  prices?: ComboPrices
  price?: number | string
  note?: string
}

type WorkshopBookingBody = {
  slot_id: string
  combo_key: string
  adults?: number
  children?: number
  infants?: number
  customer: { name: string; email: string; phone?: string }
  notes?: string
  idempotency_key?: string
}

/** Short, human-friendly booking reference, e.g. OM-9F3K2M. */
function makeReference(): string {
  return "OM-" + randomBytes(4).toString("hex").slice(0, 6).toUpperCase()
}

/** Only the fields the storefront needs back (never leak payment ids etc.). */
function publicBooking(b: any, workshopTitle?: string, slot?: any) {
  return {
    reference: b.reference,
    status: b.status,
    total_amount: b.total_amount,
    currency: b.currency,
    adults: b.adults,
    children: b.children,
    infants: b.infants,
    combo_label: b.combo_label,
    email: b.email,
    workshop_title: workshopTitle,
    date: slot?.date,
    start_time: slot?.start_time,
  }
}

/**
 * POST /store/workshops/:slug/bookings
 * Reserve → pay (system default in dev) → confirm → email — the same flow as
 * /store/bookings. A workshop is priced by the chosen experience combo (Half /
 * Full); the combo is fixed by the slot (`combo_key`), and the total is the sum
 * of each age group × that combo's per-age price. Atomic reservation prevents
 * oversell; a €0 total skips payment; idempotent on `idempotency_key`.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const slug = req.params.slug
  const body = ((req as any).validatedBody ?? req.body) as WorkshopBookingBody
  const bookings = req.scope.resolve<BookingsModuleService>(BOOKINGS_MODULE)
  const logger = req.scope.resolve("logger")

  const adults = Number(body.adults ?? 0)
  const children = Number(body.children ?? 0)
  const infants = Number(body.infants ?? 0)
  const seats = adults + children + infants

  // 1) Idempotency — return the existing booking instead of double-booking.
  if (body.idempotency_key) {
    const [existing] = await bookings.listBookings({
      idempotency_key: body.idempotency_key,
    })
    if (existing && (existing as any).status !== "cancelled") {
      const slot = await bookings
        .retrieveAvailabilitySlot((existing as any).slot_id)
        .catch(() => null)
      const [w] = await bookings.listWorkshops({ slug })
      return res.json({ booking: publicBooking(existing, w?.title, slot) })
    }
  }

  if (seats < 1) {
    return res.status(400).json({ message: "Επιλέξτε τουλάχιστον ένα άτομο." })
  }

  // 2) Load workshop + slot; compute the total server-side (never trust client).
  const [workshop] = await bookings.listWorkshops({ slug, status: "published" })
  if (!workshop) return res.status(404).json({ message: "Workshop not found" })

  const slot = await bookings
    .retrieveAvailabilitySlot(body.slot_id)
    .catch(() => null)
  if (!slot || (slot as any).workshop_id !== workshop.id) {
    return res.status(404).json({ message: "Slot not found" })
  }

  // The slot's own combo is authoritative (the Half/Full session is fixed by the
  // slot's time). Fall back to the body only for untagged slots.
  const comboKey = (slot as any).combo_key ?? body.combo_key
  const tiers: PriceTier[] = ((workshop as any).price_tiers ?? []) as PriceTier[]
  const combo = tiers.find((t) => t.key === comboKey)
  if (!combo) {
    return res.status(400).json({ message: "Μη έγκυρος συνδυασμός εμπειρίας." })
  }

  // Age-tiered total; a legacy flat `price` (no `prices`) applies to every seat.
  const priceOf = (age: keyof ComboPrices) => {
    const raw = combo.prices?.[age]
    if (raw != null && raw !== "") return Number(raw) || 0
    return Number(combo.price) || 0
  }
  const total =
    Math.round(
      (adults * priceOf("adult") +
        children * priceOf("child") +
        infants * priceOf("infant")) *
        100
    ) / 100
  const currency = (workshop as any).currency ?? "eur"

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
      combo_label: combo.long_label ?? combo.label ?? combo.key,
      workshop_id: workshop.id,
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
    // Roll back the reservation + free the idempotency key so retries work.
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
        return res.json({ booking: publicBooking(dup, workshop.title, dupSlot) })
      }
    }

    logger.error(`Workshop booking failed: ${e?.message ?? e}`)
    return res.status(500).json({
      message: "Δεν ήταν δυνατή η ολοκλήρωση της κράτησης. Δοκιμάστε ξανά.",
    })
  }

  // 6) Confirmation email (inline; log-only via notification-local in dev).
  try {
    const notification = req.scope.resolve<any>(Modules.NOTIFICATION)
    const adminEmail = process.env.BOOKING_ADMIN_EMAIL || "info@orosmaxaira.com"
    const when = `${slot.date} στις ${slot.start_time}`
    const money = `${total.toFixed(2)} ${currency.toUpperCase()}`
    const people = `${adults} ενήλικες, ${children} παιδιά, ${infants} βρέφη`
    const combos = combo.long_label ?? combo.label ?? combo.key
    const data = {
      reference: booking.reference,
      workshop: workshop.title,
      combo: combos,
      when,
      people,
      total: money,
      customer_name: booking.customer_name,
    }
    await notification.createNotifications([
      {
        to: booking.email,
        channel: "email",
        template: "workshop-booking-confirmation",
        content: {
          subject: `Επιβεβαίωση κράτησης ${booking.reference} — ${workshop.title}`,
          text: `Ευχαριστούμε ${booking.customer_name}! Η κράτησή σας για το εργαστήρι «${workshop.title}» (${combos}) στις ${when} επιβεβαιώθηκε. Άτομα: ${people}. Σύνολο: ${money}. Κωδικός κράτησης: ${booking.reference}.`,
        },
        data,
      },
      {
        to: adminEmail,
        channel: "email",
        template: "workshop-booking-notification",
        content: {
          subject: `Νέα κράτηση εργαστηρίου ${booking.reference} — ${workshop.title}`,
          text: `Νέα κράτηση εργαστηρίου: ${workshop.title} (${combos}), ${when}. Άτομα: ${people}. Σύνολο ${money}. Πελάτης: ${booking.customer_name} (${booking.email}${booking.phone ? ", " + booking.phone : ""}).`,
        },
        data,
      },
    ])
  } catch (e: any) {
    logger.warn(`Workshop booking email not sent: ${e?.message ?? e}`)
  }

  try {
    await req.scope
      .resolve<any>(Modules.EVENT_BUS)
      .emit({ name: "booking.confirmed", data: { id: booking.id } })
  } catch {
    /* non-fatal */
  }

  res.json({ booking: publicBooking(booking, workshop.title, slot) })
}
