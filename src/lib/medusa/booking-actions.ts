'use server'

import { sdk } from './client'
import { getAvailability, type AvailabilitySlot } from './activities'
import { getWorkshopAvailability } from './workshops'

/** Availability for a visible month, called from the booking modal. */
export async function getMonthAvailability(
  slug: string,
  from: string,
  to: string,
): Promise<{ slots: AvailabilitySlot[]; currency: string }> {
  return getAvailability(slug, from, to)
}

/** Workshop availability for a visible range, called from the workshop modal. */
export async function getWorkshopMonthAvailability(
  slug: string,
  from: string,
  to: string,
): Promise<{ slots: AvailabilitySlot[]; currency: string }> {
  return getWorkshopAvailability(slug, from, to)
}

export type CreateBookingInput = {
  slug: string
  slot_id: string
  customer: { name: string; email: string; phone?: string }
  adults: number
  children: number
  infants: number
  notes?: string
  idempotency_key: string
}

export type ConfirmedBooking = {
  reference: string
  status: string
  total_amount: number
  currency: string
  adults: number
  children: number
  infants: number
  email: string
  activity_title?: string
  date?: string
  start_time?: string
}

/**
 * A card payment still to be taken. Present when the backend has Stripe and the
 * total is above €0: the seats are already held and the booking is `pending`
 * until the browser confirms the card against `client_secret`.
 */
export type BookingPayment = { client_secret: string; hold_minutes: number }

export type BookingResult =
  | { ok: true; booking: ConfirmedBooking; payment?: BookingPayment }
  | { ok: false; error: string }

/** Create a booking (reserve → open payment → confirm) via the Medusa store API. */
export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  try {
    const r = await sdk.client.fetch<{ booking: ConfirmedBooking; payment?: BookingPayment }>(
      '/store/bookings',
      { method: 'POST', body: input },
    )
    return { ok: true, booking: r.booking, payment: r.payment }
  } catch (e: unknown) {
    return { ok: false, error: extractMessage(e) }
  }
}

export type CreateWorkshopBookingInput = {
  slug: string
  slot_id: string
  combo_key: string
  customer: { name: string; email: string; phone?: string }
  adults: number
  children: number
  infants: number
  notes?: string
  idempotency_key: string
}

export type ConfirmedWorkshopBooking = {
  reference: string
  status: string
  total_amount: number
  currency: string
  adults: number
  children: number
  infants: number
  combo_label?: string
  email: string
  workshop_title?: string
  date?: string
  start_time?: string
}

export type WorkshopBookingResult =
  | { ok: true; booking: ConfirmedWorkshopBooking; payment?: BookingPayment }
  | { ok: false; error: string }

/** Create a workshop booking (combo × people-by-age) via the Medusa store API. */
export async function createWorkshopBooking(
  input: CreateWorkshopBookingInput,
): Promise<WorkshopBookingResult> {
  const { slug, ...body } = input
  try {
    const r = await sdk.client.fetch<{
      booking: ConfirmedWorkshopBooking
      payment?: BookingPayment
    }>(`/store/workshops/${slug}/bookings`, { method: 'POST', body })
    return { ok: true, booking: r.booking, payment: r.payment }
  } catch (e: unknown) {
    return { ok: false, error: extractMessage(e) }
  }
}

/** Identifies a held booking to the server: its reference plus the idempotency
 *  key, whose random part only the browser that created the booking knows. */
export type BookingHold = { reference: string; idempotency_key: string }

/**
 * Finish a card booking once Stripe has taken the payment. The server confirms
 * only if Stripe agrees the intent succeeded. Works for activity and workshop
 * bookings; the result carries whichever title applies.
 */
export async function confirmBookingPayment(
  hold: BookingHold,
): Promise<
  { ok: true; booking: ConfirmedBooking & ConfirmedWorkshopBooking } | { ok: false; error: string }
> {
  try {
    const r = await sdk.client.fetch<{ booking: ConfirmedBooking & ConfirmedWorkshopBooking }>(
      '/store/bookings/confirm',
      { method: 'POST', body: hold },
    )
    return { ok: true, booking: r.booking }
  } catch (e: unknown) {
    return { ok: false, error: extractMessage(e) }
  }
}

/**
 * Give the held seats back — Back or close during the payment step. Fire and
 * forget: if this never arrives, the server's hold sweep releases them anyway.
 */
export async function releaseBookingHold(hold: BookingHold): Promise<void> {
  try {
    await sdk.client.fetch('/store/bookings/release', { method: 'POST', body: hold })
  } catch {
    // ignore — expired holds are settled server-side (release-stale-bookings)
  }
}

/** Pull a human message out of the SDK's FetchError (falls back to Greek copy). */
function extractMessage(e: unknown): string {
  const err = e as {
    message?: string
    statusText?: string
    response?: { data?: { message?: string } }
  }
  return (
    err?.response?.data?.message ||
    err?.message ||
    'Δεν ήταν δυνατή η ολοκλήρωση της κράτησης. Δοκιμάστε ξανά.'
  )
}
