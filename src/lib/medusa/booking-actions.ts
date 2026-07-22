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

export type BookingResult =
  | { ok: true; booking: ConfirmedBooking }
  | { ok: false; error: string }

/** Create a booking (reserve → pay → confirm) via the Medusa store API. */
export async function createBooking(
  input: CreateBookingInput,
): Promise<BookingResult> {
  try {
    const r = await sdk.client.fetch<{ booking: ConfirmedBooking }>(
      '/store/bookings',
      { method: 'POST', body: input },
    )
    return { ok: true, booking: r.booking }
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
  | { ok: true; booking: ConfirmedWorkshopBooking }
  | { ok: false; error: string }

/** Create a workshop booking (combo × people-by-age) via the Medusa store API. */
export async function createWorkshopBooking(
  input: CreateWorkshopBookingInput,
): Promise<WorkshopBookingResult> {
  const { slug, ...body } = input
  try {
    const r = await sdk.client.fetch<{ booking: ConfirmedWorkshopBooking }>(
      `/store/workshops/${slug}/bookings`,
      { method: 'POST', body },
    )
    return { ok: true, booking: r.booking }
  } catch (e: unknown) {
    return { ok: false, error: extractMessage(e) }
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
