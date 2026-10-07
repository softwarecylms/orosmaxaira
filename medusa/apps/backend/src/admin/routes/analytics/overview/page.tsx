import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Text } from "@medusajs/ui"
import { Link } from "react-router-dom"
import { money, number } from "../../../lib/analytics"
import { ChartCard, KpiTiles, Leaderboard, ReportHeader, useReportPage } from "../../../components/analytics/report"

const KPIS = ["total_sales", "net_sales", "orders", "avg_order_value", "items_sold", "variations_sold"]

/** Each figure opens the report it comes from, charted. */
const LINKS: Record<string, string> = {
  total_sales: "/analytics/revenue?chart=total_sales",
  net_sales: "/analytics/revenue?chart=net_sales",
  orders: "/analytics/orders?chart=orders",
  avg_order_value: "/analytics/orders?chart=avg_order_value",
  items_sold: "/analytics/products?chart=items_sold",
  variations_sold: "/analytics/variations?chart=items_sold",
}

const OverviewPage = () => {
  const page = useReportPage("overview")
  const lb = page.data?.leaderboards
  const dimmed = page.loading && !!page.data

  return (
    <div className="flex flex-col gap-y-3">
      <ReportHeader page={page} title="Επισκόπηση" description="Οι πωλήσεις του καταστήματος με μια ματιά." />
      <KpiTiles page={page} metrics={KPIS} links={LINKS} />
      <ChartCard page={page} metrics={["net_sales", "orders"]} />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Leaderboard
          title="Κορυφαία προϊόντα"
          rows={lb?.products ?? []}
          dimmed={dimmed}
          more={{ to: "/analytics/products", label: "Όλα τα προϊόντα" }}
          columns={[
            {
              label: "Προϊόν",
              render: (r) =>
                r.product_id ? (
                  <Link to={`/products/${r.product_id}`} className="text-ui-fg-interactive hover:underline">
                    {r.title}
                  </Link>
                ) : (
                  r.title
                ),
            },
            { label: "Τεμάχια", align: "right", render: (r) => number(r.items_sold) },
            { label: "Καθαρές πωλήσεις", align: "right", render: (r) => money(r.net_sales) },
          ]}
        />
        <Leaderboard
          title="Κορυφαίες κατηγορίες"
          rows={lb?.categories ?? []}
          dimmed={dimmed}
          more={{ to: "/analytics/categories", label: "Όλες οι κατηγορίες" }}
          columns={[
            { label: "Κατηγορία", render: (r) => r.name },
            { label: "Τεμάχια", align: "right", render: (r) => number(r.items_sold) },
            { label: "Καθαρές πωλήσεις", align: "right", render: (r) => money(r.net_sales) },
          ]}
        />
        <Leaderboard
          title="Κορυφαία κουπόνια"
          rows={lb?.coupons ?? []}
          dimmed={dimmed}
          more={{ to: "/analytics/coupons", label: "Όλα τα κουπόνια" }}
          columns={[
            { label: "Κωδικός", render: (r) => <span className="font-mono">{r.code}</span> },
            { label: "Παραγγελίες", align: "right", render: (r) => number(r.orders) },
            { label: "Έκπτωση", align: "right", render: (r) => money(r.amount) },
          ]}
        />
        <Leaderboard
          title="Κορυφαίοι πελάτες"
          rows={lb?.customers ?? []}
          dimmed={dimmed}
          more={{ to: "/analytics/orders", label: "Όλες οι παραγγελίες" }}
          columns={[
            {
              label: "Πελάτης",
              render: (r) => (
                <span className="flex flex-col">
                  <span>{r.name}</span>
                  {r.email && r.email !== r.name ? (
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {r.email}
                    </Text>
                  ) : null}
                </span>
              ),
            },
            { label: "Παραγγελίες", align: "right", render: (r) => number(r.orders) },
            { label: "Σύνολο", align: "right", render: (r) => money(r.total) },
          ]}
        />
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Επισκόπηση",
  rank: 0,
})

export default OverviewPage
