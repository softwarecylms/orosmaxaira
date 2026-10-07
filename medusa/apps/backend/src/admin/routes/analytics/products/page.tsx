import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container } from "@medusajs/ui"
import {
  productColumns,
  SalesSummary,
  variationColumns,
  type ProductRow,
  type VariationRow,
} from "../../../components/analytics/columns"
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

const ProductsPage = () => {
  const page = useReportPage<ProductRow | VariationRow>("products")
  const [metric, setMetric] = useSelectedMetric(page, KPIS)
  const { data, loading } = page
  const single = data?.rows_kind === "variations"
  const fileRange = data ? `${data.range.from}_${data.range.to}` : ""

  return (
    <div className="flex flex-col gap-y-3">
      <ReportHeader
        page={page}
        title="Προϊόντα"
        description="Τι πουλήθηκε: τεμάχια, καθαρές πωλήσεις και παραγγελίες ανά προϊόν."
        filters={<ProductFilter page={page} />}
      />
      <KpiTiles page={page} metrics={KPIS} selected={metric} onSelect={setMetric} />
      <ChartCard page={page} metrics={[metric]} />
      <Container className="p-0">
        {!data ? (
          <Loading />
        ) : single ? (
          <DataTable
            title={`Παραλλαγές — ${data.products?.find((p) => p.id === data.product_id)?.title ?? ""}`}
            rows={data.rows as VariationRow[]}
            columns={variationColumns}
            rowKey={(r) => r.id}
            defaultSort={{ key: "items_sold", desc: true }}
            searchText={(r) => `${r.title} ${r.variant_title} ${r.sku}`}
            filename={`analytics-product-variations-${fileRange}.csv`}
            dimmed={loading}
            summary={<SalesSummary count={data.rows.length} noun={["παραλλαγή", "παραλλαγές"]} totals={data.totals.current} />}
          />
        ) : (
          <DataTable
            title="Προϊόντα"
            rows={data.rows as ProductRow[]}
            columns={productColumns((id) => page.update({ product_id: id }))}
            rowKey={(r) => r.id}
            defaultSort={{ key: "items_sold", desc: true }}
            searchText={(r) => `${r.title} ${r.sku} ${r.categories.join(" ")}`}
            searchPlaceholder="Αναζήτηση προϊόντος…"
            filename={`analytics-products-${fileRange}.csv`}
            dimmed={loading}
            summary={<SalesSummary count={data.rows.length} noun={["προϊόν", "προϊόντα"]} totals={data.totals.current} />}
          />
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Προϊόντα",
  rank: 1,
})

export default ProductsPage
