import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Alert, Container, Heading, StatusBadge, Text } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { ProductStatus, TitleLink } from "../../../components/analytics/columns"
import { DataTable, type Column } from "../../../components/analytics/data-table"
import { Loading } from "../../../components/analytics/report"
import { errorText, number } from "../../../lib/analytics"
import { sdk } from "../../../lib/sdk"

type StockStatus = "instock" | "lowstock" | "outofstock" | "onbackorder" | "untracked"

type StockRow = {
  id: string
  product_id: string
  title: string
  variant_title: string
  sku: string
  product_status: string
  status: StockStatus
  stock: number | null
}

type StockData = { rows: StockRow[]; counts: Record<StockStatus, number>; low_stock_threshold: number }

const STATUS: Record<StockStatus, { label: string; color: "red" | "orange" | "green" | "blue" | "grey" }> = {
  outofstock: { label: "Εξαντλήθηκε", color: "red" },
  lowstock: { label: "Χαμηλό απόθεμα", color: "orange" },
  instock: { label: "Σε απόθεμα", color: "green" },
  onbackorder: { label: "Σε προπαραγγελία", color: "blue" },
  untracked: { label: "Χωρίς παρακολούθηση", color: "grey" },
}
const ORDER: StockStatus[] = ["outofstock", "lowstock", "instock", "onbackorder", "untracked"]

const COLUMNS: Column<StockRow>[] = [
  {
    key: "title",
    label: "Προϊόν / Παραλλαγή",
    value: (r) => (r.variant_title ? `${r.title} — ${r.variant_title}` : r.title),
    render: (r) => (
      <span className="flex flex-col">
        <TitleLink productId={r.product_id}>{r.title}</TitleLink>
        {r.variant_title ? (
          <Text size="xsmall" className="text-ui-fg-subtle">
            {r.variant_title}
          </Text>
        ) : null}
      </span>
    ),
  },
  { key: "sku", label: "SKU", value: (r) => r.sku, render: (r) => r.sku || "—" },
  {
    key: "status",
    label: "Κατάσταση αποθέματος",
    value: (r) => ORDER.indexOf(r.status),
    csv: (r) => STATUS[r.status].label,
    render: (r) => <StatusBadge color={STATUS[r.status].color} className="whitespace-nowrap">{STATUS[r.status].label}</StatusBadge>,
  },
  {
    key: "product_status",
    label: "Προϊόν",
    value: (r) => r.product_status,
    render: (r) => <ProductStatus status={r.product_status} />,
  },
  { key: "stock", label: "Απόθεμα", align: "right", value: (r) => r.stock, render: (r) => (r.stock === null ? "—" : number(r.stock)) },
]

/** Stock now — no date range, like WooCommerce's Stock report. */
const StockPage = () => {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState<StockData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const filter = (params.get("type") ?? "all") as StockStatus | "all"

  useEffect(() => {
    sdk.client
      .fetch<StockData>("/admin/analytics/stock", { method: "GET" })
      .then(setData)
      .catch((e) => setError(errorText(e)))
  }, [])

  const choose = (type: string) => {
    const next = new URLSearchParams(params)
    if (type === "all") next.delete("type")
    else next.set("type", type)
    setParams(next, { replace: true })
  }

  const rows = useMemo(
    () => (data ? (filter === "all" ? data.rows : data.rows.filter((r) => r.status === filter)) : []),
    [data, filter]
  )
  const tiles: [key: StockStatus | "all", label: string, count: number][] = data
    ? [["all", "Όλα", data.rows.length], ...ORDER.map((s): [StockStatus, string, number] => [s, STATUS[s].label, data.counts[s]])]
    : []

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading>Απόθεμα</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Το διαθέσιμο απόθεμα κάθε παραλλαγής τώρα (σε απόθεμα μείον δεσμευμένα).
            {data ? ` «Χαμηλό» είναι έως ${number(data.low_stock_threshold)} τεμάχια — αλλάζει στις ` : null}
            {data ? (
              <Link to="/analytics/settings" className="text-ui-fg-interactive hover:underline">
                Ρυθμίσεις
              </Link>
            ) : null}
            {data ? "." : null}
          </Text>
        </div>
        {error ? (
          <div className="px-6 py-4">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}
      </Container>

      {data ? (
        <div className="shadow-elevation-card-rest bg-ui-bg-base overflow-hidden rounded-lg">
          <div className="-mb-px -mr-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {tiles.map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => choose(key)}
                className="bg-ui-bg-base hover:bg-ui-bg-base-hover border-ui-border-base relative flex flex-col border-b border-r px-5 py-4 text-left outline-none focus-visible:bg-ui-bg-base-hover"
              >
                {filter === key ? <span aria-hidden className="bg-ui-fg-interactive absolute inset-x-0 top-0 h-0.5" /> : null}
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  {label}
                </Text>
                <span className="text-ui-fg-base mt-3 text-2xl font-medium leading-none">{number(count)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <Container className="p-0">
        {!data ? (
          error ? null : <Loading />
        ) : (
          <DataTable
            title={filter === "all" ? "Όλα τα προϊόντα" : STATUS[filter].label}
            rows={rows}
            columns={COLUMNS}
            rowKey={(r) => r.id}
            defaultSort={{ key: "status", desc: false }}
            searchText={(r) => `${r.title} ${r.variant_title} ${r.sku}`}
            searchPlaceholder="Αναζήτηση προϊόντος ή SKU…"
            filename={`analytics-stock-${new Date().toISOString().slice(0, 10)}.csv`}
            empty="Κανένα προϊόν σε αυτή την κατηγορία."
          />
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Απόθεμα",
  rank: 8,
})

export default StockPage
