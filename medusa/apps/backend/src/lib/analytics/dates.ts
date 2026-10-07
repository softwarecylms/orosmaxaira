/**
 * Dates for «Αναλύσεις». Every range is a pair of inclusive calendar dates
 * ("2026-10-01" … "2026-10-07") in the shop's time zone, the way WooCommerce
 * Analytics works: "today" and the day buckets follow Cyprus time, not UTC.
 */

export const TIMEZONE = "Europe/Nicosia"

export const PRESETS = [
  "today",
  "yesterday",
  "week",
  "last_week",
  "month",
  "last_month",
  "quarter",
  "last_quarter",
  "year",
  "last_year",
] as const
export type Preset = (typeof PRESETS)[number]
export type Period = Preset | "custom"

export const COMPARE_MODES = ["previous_period", "previous_year"] as const
export type CompareMode = (typeof COMPARE_MODES)[number]

export const INTERVALS = ["hour", "day", "week", "month", "quarter", "year"] as const
export type Interval = (typeof INTERVALS)[number]

export type DateRange = { from: string; to: string }
export type Bucket = { key: string; from: string; to: string }

const DAY_MS = 86_400_000
/** The longest custom range accepted, so a typo cannot ask for a century of orders. */
const MAX_DAYS = 3 * 366

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const parse = (date: string) => {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
const format = (d: Date) => d.toISOString().slice(0, 10)

export const isDate = (v: unknown): v is string => typeof v === "string" && DATE_RE.test(v) && format(parse(v)) === v

export const addDays = (date: string, n: number) => format(new Date(parse(date).getTime() + n * DAY_MS))

/** Inclusive length of a range in days. */
export const spanDays = (r: DateRange) => Math.round((parse(r.to).getTime() - parse(r.from).getTime()) / DAY_MS) + 1

const daysInMonth = (y: number, m0: number) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate()

/** The same day n months away, clamped to the month's length (31 Mar − 1 month = 28/29 Feb). */
export function addMonths(date: string, n: number) {
  const d = parse(date)
  const total = d.getUTCFullYear() * 12 + d.getUTCMonth() + n
  const y = Math.floor(total / 12)
  const m0 = total - y * 12
  return format(new Date(Date.UTC(y, m0, Math.min(d.getUTCDate(), daysInMonth(y, m0)))))
}

/** Monday of the date's week (Cyprus weeks start on Monday). */
const startOfWeek = (date: string) => addDays(date, -((parse(date).getUTCDay() + 6) % 7))
const startOfMonth = (date: string) => `${date.slice(0, 7)}-01`
const startOfQuarter = (date: string) => {
  const m0 = Number(date.slice(5, 7)) - 1
  return `${date.slice(0, 4)}-${String(m0 - (m0 % 3) + 1).padStart(2, "0")}-01`
}
const startOfYear = (date: string) => `${date.slice(0, 4)}-01-01`

/** First day of the bucket the date falls in. */
export function bucketStart(date: string, interval: Exclude<Interval, "hour">) {
  switch (interval) {
    case "day":
      return date
    case "week":
      return startOfWeek(date)
    case "month":
      return startOfMonth(date)
    case "quarter":
      return startOfQuarter(date)
    case "year":
      return startOfYear(date)
  }
}

const nextBucket = (start: string, interval: Exclude<Interval, "hour">) =>
  interval === "day"
    ? addDays(start, 1)
    : interval === "week"
      ? addDays(start, 7)
      : addMonths(start, interval === "month" ? 1 : interval === "quarter" ? 3 : 12)

// ---------------------------------------------------------------------------
// Time zone
// ---------------------------------------------------------------------------

const PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

function zoned(instant: Date) {
  const parts = Object.fromEntries(PARTS.formatToParts(instant).map((p) => [p.type, p.value]))
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    /** The wall-clock time read as if it were UTC — its distance from the instant is the zone offset. */
    asUtc: Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second)),
  }
}

/** Calendar date and hour of an instant in Cyprus. */
export function localDateHour(instant: Date) {
  const { date, hour } = zoned(instant)
  return { date, hour }
}

export const today = () => zoned(new Date()).date

/** The instant Cyprus midnight starts the given date (handles the DST switch). */
export function zonedMidnight(date: string) {
  const guess = parse(date).getTime()
  const offset = (t: number) => zoned(new Date(t)).asUtc - Math.floor(t / 1000) * 1000
  const first = guess - offset(guess)
  return new Date(guess - offset(first))
}

/** [start, end) instants covering the inclusive date range. */
export const instants = (r: DateRange) => ({ start: zonedMidnight(r.from), end: zonedMidnight(addDays(r.to, 1)) })

// ---------------------------------------------------------------------------
// Presets and comparison
// ---------------------------------------------------------------------------

