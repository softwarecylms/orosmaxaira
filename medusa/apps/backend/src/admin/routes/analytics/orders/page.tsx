import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Container, StatusBadge, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"
import { FirstAndMore } from "../../../components/analytics/columns"
import { DataTable, type Column } from "../../../components/analytics/data-table"
import {
  ChartCard,
  KpiTiles,
  Loading,
  ReportHeader,
  useReportPage,
  useSelectedMetric,
} from "../../../components/analytics/report"
import { csvDateTime, formatDateTime, money, number, ORDER_STATUS } from "../../../lib/analytics"

const KPIS = ["orders", "net_sales", "avg_order_value", "avg_items_per_order"]

type OrderRow = {
  id: string
  display_id: number | null
  created_at: string
  status: string
  customer: string
  email: string
  new_customer: boolean
  products: { title: string; quantity: number }[]
  items_sold: number
  coupons: string[]
  net_sales: number
  total: number
}

const productList = (r: OrderRow) => r.products.map((p) => (p.quantity > 1 ? `${p.title} × ${p.quantity}` : p.title))

const COLUMNS: Column<OrderRow>[] = [
  {
    key: "created_at",
    label: "Ημερομηνία",
    value: (r) => r.created_at,
    render: (r) => <span className="whitespace-nowrap">{formatDateTime(r.created_at)}</span>,
    csv: (r) => csvDateTime(r.created_at),
  },
  {
    key: "display_id",
    label: "Παραγγελία",
    value: (r) => r.display_id,
    render: (r) => (
      <Link to={`/orders/${r.id}`} className="text-ui-fg-interactive hover:underline">
        #{r.display_id}
      </Link>
    ),
  },
  {
    key: "status",
    label: "Κατάσταση",
    value: (r) => ORDER_STATUS[r.status]?.label ?? r.status,
    render: (r) => {
      const s = ORDER_STATUS[r.status] ?? ORDER_STATUS.other
      return <StatusBadge color={s.color} className="whitespace-nowrap">{s.label}</StatusBadge>
    },
  },
  {
    key: "customer",
    label: "Πελάτης",
    value: (r) => r.customer,
    render: (r) => (
      <span className="flex flex-col">
        <span>{r.customer}</span>
        {r.email && r.email !== r.customer ? (
          <Text size="xsmall" className="text-ui-fg-subtle">
            {r.email}
          </Text>
        ) : null}
      </span>
    ),
  },
  {
    key: "customer_type",
    label: "Τύπος πελάτη",
    value: (r) => (r.new_customer ? "Νέος" : "Επαναλαμβανόμενος"),
    render: (r) => (
      <Badge size="2xsmall" color={r.new_customer ? "blue" : "grey"}>
        {r.new_customer ? "Νέος" : "Επαναλαμβανόμενος"}
      </Badge>
    ),
  },
  {
    key: "products",
    label: "Προϊόντα",
    sortable: false,
    value: (r) => productList(r).join("; "),
    render: (r) => <FirstAndMore items={productList(r)} />,
  },
  { key: "items_sold", label: "Τεμάχια", align: "right", value: (r) => r.items_sold, render: (r) => number(r.items_sold) },
  {
    key: "coupons",
    label: "Κουπόνια",
    value: (r) => r.coupons.join(", "),
    render: (r) => (r.coupons.length ? <span className="font-mono">{r.coupons.join(", ")}</span> : "—"),
  },
  { key: "net_sales", label: "Καθαρές πωλήσεις", align: "right", value: (r) => r.net_sales, render: (r) => money(r.net_sales) },
]

const OrdersPage = () => {
  const page = useReportPage<OrderRow>("orders")
  const [metric, setMetric] = useSelectedMetric(page, KPIS)
  const { data, loading } = page
  const t = data?.totals.current

  return (
    <div className="flex flex-col gap-y-3">
      <ReportHeader page={page} title="Παραγγελίες" description="Πόσες παραγγελίες, πόσο μεγάλες, και από ποιους πελάτες." />
      <KpiTiles page={page} metrics={KPIS} selected={metric} onSelect={setMetric} />
      <ChartCard page={page} metrics={[metric]} />
      <Container className="p-0">
        {!data || !t ? (
          <Loading />
        ) : (
          <DataTable
            title="Παραγγελίες"
            rows={data.rows}
            columns={COLUMNS}
            rowKey={(r) => r.id}
            defaultSort={{ key: "created_at", desc: true }}
            searchText={(r) =>
              `#${r.display_id} ${r.customer} ${r.email} ${productList(r).join(" ")} ${r.coupons.join(" ")} ${ORDER_STATUS[r.status]?.label ?? ""}`
            }
            searchPlaceholder="Παραγγελία, πελάτης, προϊόν…"
            filename={`analytics-orders-${data.range.from}_${data.range.to}.csv`}
            dimmed={loading}
            summary={
              <>
                <Text size="small">
                  <strong>{number(t.orders)}</strong> παραγγελίες
                </Text>
                <Text size="small">
                  <strong>{number(t.new_customers)}</strong> νέοι πελάτες
                </Text>
                <Text size="small">
                  <strong>{number(t.returning_customers)}</strong> επαναλαμβανόμενοι
                </Text>
                <Text size="small">
                  <strong>{number(t.items_sold)}</strong> τεμάχια
                </Text>
                <Text size="small">
                  <strong>{money(t.net_sales)}</strong> καθαρές πωλήσεις
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
  label: "Παραγγελίες",
  rank: 3,
})

export default OrdersPage
