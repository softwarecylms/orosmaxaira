import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Text } from "@medusajs/ui"
import type { Column } from "../../../components/analytics/data-table"
import { DataTable } from "../../../components/analytics/data-table"
import {
  ChartCard,
  KpiTiles,
  Loading,
  ReportHeader,
  useReportPage,
  useSelectedMetric,
} from "../../../components/analytics/report"
import { bucketTitle, money, number, type IntervalRow } from "../../../lib/analytics"

const KPIS = ["gross_sales", "refunds", "coupons", "net_sales", "taxes", "shipping", "total_sales"]

const MONEY_COLUMNS: [key: string, label: string][] = [
  ["gross_sales", "Μικτές πωλήσεις"],
  ["refunds", "Επιστροφές χρημάτων"],
  ["coupons", "Εκπτώσεις"],
  ["net_sales", "Καθαρές πωλήσεις"],
  ["taxes", "ΦΠΑ"],
  ["shipping", "Μεταφορικά"],
  ["total_sales", "Συνολικές πωλήσεις"],
]

/** Gross → net → total, per day/week/month: how the takings add up. */
const RevenuePage = () => {
  const page = useReportPage("revenue")
  const [metric, setMetric] = useSelectedMetric(page, KPIS)
  const { data, loading } = page

  const columns: Column<IntervalRow>[] = [
    {
      key: "date",
      label: "Περίοδος",
      value: (r) => r.key,
      render: (r) => bucketTitle(r, data?.interval ?? "day"),
      csv: (r) => (r.from === r.to ? r.from : `${r.from} – ${r.to}`),
    },
    { key: "orders", label: "Παραγγελίες", align: "right", value: (r) => r.current.orders, render: (r) => number(r.current.orders) },
    ...MONEY_COLUMNS.map(
      ([key, label]): Column<IntervalRow> => ({
        key,
        label,
        align: "right",
        value: (r) => r.current[key],
        render: (r) => money(r.current[key]),
      })
    ),
  ]

  return (
    <div className="flex flex-col gap-y-3">
      <ReportHeader
        page={page}
        title="Έσοδα"
        description="Από τις μικτές στις συνολικές πωλήσεις: εκπτώσεις, επιστροφές, ΦΠΑ και μεταφορικά."
      />
      <KpiTiles page={page} metrics={KPIS} selected={metric} onSelect={setMetric} />
      <ChartCard page={page} metrics={[metric]} />
      <Container className="p-0">
        {!data ? (
          <Loading />
        ) : (
          <DataTable
            title="Έσοδα"
            rows={data.intervals}
            columns={columns}
            rowKey={(r) => r.key}
            defaultSort={{ key: "date", desc: true }}
            filename={`analytics-revenue-${data.range.from}_${data.range.to}.csv`}
            dimmed={loading}
            summary={
              <>
                <Text size="small">
                  <strong>{number(data.totals.current.orders)}</strong> παραγγελίες
                </Text>
                <Text size="small">
                  <strong>{money(data.totals.current.net_sales)}</strong> καθαρές πωλήσεις
                </Text>
                <Text size="small">
                  <strong>{money(data.totals.current.total_sales)}</strong> συνολικές πωλήσεις
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
  label: "Έσοδα",
  rank: 2,
})

export default RevenuePage
