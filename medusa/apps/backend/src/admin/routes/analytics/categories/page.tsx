import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container } from "@medusajs/ui"
import { Link } from "react-router-dom"
import { SalesSummary } from "../../../components/analytics/columns"
import { DataTable, type Column } from "../../../components/analytics/data-table"
import {
  ChartCard,
  KpiTiles,
  Loading,
  ReportHeader,
  useReportPage,
  useSelectedMetric,
} from "../../../components/analytics/report"
import { money, number } from "../../../lib/analytics"

const KPIS = ["items_sold", "net_sales", "orders"]

type CategoryRow = {
  id: string
  category_id: string | null
  name: string
  items_sold: number
  net_sales: number
  products: number
  orders: number
}

const COLUMNS: Column<CategoryRow>[] = [
  {
    key: "name",
    label: "Κατηγορία",
    value: (r) => r.name,
    render: (r) =>
      r.category_id ? (
        <Link to={`/categories/${r.category_id}`} className="text-ui-fg-interactive hover:underline">
          {r.name}
        </Link>
      ) : (
        <span className="text-ui-fg-subtle">{r.name}</span>
      ),
  },
  { key: "items_sold", label: "Τεμάχια", align: "right", value: (r) => r.items_sold, render: (r) => number(r.items_sold) },
  { key: "net_sales", label: "Καθαρές πωλήσεις", align: "right", value: (r) => r.net_sales, render: (r) => money(r.net_sales) },
  { key: "products", label: "Προϊόντα", align: "right", value: (r) => r.products, render: (r) => number(r.products) },
  { key: "orders", label: "Παραγγελίες", align: "right", value: (r) => r.orders, render: (r) => number(r.orders) },
]

/** A product in two categories counts in both, as in WooCommerce. */
const CategoriesPage = () => {
  const page = useReportPage<CategoryRow>("categories")
  const [metric, setMetric] = useSelectedMetric(page, KPIS)
  const { data, loading } = page

  return (
    <div className="flex flex-col gap-y-3">
      <ReportHeader
        page={page}
        title="Κατηγορίες"
        description="Πωλήσεις ανά κατηγορία. Ένα προϊόν σε δύο κατηγορίες μετράει και στις δύο."
      />
      <KpiTiles page={page} metrics={KPIS} selected={metric} onSelect={setMetric} />
      <ChartCard page={page} metrics={[metric]} />
      <Container className="p-0">
        {!data ? (
          <Loading />
        ) : (
          <DataTable
            title="Κατηγορίες"
            rows={data.rows}
            columns={COLUMNS}
            rowKey={(r) => r.id}
            defaultSort={{ key: "items_sold", desc: true }}
            searchText={(r) => r.name}
            searchPlaceholder="Αναζήτηση κατηγορίας…"
            filename={`analytics-categories-${data.range.from}_${data.range.to}.csv`}
            dimmed={loading}
            summary={<SalesSummary count={data.rows.length} noun={["κατηγορία", "κατηγορίες"]} totals={data.totals.current} />}
          />
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Κατηγορίες",
  rank: 5,
})

export default CategoriesPage
