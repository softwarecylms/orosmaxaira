import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, InlineTip, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"
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

const KPIS = ["taxes", "order_tax", "shipping_tax", "orders"]

type TaxRow = { id: string; name: string; rate: number; taxes: number; order_tax: number; shipping_tax: number; orders: number }

const COLUMNS: Column<TaxRow>[] = [
  { key: "name", label: "Φόρος", value: (r) => r.name },
  { key: "rate", label: "Συντελεστής", align: "right", value: (r) => r.rate, render: (r) => `${number(r.rate)}%` },
  { key: "taxes", label: "Σύνολο ΦΠΑ", align: "right", value: (r) => r.taxes, render: (r) => money(r.taxes) },
  { key: "order_tax", label: "ΦΠΑ προϊόντων", align: "right", value: (r) => r.order_tax, render: (r) => money(r.order_tax) },
  { key: "shipping_tax", label: "ΦΠΑ μεταφορικών", align: "right", value: (r) => r.shipping_tax, render: (r) => money(r.shipping_tax) },
  { key: "orders", label: "Παραγγελίες", align: "right", value: (r) => r.orders, render: (r) => number(r.orders) },
]

/**
 * The shop's prices include VAT and its orders carry no tax lines, so the VAT
 * here is worked out from the invoice rate — the same figure each invoice prints.
 */
const TaxesPage = () => {
  const page = useReportPage<TaxRow>("taxes")
  const [metric, setMetric] = useSelectedMetric(page, KPIS)
  const { data, loading } = page

  return (
    <div className="flex flex-col gap-y-3">
      <ReportHeader page={page} title="Φόροι" description="Ο ΦΠΑ που περιλαμβάνεται στις πωλήσεις και στα μεταφορικά." />
      <InlineTip label="Πώς υπολογίζεται">
        Οι τιμές του καταστήματος περιλαμβάνουν ΦΠΑ, οπότε ο φόρος βγαίνει από το ποσό κάθε παραγγελίας με τον
        συντελεστή των τιμολογίων{data ? ` (${number(data.vat_rate)}%)` : ""}, όπως τυπώνεται και στο τιμολόγιο. Ο
        συντελεστής αλλάζει στα{" "}
        <Link to="/invoices" className="text-ui-fg-interactive hover:underline">
          Τιμολόγια → Ρυθμίσεις
        </Link>
        .
      </InlineTip>
      <KpiTiles page={page} metrics={KPIS} selected={metric} onSelect={setMetric} />
      <ChartCard page={page} metrics={[metric]} />
      <Container className="p-0">
        {!data ? (
          <Loading />
        ) : (
          <DataTable
            title="Φόροι"
            rows={data.rows}
            columns={COLUMNS}
            rowKey={(r) => r.id}
            defaultSort={{ key: "taxes", desc: true }}
            filename={`analytics-taxes-${data.range.from}_${data.range.to}.csv`}
            dimmed={loading}
            summary={
              <>
                <Text size="small">
                  <strong>{money(data.totals.current.taxes)}</strong> σύνολο ΦΠΑ
                </Text>
                <Text size="small">
                  <strong>{number(data.totals.current.orders)}</strong> παραγγελίες
                </Text>
              </>
            }
          />
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Φόροι",
  rank: 7,
})

export default TaxesPage
