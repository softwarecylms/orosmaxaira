import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container } from "@medusajs/ui"
import { SalesSummary, variationColumns, type VariationRow } from "../../../components/analytics/columns"
import { DataTable } from "../../../components/analytics/data-table"
import {
  ChartCard,
  KpiTiles,
  Loading,
  ProductFilter,
  ReportHeader,
  useReportPage,
  useSelectedMetric,
} from "../../../components/analytics/report"

const KPIS = ["items_sold", "net_sales", "orders"]

/** Sales of the products that come in more than one variant (sizes, packs…). */
const VariationsPage = () => {
  const page = useReportPage<VariationRow>("variations")
  const [metric, setMetric] = useSelectedMetric(page, KPIS)
  const { data, loading } = page

  return (
    <div className="flex flex-col gap-y-3">
      <ReportHeader
        page={page}
        title="Παραλλαγές"
        description="Πωλήσεις ανά παραλλαγή, για τα προϊόντα που έχουν περισσότερες από μία (π.χ. μεγέθη)."
        filters={<ProductFilter page={page} />}
      />
      <KpiTiles page={page} metrics={KPIS} selected={metric} onSelect={setMetric} />
      <ChartCard page={page} metrics={[metric]} />
      <Container className="p-0">
        {!data ? (
          <Loading />
        ) : (
          <DataTable
            title="Παραλλαγές"
            rows={data.rows}
            columns={variationColumns}
            rowKey={(r) => r.id}
            defaultSort={{ key: "items_sold", desc: true }}
            searchText={(r) => `${r.title} ${r.variant_title} ${r.sku}`}
            searchPlaceholder="Αναζήτηση παραλλαγής…"
            filename={`analytics-variations-${data.range.from}_${data.range.to}.csv`}
            dimmed={loading}
            summary={<SalesSummary count={data.rows.length} noun={["παραλλαγή", "παραλλαγές"]} totals={data.totals.current} />}
          />
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Παραλλαγές",
  rank: 4,
})

export default VariationsPage
