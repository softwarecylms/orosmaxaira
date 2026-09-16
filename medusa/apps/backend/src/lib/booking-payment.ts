import type {
  IPaymentModuleService,
  MedusaContainer,
  PaymentSessionDTO,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"
import {
  renderBookingConfirmationEmail,
  renderBookingNoticeEmail,
  longDate,
  people as peopleText,
  type BookingEmailData,
} from "./booking-email"
import { bookingDetails } from "./booking-details"

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
  locale?: string | null
}

const bookingsOf = (c: MedusaContainer) => c.resolve<BookingsModuleService>(BOOKINGS_MODULE)
const paymentOf = (c: MedusaContainer) => c.resolve<IPaymentModuleService>(Modules.PAYMENT)

/**
 * The Stripe CARD provider, or null when the backend has no key.
 *
 * The Stripe module registers one provider per payment method — pp_stripe_stripe
 * for cards, pp_stripe-bancontact_stripe, pp_stripe-blik_stripe and so on — so
 * matching "pp_stripe" alone takes whichever the database lists first (on
 * production, Bancontact). Only the card provider has "_" right after it.
 */
export async function stripeProviderId(container: MedusaContainer): Promise<string | null> {
  const providers = await paymentOf(container).listPaymentProviders({}, { take: 50 })
  return providers.find((p) => p.id.startsWith("pp_stripe_") && p.is_enabled !== false)?.id ?? null
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

/** The fields the storefront shows once a booking is confirmed — titles and the
 *  confirmation note in the customer's language. */
export async function publicBookingOf(container: MedusaContainer, booking: BookingRow) {
  const details = await bookingDetails(container, booking)
  return {
    reference: booking.reference,
    status: booking.status,
    total_amount: booking.total_amount,
    currency: booking.currency,
    adults: booking.adults,
    children: booking.children,
    infants: booking.infants,
    combo_label: details.combo ?? undefined,
    email: booking.email,
    activity_title: details.kind === "activity" ? details.title : undefined,
    workshop_title: details.kind === "workshop" ? details.title : undefined,
    confirmation_note: details.note ?? undefined,
    date: details.slot?.date,
    start_time: details.slot?.start_time,
  }
}

type EmailMessage = {
  to: string
  channel: "email"
  template: string
  content: { subject: string; text: string; html?: string }
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
  // Comma-separated: everyone at the farm who takes bookings.
  const adminEmails = (process.env.BOOKING_ADMIN_EMAIL || "info@orosmaxaira.com")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean)
  const messages: EmailMessage[] = []

  try {
    // The customer's copy in their language; the farm's always in Greek.
    const customer = await bookingDetails(container, booking)
    const farm = customer.locale === "el" ? customer : await bookingDetails(container, booking, "el")
    const slot = customer.slot
    const en = customer.locale === "en"
    const shortTime = slot?.start_time?.slice(0, 5)
    const when = (dateLocale: string, at: string) =>
      slot ? `${longDate(slot.date, dateLocale)} ${at} ${shortTime}` : ""
    const money = `${Number(booking.total_amount).toFixed(2)} ${String(booking.currency ?? "eur").toUpperCase()}`
    const contact = `${booking.customer_name} (${booking.email}${booking.phone ? ", " + booking.phone : ""})`
    const counts = { adults: booking.adults ?? 0, children: booking.children ?? 0, infants: booking.infants ?? 0 }
    // Branded HTML parts (src/lib/booking-email.ts); the text below stays as the plain part.
    const emailData = (d: typeof customer): BookingEmailData => ({
      reference: booking.reference,
      title: d.title,
      kind: d.kind,
      combo: d.combo,
      date: slot?.date,
      startTime: slot?.start_time,
      ...counts,
      // "€45,00", the way the storefront and the order emails show prices.
      total:
        String(booking.currency ?? "eur").toLowerCase() === "eur"
          ? `€${Number(booking.total_amount).toFixed(2).replace(".", d.locale === "en" ? "." : ",")}`
          : money,
      customerName: booking.customer_name,
      email: booking.email,
      phone: booking.phone,
      locale: d.locale,
      note: d.note,
    })
    const workshop = customer.kind === "workshop"
    const data = {
      reference: booking.reference,
      [workshop ? "workshop" : "activity"]: farm.title,
      ...(workshop ? { combo: farm.combo ?? "" } : {}),
      when: when("el-GR", "στις"),
      people: peopleText({ ...counts, locale: "el" }),
      total: money,
      customer_name: booking.customer_name,
      locale: customer.locale,
    }
    const program = (d: typeof customer) => (d.combo ? ` (${d.combo})` : "")

    const customerText = en
      ? `Thank you ${booking.customer_name}! Your booking for ${workshop ? "the workshop " : ""}“${customer.title}”${program(customer)} on ${when("en-GB", "at")} is confirmed. People: ${peopleText({ ...counts, locale: "en" })}. Total: ${money}. Booking reference: ${booking.reference}.`
      : `Ευχαριστούμε ${booking.customer_name}! Η κράτησή σας για ${workshop ? "το εργαστήρι " : ""}«${customer.title}»${program(customer)} ${when("el-GR", "στις")} επιβεβαιώθηκε. Άτομα: ${data.people}. Σύνολο: ${money}. Κωδικός κράτησης: ${booking.reference}.`

    messages.push(
      {
        to: booking.email,
        channel: "email",
        template: workshop ? "workshop-booking-confirmation" : "booking-confirmation",
        content: {
          subject: en
            ? `Booking confirmation ${booking.reference} — ${customer.title}`
            : `Επιβεβαίωση κράτησης ${booking.reference} — ${customer.title}`,
          text: customer.note ? `${customerText}\n\n${customer.note}` : customerText,
          html: renderBookingConfirmationEmail(emailData(customer)),
        },
        data,
      },
      {
        to: adminEmails[0], // one copy per address — see `outgoing` below
        channel: "email",
        template: workshop ? "workshop-booking-notification" : "booking-notification",
        content: {
          subject: `Νέα κράτηση ${workshop ? "εργαστηρίου " : ""}${booking.reference} — ${farm.title}`,
          text: `Νέα κράτηση${workshop ? " εργαστηρίου" : ""}: ${farm.title}${program(farm)}, ${data.when}. Άτομα: ${data.people}. Σύνολο ${money}. Πελάτης: ${contact}.`,
          html: renderBookingNoticeEmail(emailData(farm)),
        },
        data,
      },
    )
  } catch (e: unknown) {
    logger.warn(`Booking email for ${booking.reference} not prepared: ${(e as Error)?.message ?? e}`)
  }

  // One send per recipient — the farm's copy once for each BOOKING_ADMIN_EMAIL
  // address — so a refused address never stops the others, customer included.
  const outgoing = messages.flatMap((message) =>
    message.template.endsWith("-notification")
      ? adminEmails.map((to) => ({ ...message, to }))
      : [message],
  )
  if (outgoing.length) {
    const notification = container.resolve<any>(Modules.NOTIFICATION)
    for (const message of outgoing) {
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