export function presetRange(preset: Preset, now = today()): DateRange {
  switch (preset) {
    case "today":
      return { from: now, to: now }
    case "yesterday": {
      const y = addDays(now, -1)
      return { from: y, to: y }
    }
    case "week":
      return { from: startOfWeek(now), to: now }
    case "last_week": {
      const from = addDays(startOfWeek(now), -7)
      return { from, to: addDays(from, 6) }
    }
    case "month":
      return { from: startOfMonth(now), to: now }
    case "last_month": {
      const from = addMonths(startOfMonth(now), -1)
      return { from, to: addDays(startOfMonth(now), -1) }
    }
    case "quarter":
      return { from: startOfQuarter(now), to: now }
    case "last_quarter": {
      const from = addMonths(startOfQuarter(now), -3)
      return { from, to: addDays(startOfQuarter(now), -1) }
    }
    case "year":
      return { from: startOfYear(now), to: now }
    case "last_year": {
      const from = addMonths(startOfYear(now), -12)
      return { from, to: addDays(startOfYear(now), -1) }
    }
  }
}

/** Months a calendar preset steps back for "previous period" (0 = step back by its length in days). */
const PRESET_MONTHS: Partial<Record<Period, number>> = {
  month: 1,
  last_month: 1,
  quarter: 3,
  last_quarter: 3,
  year: 12,
  last_year: 12,
}

/**
 * The range a period is compared with. "Previous year" is the same dates a year
 * earlier; "previous period" is the same stretch of the previous week, month,
 * quarter or year for those presets (1–7 Oct → 1–7 Sep) and otherwise the
 * equally long span right before.
 */
export function compareRange(period: Period, range: DateRange, mode: CompareMode): DateRange {
  if (mode === "previous_year") return { from: addMonths(range.from, -12), to: addMonths(range.to, -12) }
  const months = PRESET_MONTHS[period]
  if (months) {
    const from = addMonths(range.from, -months)
    const unitEnd = addDays(addMonths(from, months), -1)
    // A whole month/quarter/year compares with the whole previous one, whatever its length.
    const whole = period.startsWith("last_")
    const to = whole ? unitEnd : addMonths(range.to, -months)
    return { from, to: to > unitEnd ? unitEnd : to }
  }
  // Week to date (Mon–Wed) compares with Mon–Wed of the week before.
  if (period === "week") return { from: addDays(range.from, -7), to: addDays(range.to, -7) }
  const days = spanDays(range)
  return { from: addDays(range.from, -days), to: addDays(range.from, -1) }
}

/** Resolve the request's period into concrete dates. Throws a message fit for the admin on bad input. */
export function resolvePeriod(period: Period, after?: unknown, before?: unknown): DateRange {
  if (period !== "custom") return presetRange(period)
  if (!isDate(after) || !isDate(before)) throw new Error("Επιλέξτε έγκυρες ημερομηνίες έναρξης και λήξης.")
  const range = after <= before ? { from: after, to: before } : { from: before, to: after }
  if (spanDays(range) > MAX_DAYS) throw new Error("Η περίοδος μπορεί να είναι έως τρία χρόνια.")
  return range
}

// ---------------------------------------------------------------------------
// Intervals
// ---------------------------------------------------------------------------

/** The intervals that make sense for a range, and the one picked by default — like WooCommerce. */
export function intervalsFor(range: DateRange): { allowed: Interval[]; fallback: Interval } {
  const days = spanDays(range)
  if (days === 1) return { allowed: ["hour", "day"], fallback: "hour" }
  if (days <= 7) return { allowed: ["day"], fallback: "day" }
  if (days <= 31) return { allowed: ["day", "week"], fallback: "day" }
  if (days <= 92) return { allowed: ["day", "week", "month"], fallback: "week" }
  if (days <= 366) return { allowed: ["day", "week", "month", "quarter"], fallback: "month" }
  return { allowed: ["week", "month", "quarter", "year"], fallback: "month" }
}

/** The buckets covering a range; the first and last are clipped to it. */
export function bucketsFor(range: DateRange, interval: Interval): Bucket[] {
  if (interval === "hour") {
    return Array.from({ length: 24 }, (_, h) => {
      const key = `${range.from}T${String(h).padStart(2, "0")}`
      return { key, from: range.from, to: range.from }
    })
  }
  const out: Bucket[] = []
  for (let start = bucketStart(range.from, interval); start <= range.to; start = nextBucket(start, interval)) {
    const end = addDays(nextBucket(start, interval), -1)
    out.push({ key: start, from: start < range.from ? range.from : start, to: end > range.to ? range.to : end })
  }
  return out
}

/** The bucket key an order placed on that local date/hour belongs to. */
export const bucketKey = (date: string, hour: number, interval: Interval) =>
  interval === "hour" ? `${date}T${String(hour).padStart(2, "0")}` : bucketStart(date, interval)
