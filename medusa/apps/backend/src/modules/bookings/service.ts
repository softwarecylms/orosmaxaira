import {
  InjectManager,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils"
import type { Context } from "@medusajs/framework/types"
import {
  Activity,
  AvailabilitySlot,
  Booking,
  SchoolProgram,
  Workshop,
} from "./models/definitions"

type GenerateSlotsInput = {
  // Exactly one owner — a slot belongs to either an activity or a workshop.
  activityId?: string
  workshopId?: string
  weekday: number // 0 (Sun) – 6 (Sat)
  start_time: string // HH:mm
  end_time?: string | null
  capacity: number
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
  // Workshop sessions only: tags each generated slot with its experience combo
  // ("half" / "full"), so the Half and Full programs stay distinct.
  combo_key?: string | null
}

/**
 * Bookings module service. Extends the auto-generated CRUD for
 * Activity / AvailabilitySlot / Booking with:
 *  - `reserveSeats` / `releaseSeats` — a single atomic conditional UPDATE so two
 *    concurrent bookings can never oversell a slot (the generated
 *    `updateAvailabilitySlots` is a plain read-modify-write and would race).
 *  - `generateSlots` — bulk-create recurring weekly slots for a season,
 *    idempotent against the unique (activity_id, date, start_time) index.
 */
class BookingsModuleService extends MedusaService({
  Activity,
  AvailabilitySlot,
  Booking,
  Workshop,
  SchoolProgram,
}) {
  /**
   * Atomically reserve `seats` on a slot. Returns true if the reservation
   * succeeded, false if the slot is full/closed (⇒ caller responds 409).
   * The `WHERE booked_count + n <= capacity` guard is evaluated inside a single
   * statement, so interleaved requests cannot oversell.
   */
  @InjectManager()
  async reserveSeats(
    slotId: string,
    seats: number,
    @MedusaContext() sharedContext?: Context
  ): Promise<boolean> {
    if (seats <= 0) return true
    const manager = sharedContext!.manager as unknown as {
      execute: (sql: string, params?: unknown[]) => Promise<unknown>
    }
    const res = (await manager.execute(
      `UPDATE availability_slot
          SET booked_count = booked_count + ?
        WHERE id = ? AND status = 'open' AND deleted_at IS NULL
          AND booked_count + ? <= capacity
      RETURNING id`,
      [seats, slotId, seats]
    )) as { rows?: unknown[] } | unknown[]
    const rows = Array.isArray(res) ? res : (res?.rows ?? [])
    return rows.length === 1
  }

  /** Release a previously reserved `seats` count (never drops below 0). */
  @InjectManager()
  async releaseSeats(
    slotId: string,
    seats: number,
    @MedusaContext() sharedContext?: Context
  ): Promise<void> {
    if (seats <= 0) return
    const manager = sharedContext!.manager as unknown as {
      execute: (sql: string, params?: unknown[]) => Promise<unknown>
    }
    await manager.execute(
      `UPDATE availability_slot
          SET booked_count = GREATEST(booked_count - ?, 0)
        WHERE id = ?`,
      [seats, slotId]
    )
  }

  /**
   * Create weekly recurring slots (e.g. every Saturday 10:00, Mar–Oct) for an
   * activity or a workshop. Skips dates that already have a slot at the same
   * start time (idempotent against the unique owner/date/start_time index).
   */
  async generateSlots(input: GenerateSlotsInput): Promise<{
    created: number
    skipped: number
  }> {
    // Which owner column this batch writes/filters on.
    const ownerFilter: Record<string, string> = input.workshopId
      ? { workshop_id: input.workshopId }
      : { activity_id: input.activityId as string }

    const candidates: {
      activity_id?: string
      workshop_id?: string
      date: string
      start_time: string
      end_time: string | null
      capacity: number
      status: "open"
      combo_key: string | null
    }[] = []

    const start = new Date(`${input.from}T00:00:00`)
    const end = new Date(`${input.to}T00:00:00`)
    for (
      const d = new Date(start);
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      if (d.getDay() !== input.weekday) continue
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`
      candidates.push({
        ...ownerFilter,
        date,
        start_time: input.start_time,
        end_time: input.end_time ?? null,
        capacity: input.capacity,
        status: "open",
        combo_key: input.combo_key ?? null,
      })
    }

    const existing = await this.listAvailabilitySlots(ownerFilter, {
      select: ["date", "start_time"],
      take: 100000,
    })
    const seen = new Set(
      existing.map((s) => `${(s as any).date}__${(s as any).start_time}`)
    )
    const toCreate = candidates.filter(
      (s) => !seen.has(`${s.date}__${s.start_time}`)
    )
    if (toCreate.length) {
      await this.createAvailabilitySlots(toCreate)
    }
    return { created: toCreate.length, skipped: candidates.length - toCreate.length }
  }
}

export default BookingsModuleService
