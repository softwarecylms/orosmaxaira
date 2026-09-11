import type {
  IPaymentModuleService,
  MedusaContainer,
  PaymentSessionDTO,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Card payments for activity and workshop bookings.
 *
 * A seat booking used to happen in one request: reserve seats → open a payment
 * with Medusa's manual provider (which approves itself) → confirm. So "Pay &
 * Book" confirmed the slot without a card ever being charged.
 *
 * With Stripe registered it now happens in two steps:
 *
 *   create   seats reserved, booking PENDING, Stripe PaymentIntent opened —
 *            the client secret goes back to the browser, which takes the card
 *   confirm  the session is authorised, which asks Stripe for the intent's real
 *            status rather than trusting the browser; only then is the booking
 *            confirmed and announced
 *
 * A pending booking holds real seats, so every way out gives them back: Back or
 * close in the modal calls `releaseBooking`, and a scheduled job
 * (src/jobs/release-stale-bookings.ts) settles holds older than HOLD_MINUTES.
 *
 * Without a Stripe key on the backend nothing changes — the manual provider
 * still confirms on the spot, so production behaves as before until keys are
 * deployed.
 */

/** How long seats stay held while the customer enters a card. */
export const HOLD_MINUTES = 20

const SYSTEM_PROVIDER = "pp_system_default"

/** The columns of a booking row these helpers read or write. */
export type BookingRow = {
  id: string
  reference: string
  status: "pending" | "confirmed" | "cancelled"
  slot_id: string
  activity_id?: string | null
  workshop_id?: string | null
  payment_collection_id?: string | null
  idempotency_key?: string | null
  customer_name: string
  email: string
  phone?: string | null
  adults: number
  children: number
  infants: number
  total_amount: number
  currency: string
  combo_label?: string | null
}

const bookingsOf = (c: MedusaContainer) => c.resolve<BookingsModuleService>(BOOKINGS_MODULE)
const paymentOf = (c: MedusaContainer) => c.resolve<IPaymentModuleService>(Modules.PAYMENT)

/** The registered Stripe provider, or null when the backend has no key. */
export async function stripeProviderId(container: MedusaContainer): Promise<string | null> {
  const providers = await paymentOf(container).listPaymentProviders({}, { take: 50 })
  return providers.find((p) => p.id.startsWith("pp_stripe") && p.is_enabled !== false)?.id ?? null
}

export type OpenedPayment = { confirmed: true } | { confirmed: false; clientSecret: string }

/**
 * Open the payment for a freshly created, pending booking.
 *
 * Stripe → a session whose `data` is the raw PaymentIntent; its client secret is
 * returned and the booking stays pending until the card is confirmed.
 * No Stripe → the manual provider authorises immediately and the booking is
 * confirmed here, exactly as before card payments existed.
 */
export async function openBookingPayment(
  container: MedusaContainer,
  booking: BookingRow,
  total: number,
  currency: string,
): Promise<OpenedPayment> {
  const payment = paymentOf(container)
  const bookings = bookingsOf(container)
  const collection = await payment.createPaymentCollections({ amount: total, currency_code: currency })
  const stripeId = await stripeProviderId(container)

  if (stripeId) {
    const session = await payment.createPaymentSession(collection.id, {
      provider_id: stripeId,
      amount: total,
      currency_code: currency,
      // Cards only. The booking step renders Elements straight from this
      // intent, so this list is exactly what the customer is offered. Pairs
      // with `automaticPaymentMethods: false` in medusa-config.ts.
      data: { payment_method_types: ["card"] },
    })
    const clientSecret = (session.data as { client_secret?: string } | undefined)?.client_secret
    if (!clientSecret) throw new Error("Stripe returned no client_secret for the booking payment")
    await bookings.updateBookings({ id: booking.id, payment_collection_id: collection.id })
    booking.payment_collection_id = collection.id
    return { confirmed: false, clientSecret }
  }

  const session = await payment.createPaymentSession(collection.id, {
    provider_id: SYSTEM_PROVIDER,
    amount: total,
    currency_code: currency,
    data: {},
  })
  const authorized = await payment.authorizePaymentSession(session.id, {})
  await bookings.updateBookings({
    id: booking.id,
    status: "confirmed",
    payment_collection_id: collection.id,
    payment_id: authorized?.id ?? null,
  })
  booking.status = "confirmed"
  return { confirmed: true }
}

/** The payment session behind a booking, if it has one. */
async function sessionOf(
  container: MedusaContainer,
  booking: BookingRow,
): Promise<PaymentSessionDTO | null> {
  if (!booking.payment_collection_id) return null
  const [session] = await paymentOf(container).listPaymentSessions({
    payment_collection_id: booking.payment_collection_id,
  })
  return session ?? null
}

/** A pending card booking's client secret — sent again when the same submission
 *  is replayed (double click, retried request), so it reuses the same intent. */
export async function pendingClientSecret(
  container: MedusaContainer,
  booking: BookingRow,
): Promise<string | undefined> {
  if (booking.status !== "pending") return undefined
  const session = await sessionOf(container, booking)
  return (session?.data as { client_secret?: string } | undefined)?.client_secret
}

/**
 * Confirm a pending booking IF its card has really been paid. Authorising the
 * session asks the provider for the PaymentIntent's status, so this is Stripe's
 * answer rather than the browser's — nobody can talk their way into a free
 * booking. Idempotent: an already-confirmed booking just returns true.
 */
export async function tryConfirmBooking(
  container: MedusaContainer,
  booking: BookingRow,
): Promise<boolean> {
  if (booking.status === "confirmed") return true
  if (booking.status !== "pending") return false

  const session = await sessionOf(container, booking)
  if (!session) return false

  let paymentId: string | null
  try {
    const authorized = await paymentOf(container).authorizePaymentSession(session.id, {})
    paymentId = authorized?.id ?? null
  } catch {
    // Not paid (yet): requires a payment method, still processing, or cancelled.
    return false
  }

  await bookingsOf(container).updateBookings({
    id: booking.id,
    status: "confirmed",
    payment_id: paymentId,
  })
  booking.status = "confirmed"
  await announceBooking(container, booking)
  return true
}

/**
 * Settle a pending hold that is being abandoned.
 *
 * The PaymentIntent is cancelled FIRST, and the seats go back on sale only once
 * that succeeds — so a card can never be charged for a seat someone else has
 * since taken. Stripe refuses to cancel an intent that has already succeeded;
 * that means the customer paid and never came back to finish, so the booking is
 * confirmed instead.
 */
export async function releaseBooking(
  container: MedusaContainer,
  booking: BookingRow,
): Promise<"confirmed" | "cancelled" | "pending"> {
  if (booking.status !== "pending") return booking.status

  const session = await sessionOf(container, booking)
  if (session) {
    try {
      await paymentOf(container).deletePaymentSession(session.id)
    } catch {
      if (await tryConfirmBooking(container, booking)) return "confirmed"
      // Neither cancellable nor paid — e.g. still processing. Leave the hold in
      // place; the next sweep tries again.
      return "pending"
    }
  }

  const bookings = bookingsOf(container)
  const seats = (booking.adults ?? 0) + (booking.children ?? 0) + (booking.infants ?? 0)
  await bookings.releaseSeats(booking.slot_id, seats)
  // Freeing the idempotency key lets the customer start the same booking again.
  await bookings.updateBookings({ id: booking.id, status: "cancelled", idempotency_key: null })
  booking.status = "cancelled"
  return "cancelled"
}

/** The booking a browser may act on: its reference AND the idempotency key,
 *  whose random part only the browser that created the booking holds. */
export async function findClientBooking(
  container: MedusaContainer,
  reference: string,
  idempotencyKey: string,
): Promise<BookingRow | null> {
  const [row] = await bookingsOf(container).listBookings({ reference })
  const booking = row as unknown as BookingRow | undefined
  if (!booking || !idempotencyKey || booking.idempotency_key !== idempotencyKey) return null
  return booking
}

/** The fields the storefront shows once a booking is confirmed. */
export async function publicBookingOf(container: MedusaContainer, booking: BookingRow) {
  const bookings = bookingsOf(container)
  const slot = await bookings.retrieveAvailabilitySlot(booking.slot_id).catch(() => null)
  let activity_title: string | undefined
  let workshop_title: string | undefined
  if (booking.workshop_id) {
    const [w] = await bookings.listWorkshops({ id: booking.workshop_id })
    workshop_title = w?.title
  } else if (booking.activity_id) {
    const [a] = await bookings.listActivities({ id: booking.activity_id })
    activity_title = a?.title
  }
  return {
    reference: booking.reference,
    status: booking.status,
    total_amount: booking.total_amount,
    currency: booking.currency,
    adults: booking.adults,
    children: booking.children,
    infants: booking.infants,
    combo_label: booking.combo_label ?? undefined,
    email: booking.email,
    activity_title,
    workshop_title,
    date: (slot as { date?: string } | null)?.date,
    start_time: (slot as { start_time?: string } | null)?.start_time,
  }
}

type EmailMessage = {
  to: string
  channel: "email"
  template: string
  content: { subject: string; text: string }
  data: Record<string, unknown>
}

/**
 * Confirmation email to the customer + a copy to the farm, then the
 * `booking.confirmed` event. Sent the moment a booking becomes confirmed —
 * which for card payments is after the card clears, not when seats are held.
 *
 * Delivered by the Notification module's email provider: SMTP
 * (src/modules/smtp-notification) when configured, otherwise the log-only
 * `notification-local`. Never throws — the booking is already confirmed and
 * paid, and a mail problem must not undo that.
 */
export async function announceBooking(
  container: MedusaContainer,
  booking: BookingRow,
): Promise<void> {
  const logger = container.resolve("logger")
  const bookings = bookingsOf(container)
  const adminEmail = process.env.BOOKING_ADMIN_EMAIL || "info@orosmaxaira.com"
  const messages: EmailMessage[] = []

  try {
    const slot = (await bookings.retrieveAvailabilitySlot(booking.slot_id).catch(() => null)) as {
      date?: string
      start_time?: string
    } | null
    const when = slot ? `${slot.date} στις ${slot.start_time}` : ""
    const people = `${booking.adults} ενήλικες, ${booking.children} παιδιά, ${booking.infants} βρέφη`
    const money = `${Number(booking.total_amount).toFixed(2)} ${String(booking.currency ?? "eur").toUpperCase()}`
    const contact = `${booking.customer_name} (${booking.email}${booking.phone ? ", " + booking.phone : ""})`

    if (booking.workshop_id) {
      const [workshop] = await bookings.listWorkshops({ id: booking.workshop_id })
      const title = workshop?.title ?? ""
      const combos = booking.combo_label ?? ""
      const data = {
        reference: booking.reference,
        workshop: title,
        combo: combos,
        when,
        people,
        total: money,
        customer_name: booking.customer_name,
      }
      messages.push(
        {
          to: booking.email,
          channel: "email",
          template: "workshop-booking-confirmation",
          content: {
            subject: `Επιβεβαίωση κράτησης ${booking.reference} — ${title}`,
            text: `Ευχαριστούμε ${booking.customer_name}! Η κράτησή σας για το εργαστήρι «${title}» (${combos}) στις ${when} επιβεβαιώθηκε. Άτομα: ${people}. Σύνολο: ${money}. Κωδικός κράτησης: ${booking.reference}.`,
          },
          data,
        },
        {
          to: adminEmail,
          channel: "email",
          template: "workshop-booking-notification",
          content: {
            subject: `Νέα κράτηση εργαστηρίου ${booking.reference} — ${title}`,
            text: `Νέα κράτηση εργαστηρίου: ${title} (${combos}), ${when}. Άτομα: ${people}. Σύνολο ${money}. Πελάτης: ${contact}.`,
          },
          data,
        },
      )
    } else {
      const [activity] = await bookings.listActivities({ id: booking.activity_id ?? "" })
      const title = activity?.title ?? ""
      const data = {
        reference: booking.reference,
        activity: title,
        when,
        people,
        total: money,
        customer_name: booking.customer_name,
      }
      messages.push(
        {
          to: booking.email,
          channel: "email",
          template: "booking-confirmation",
          content: {
            subject: `Επιβεβαίωση κράτησης ${booking.reference} — ${title}`,
            text: `Ευχαριστούμε ${booking.customer_name}! Η κράτησή σας για «${title}» στις ${when} επιβεβαιώθηκε. Άτομα: ${people}. Σύνολο: ${money}. Κωδικός κράτησης: ${booking.reference}.`,
          },
          data,
        },
        {
          to: adminEmail,
          channel: "email",
          template: "booking-notification",
          content: {
            subject: `Νέα κράτηση ${booking.reference} — ${title}`,
            text: `Νέα κράτηση: ${title}, ${when}. ${people}. Σύνολο ${money}. Πελάτης: ${contact}.`,
          },
          data,
        },
      )
    }
  } catch (e: unknown) {
    logger.warn(`Booking email for ${booking.reference} not prepared: ${(e as Error)?.message ?? e}`)
  }

  // One send per recipient: if the customer's address is refused — e.g. while
  // the sending domain is still unverified — the farm must still get its copy,
  // and the other way round.
  if (messages.length) {
    const notification = container.resolve<any>(Modules.NOTIFICATION)
    for (const message of messages) {
      try {
        await notification.createNotifications(message)
      } catch (e: unknown) {
        logger.warn(
          `Booking email "${message.template}" to ${message.to} not sent: ${(e as Error)?.message ?? e}`,
        )
      }
    }
  }

  try {
    await container
      .resolve<any>(Modules.EVENT_BUS)
      .emit({ name: "booking.confirmed", data: { id: booking.id } })
  } catch {
    /* non-fatal */
  }
}
