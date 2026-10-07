import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { sdk } from "./sdk"

/**
 * Shared types, labels and helpers for «Αναλύσεις» (routes/analytics/*,
 * components/analytics/*). The backend (src/lib/analytics) resolves the date
 * ranges and does all the arithmetic; this side only asks and displays.
 */

// ---------------------------------------------------------------------------
// API types
// ---------------------------------------------------------------------------

export type Totals = Record<string, number>
export type DateRange = { from: string; to: string }

export type IntervalRow = {
  key: string
  from: string
  to: string
  current: Totals
  previous: Totals | null
  previous_from: string | null
  previous_to: string | null
}

export type Leaderboards = {
  products: { id: string; product_id: string | null; title: string; items_sold: number; net_sales: number }[]
  categories: { id: string; category_id: string | null; name: string; items_sold: number; net_sales: number }[]
  coupons: { code: string; orders: number; amount: number }[]
  customers: { name: string; email: string; orders: number; total: number }[]
}

export type ReportData<Row = any> = {
  report: string
  period: string
  compare: string
  range: DateRange
  compare_range: DateRange
  interval: string
  intervals_allowed: string[]
  product_id: string | null
  vat_rate: number
  totals: { current: Totals; previous: Totals }
  intervals: IntervalRow[]
  rows: Row[]
  rows_kind: string
  leaderboards?: Leaderboards
  products?: { id: string; title: string }[]
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const PRESETS: [key: string, label: string][] = [
  ["today", "Σήμερα"],
  ["yesterday", "Χθες"],
  ["week", "Εβδομάδα μέχρι σήμερα"],
  ["last_week", "Προηγούμενη εβδομάδα"],
  ["month", "Μήνας μέχρι σήμερα"],
  ["last_month", "Προηγούμενος μήνας"],
  ["quarter", "Τρίμηνο μέχρι σήμερα"],
  ["last_quarter", "Προηγούμενο τρίμηνο"],
  ["year", "Έτος μέχρι σήμερα"],
  ["last_year", "Προηγούμενο έτος"],
]
export const PERIOD_LABELS: Record<string, string> = { ...Object.fromEntries(PRESETS), custom: "Προσαρμοσμένη περίοδος" }

export const COMPARE_MODES: [key: string, label: string][] = [
  ["previous_period", "Προηγούμενη περίοδος"],
  ["previous_year", "Ίδια περίοδος πέρσι"],
]
export const COMPARE_LABELS: Record<string, string> = Object.fromEntries(COMPARE_MODES)

export const INTERVAL_LABELS: Record<string, string> = {
  hour: "Ανά ώρα",
  day: "Ανά ημέρα",
  week: "Ανά εβδομάδα",
  month: "Ανά μήνα",
  quarter: "Ανά τρίμηνο",
  year: "Ανά έτος",
}

export type MetricKind = "money" | "number" | "decimal"

export type Metric = {
  label: string
  kind: MetricKind
  /** Whether a rise is good news (green), bad (red) or neither (grey). */
  direction: "up" | "down" | "neutral"
  hint?: string
}

export const METRICS: Record<string, Metric> = {
  total_sales: {
    label: "Συνολικές πωλήσεις",
    kind: "money",
    direction: "up",
    hint: "Καθαρές πωλήσεις συν μεταφορικά: όσα πλήρωσαν οι πελάτες, μετά τις επιστροφές χρημάτων.",
  },
  net_sales: {
    label: "Καθαρές πωλήσεις",
    kind: "money",
    direction: "up",
    hint: "Τα προϊόντα μετά από εκπτώσεις και επιστροφές χρημάτων, χωρίς μεταφορικά.",
  },
  gross_sales: { label: "Μικτές πωλήσεις", kind: "money", direction: "up", hint: "Τα προϊόντα πριν από εκπτώσεις και επιστροφές." },
  refunds: {
    label: "Επιστροφές χρημάτων",
    kind: "money",
    direction: "down",
    hint: "Η αξία προϊόντων που επιστράφηκε στον πελάτη. Μια επιστροφή μεταφορικών μειώνει τα μεταφορικά.",
  },
  coupons: { label: "Εκπτώσεις", kind: "money", direction: "neutral", hint: "Κουπόνια και αυτόματες προσφορές στα προϊόντα." },
  shipping: { label: "Μεταφορικά", kind: "money", direction: "neutral" },
  taxes: {
    label: "ΦΠΑ",
    kind: "money",
    direction: "neutral",
    hint: "Ο ΦΠΑ που περιλαμβάνεται στις τιμές, με τον συντελεστή των τιμολογίων.",
  },
  order_tax: { label: "ΦΠΑ προϊόντων", kind: "money", direction: "neutral" },
  shipping_tax: { label: "ΦΠΑ μεταφορικών", kind: "money", direction: "neutral" },
  orders: { label: "Παραγγελίες", kind: "number", direction: "up" },
  items_sold: { label: "Τεμάχια που πουλήθηκαν", kind: "number", direction: "up" },
  variations_sold: {
    label: "Παραλλαγές που πουλήθηκαν",
    kind: "number",
    direction: "up",
    hint: "Τεμάχια από προϊόντα με περισσότερες από μία παραλλαγές (π.χ. μεγέθη).",
  },
  avg_order_value: { label: "Μέση αξία παραγγελίας", kind: "money", direction: "up", hint: "Καθαρές πωλήσεις διά παραγγελίες." },
  avg_items_per_order: { label: "Τεμάχια ανά παραγγελία", kind: "decimal", direction: "up" },
  discounted_orders: { label: "Παραγγελίες με έκπτωση", kind: "number", direction: "neutral" },
  discount_amount: { label: "Ποσό εκπτώσεων", kind: "money", direction: "neutral" },
}

export const ORDER_STATUS: Record<string, { label: string; color: "grey" | "blue" | "orange" | "green" | "red" | "purple" }> = {
  pending: { label: "Εκκρεμεί", color: "orange" },
  fulfilled: { label: "Έτοιμη για αποστολή", color: "blue" },
  shipped: { label: "Απεστάλη", color: "blue" },
  delivered: { label: "Παραδόθηκε", color: "green" },
  completed: { label: "Ολοκληρώθηκε", color: "green" },
  canceled: { label: "Ακυρώθηκε", color: "red" },
  other: { label: "Άλλη", color: "grey" },
}

export const PRODUCT_STATUS: Record<string, { label: string; color: "grey" | "green" | "orange" | "red" }> = {
  published: { label: "Δημοσιευμένο", color: "green" },
  draft: { label: "Πρόχειρο", color: "grey" },
  proposed: { label: "Προτεινόμενο", color: "orange" },
  rejected: { label: "Απορρίφθηκε", color: "red" },
  deleted: { label: "Διαγραμμένο", color: "grey" },
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const MONEY = new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" })
const MONEY_ROUND = new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
const NUMBER = new Intl.NumberFormat("el-GR", { maximumFractionDigits: 0 })
const DECIMAL = new Intl.NumberFormat("el-GR", { maximumFractionDigits: 2 })

export const money = (n: number) => MONEY.format(n || 0)
export const number = (n: number) => NUMBER.format(n || 0)

export const formatMetric = (kind: MetricKind, n: number) =>
  kind === "money" ? MONEY.format(n || 0) : kind === "decimal" ? DECIMAL.format(n || 0) : NUMBER.format(n || 0)

/** Axis ticks: whole euros once the step allows it. */
export const formatTick = (kind: MetricKind, n: number, step: number) =>
  kind === "money" ? (step >= 1 ? MONEY_ROUND.format(n) : MONEY.format(n)) : DECIMAL.format(n)

const utc = (date: string) => new Date(`${date}T00:00:00Z`)
const DAY_MONTH = new Intl.DateTimeFormat("el-GR", { day: "numeric", month: "short", timeZone: "UTC" })
// formatRange is ES2021; the admin's TypeScript lib stops at ES2020.
const DAY_MONTH_YEAR = new Intl.DateTimeFormat("el-GR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) as Intl.DateTimeFormat & {
  formatRange(start: Date, end: Date): string
}
const MONTH_YEAR = new Intl.DateTimeFormat("el-GR", { month: "short", year: "numeric", timeZone: "UTC" })
const DATE_TIME = new Intl.DateTimeFormat("el-GR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Nicosia" })

/** "1–7 Οκτ 2026", "28 Σεπ – 4 Οκτ 2026", "7 Οκτ 2026". */
export function formatRange(r: DateRange | { from: string | null; to: string | null }) {
  if (!r.from || !r.to) return ""
  if (r.from === r.to) return DAY_MONTH_YEAR.format(utc(r.from))
  return DAY_MONTH_YEAR.formatRange(utc(r.from), utc(r.to))
}

export const formatDate = (date: string) => DAY_MONTH_YEAR.format(utc(date))
export const formatDateTime = (iso: string) => DATE_TIME.format(new Date(iso))

// Swedish formatting is ISO-shaped ("2026-09-10 11:59") — what spreadsheets read best.
const CSV_DATE_TIME = new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Nicosia" })
/** A timestamp for a CSV cell, in Cyprus time. */
export const csvDateTime = (iso: string) => CSV_DATE_TIME.format(new Date(iso))

/** The short x-axis label of a bucket; a week cut by the range starts where the range does. */
export function bucketLabel(b: { key: string; from: string }, interval: string) {
  const { key } = b
  if (interval === "hour") return `${key.slice(11, 13)}:00`
  if (interval === "year") return key.slice(0, 4)
  if (interval === "quarter") return `Τ${Math.floor((Number(key.slice(5, 7)) - 1) / 3) + 1} ${key.slice(0, 4)}`
  if (interval === "month") return MONTH_YEAR.format(utc(key))
  return DAY_MONTH.format(utc(b.from))
}

/** The full name of a bucket, for tooltips and the revenue table. */
export function bucketTitle(b: { key: string; from: string; to: string }, interval: string) {
  if (interval === "hour") return `${formatDate(b.from)}, ${b.key.slice(11, 13)}:00`
  if (interval === "day") return formatDate(b.from)
  return formatRange(b)
}

/** Percentage change, or null when there is nothing to compare with. */
export function delta(current: number, previous: number | undefined) {
  if (previous === undefined) return null
  if (!previous) return current ? null : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

/** Error text from a failed admin request. */
export const errorText = (e: unknown) => (e instanceof Error ? e.message : "Κάτι πήγε στραβά.")

// ---------------------------------------------------------------------------
// URL state
// ---------------------------------------------------------------------------

const RANGE_KEYS = ["period", "compare", "after", "before"] as const
const API_KEYS = [...RANGE_KEYS, "interval", "product_id"] as const
const STORAGE_KEY = "oros-analytics-range"

function storedRange(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

/**
 * The report's filters live in the URL, so a view can be bookmarked or sent.
 * The sidebar links carry no query, so arriving that way reuses the last range
 * picked in this tab — moving from Products to Orders keeps the dates.
 */
export function useAnalyticsParams() {
  const [params, setParams] = useSearchParams()

  const effective = useMemo(() => {
    if (params.get("period")) return params
    const merged = new URLSearchParams(params)
    Object.entries(storedRange()).forEach(([k, v]) => v && merged.set(k, v))
    return merged
  }, [params])

  useEffect(() => {
    if (!params.get("period")) return
    const range = Object.fromEntries(RANGE_KEYS.map((k) => [k, params.get(k) ?? ""]))
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(range))
    } catch {
      // Storage unavailable: the range simply isn't remembered.
    }
  }, [params])

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(effective)
    Object.entries(patch).forEach(([k, v]) => (v == null || v === "" ? next.delete(k) : next.set(k, v)))
    setParams(next)
  }

  const get = (key: string) => effective.get(key)
  const apiQuery = Object.fromEntries(API_KEYS.flatMap((k) => (effective.get(k) ? [[k, effective.get(k)!]] : [])))
  return { get, update, apiQuery }
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

/** Fetch a report; the previous result stays on screen while the next one loads. */
export function useReport<Row = any>(report: string, query: Record<string, string>) {
  const [data, setData] = useState<ReportData<Row> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const key = JSON.stringify(query)

  useEffect(() => {
    let alive = true
    setLoading(true)
    sdk.client
      .fetch<ReportData<Row>>(`/admin/analytics/reports/${report}`, { method: "GET", query })
      .then((r) => {
        if (!alive) return
        setData(r)
        setError(null)
      })
      .catch((e) => alive && setError(errorText(e)))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, key])

  return { data, loading, error }
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Download rows as a CSV that Excel opens with Greek intact (UTF-8 with BOM). */
export function downloadCsv(filename: string, header: string[], rows: unknown[][]) {
  const text = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n")
  const url = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
