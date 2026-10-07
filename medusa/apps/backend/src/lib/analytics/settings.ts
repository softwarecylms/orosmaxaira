import type { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { COMPARE_MODES, PRESETS, type CompareMode, type Preset } from "./dates"

/**
 * «Αναλύσεις → Ρυθμίσεις», kept in the store's metadata (`analytics`) so it
 * needs no table of its own. Like WooCommerce's Analytics settings: which order
 * statuses count, the range a report opens with, and the stock alert level.
 */
export type AnalyticsSettings = {
  /** Medusa order statuses left out of every report. */
  excluded_statuses: string[]
  default_period: Preset
  default_compare: CompareMode
  /** A tracked variant with this many or fewer in stock is "low stock". */
  low_stock_threshold: number
}

/** The order statuses an order can have outside drafts, with their admin labels. */
export const ORDER_STATUSES: [status: string, label: string][] = [
  ["pending", "Σε εξέλιξη (νέες, έτοιμες, σε αποστολή)"],
  ["completed", "Ολοκληρωμένες"],
  ["requires_action", "Απαιτούν ενέργεια"],
  ["archived", "Αρχειοθετημένες"],
  ["canceled", "Ακυρωμένες"],
]

export const DEFAULT_SETTINGS: AnalyticsSettings = {
  excluded_statuses: ["canceled"],
  default_period: "month",
  default_compare: "previous_year",
  low_stock_threshold: 2,
}

const KNOWN_STATUSES = new Set(ORDER_STATUSES.map(([s]) => s))

/** Fill gaps and drop anything unknown, so a hand-edited value can never break a report. */
export function withDefaults(stored: unknown): AnalyticsSettings {
  const s = (stored && typeof stored === "object" ? stored : {}) as Record<string, unknown>
  const threshold = Number(s.low_stock_threshold)
  return {
    excluded_statuses: Array.isArray(s.excluded_statuses)
      ? s.excluded_statuses.filter((v): v is string => typeof v === "string" && KNOWN_STATUSES.has(v))
      : DEFAULT_SETTINGS.excluded_statuses,
    default_period: PRESETS.includes(s.default_period as Preset) ? (s.default_period as Preset) : DEFAULT_SETTINGS.default_period,
    default_compare: COMPARE_MODES.includes(s.default_compare as CompareMode)
      ? (s.default_compare as CompareMode)
      : DEFAULT_SETTINGS.default_compare,
    low_stock_threshold:
      Number.isFinite(threshold) && threshold >= 0 ? Math.floor(threshold) : DEFAULT_SETTINGS.low_stock_threshold,
  }
}

async function theStore(container: MedusaContainer) {
  const stores = container.resolve(Modules.STORE)
  const [store] = await stores.listStores({}, { take: 1, select: ["id", "metadata"] })
  if (!store) throw new Error("Δεν βρέθηκε κατάστημα.")
  return { stores, store }
}

export async function getAnalyticsSettings(container: MedusaContainer) {
  const { store } = await theStore(container)
  return withDefaults((store.metadata as Record<string, unknown> | null)?.analytics)
}

export async function saveAnalyticsSettings(container: MedusaContainer, input: unknown) {
  const { stores, store } = await theStore(container)
  const settings = withDefaults(input)
  // Keep every other metadata key; only `analytics` is ours.
  await stores.updateStores(store.id, { metadata: { ...(store.metadata ?? {}), analytics: settings } })
  return settings
}
