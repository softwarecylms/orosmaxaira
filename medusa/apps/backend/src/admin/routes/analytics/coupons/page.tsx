import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Text } from "@medusajs/ui"
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
import { formatDate, money, number } from "../../../lib/analytics"

const KPIS = ["discounted_orders", "discount_amount"]

type CouponRow = {
  id: string
  promotion_id: string | null
  code: string
  used_code: string | null
  orders: number
  amount: number
  created_at: string | null
  ends_at: string | null
  is_automatic: boolean
  method: "percentage" | "fixed" | null
  value: number | null
  target: string | null
  status: string
}

const typeLabel = (r: CouponRow) => {
  if (r.method === null || r.value === null) return "—"
  const amount = r.method === "percentage" ? `${number(r.value)}%` : money(r.value)
  const what = r.target === "shipping_methods" ? "στα μεταφορικά" : r.target === "items" ? "σε προϊόντα" : "στην παραγγελία"
  return `${r.method === "percentage" ? "Ποσοστό" : "Σταθερό ποσό"} ${amount} ${what}`
}

const isoDate = (iso: string | null) => (iso ? iso.slice(0, 10) : "")

const COLUMNS: Column<CouponRow>[] = [
  {
    key: "code",
    label: "Κωδικός",
    value: (r) => r.code,
    render: (r) => (
      <span className="flex flex-col">
        <span className="flex items-center gap-x-1.5">
          {r.promotion_id ? (
            <Link to={`/promotions/${r.promotion_id}`} className="text-ui-fg-interactive font-mono hover:underline">
              {r.code}
            </Link>
          ) : (
            <span className="font-mono">{r.code}</span>
          )}
          {r.is_automatic ? <Badge size="2xsmall">Αυτόματη</Badge> : null}
        </span>
        {r.used_code ? (
          <Text size="xsmall" className="text-ui-fg-subtle">
            χρησιμοποιήθηκε ως {r.used_code}
          </Text>
        ) : null}
      </span>
    ),
  },
  { key: "orders", label: "Παραγγελίες", align: "right", value: (r) => r.orders, render: (r) => number(r.orders) },
  { key: "amount", label: "Ποσό έκπτωσης", align: "right", value: (r) => r.amount, render: (r) => money(r.amount) },
  {
    key: "created_at",
    label: "Δημιουργήθηκε",
    value: (r) => isoDate(r.created_at),
    render: (r) => (r.created_at ? formatDate(isoDate(r.created_at)) : "—"),
  },
  {
    key: "ends_at",
    label: "Λήγει",
    value: (r) => isoDate(r.ends_at),
    render: (r) => (r.ends_at ? formatDate(isoDate(r.ends_at)) : "Χωρίς λήξη"),
  },
  { key: "type", label: "Τύπος", value: typeLabel },
]

const CouponsPage = () => {
  const page = useReportPage<CouponRow>("coupons")
  const [metric, setMetric] = useSelectedMetric(page, KPIS)
  const { data, loading } = page

  return (
    <div className="flex flex-col gap-y-3">
      <ReportHeader
        page={page}
        title="Κουπόνια"
        description="Οι εκπτώσεις που χρησιμοποιήθηκαν: κουπόνια και αυτόματες προσφορές."
      />
      <KpiTiles page={page} metrics={KPIS} selected={metric} onSelect={setMetric} />
      <ChartCard page={page} metrics={[metric]} />
      <Container className="p-0">
        {!data ? (
          <Loading />
        ) : (
          <DataTable
            title="Κουπόνια"
            rows={data.rows}
            columns={COLUMNS}
            rowKey={(r) => r.id}
            defaultSort={{ key: "orders", desc: true }}
            searchText={(r) => `${r.code} ${r.used_code ?? ""}`}
            searchPlaceholder="Αναζήτηση κωδικού…"
            filename={`analytics-coupons-${data.range.from}_${data.range.to}.csv`}
            dimmed={loading}
            empty="Δεν χρησιμοποιήθηκε έκπτωση σε αυτή την περίοδο."
            summary={
              <>
                <Text size="small">
                  <strong>{number(data.rows.length)}</strong> {data.rows.length === 1 ? "κουπόνι" : "κουπόνια"}
                </Text>
                <Text size="small">
                  <strong>{number(data.totals.current.discounted_orders)}</strong> παραγγελίες με έκπτωση
                </Text>
                <Text size="small">
                  <strong>{money(data.totals.current.discount_amount)}</strong> σε εκπτώσεις
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
  label: "Κουπόνια",
  rank: 6,
})

export default CouponsPage
