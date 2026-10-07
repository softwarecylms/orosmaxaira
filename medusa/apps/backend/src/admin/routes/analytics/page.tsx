import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar } from "@medusajs/icons"
import { Navigate, useLocation } from "react-router-dom"

/**
 * «Αναλύσεις» — sales reports modelled on WooCommerce Analytics. The sidebar
 * entry opens the overview; the reports are its sub-items (ranked in the
 * WooCommerce order). Data: src/api/admin/analytics, src/lib/analytics.
 */
const AnalyticsIndex = () => {
  const { search } = useLocation()
  return <Navigate to={`/analytics/overview${search}`} replace />
}

export const config = defineRouteConfig({
  label: "Αναλύσεις",
  icon: ChartBar,
  // Sidebar order: the «Πωλήσεις» group (1–9), then «Κρατήσεις» (10+) — see medusa-config.ts.
  rank: 1,
})

export default AnalyticsIndex
