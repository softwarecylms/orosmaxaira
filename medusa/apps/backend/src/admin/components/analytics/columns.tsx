import { Badge, StatusBadge, Text, Tooltip } from "@medusajs/ui"
import { Link } from "react-router-dom"
import { money, number, PRODUCT_STATUS } from "../../lib/analytics"
import type { Column } from "./data-table"

/** Table columns shared by the Products and Variations reports. */

export type ProductRow = {
  id: string
  product_id: string | null
  title: string
  sku: string
  items_sold: number
  net_sales: number
  orders: number
  categories: string[]
  variations: number
  status: string
  stock: number | null
}

export type VariationRow = {
  id: string
  product_id: string | null
  variant_id: string | null
  title: string
  variant_title: string
  sku: string
  items_sold: number
  net_sales: number
  orders: number
  status: string
  stock: number | null
}

export const TitleLink = ({ productId, children }: { productId: string | null; children: string }) =>
  productId ? (
    <Link to={`/products/${productId}`} className="text-ui-fg-interactive hover:underline">
      {children}
    </Link>
  ) : (
    <span>{children}</span>
  )

export const ProductStatus = ({ status }: { status: string }) => {
  const s = PRODUCT_STATUS[status] ?? { label: status, color: "grey" as const }
  return <StatusBadge color={s.color} className="whitespace-nowrap">{s.label}</StatusBadge>
}

/** A list cell: the first entry, then "+N" with the rest in a tooltip. */
export const FirstAndMore = ({ items }: { items: string[] }) => {
  if (!items.length) return <span className="text-ui-fg-muted">—</span>
  return (
    <span className="flex items-center gap-x-1.5">
      <span>{items[0]}</span>
      {items.length > 1 ? (
        <Tooltip content={items.slice(1).join(", ")}>
          <Badge size="2xsmall">+{items.length - 1}</Badge>
        </Tooltip>
      ) : null}
    </span>
  )
}

const stockCell = (stock: number | null) =>
  stock === null ? (
    <Text size="small" className="text-ui-fg-muted" title="Το απόθεμα δεν παρακολουθείται">
      —
    </Text>
  ) : (
    number(stock)
  )

const sales = <R extends { items_sold: number; net_sales: number; orders: number }>(): Column<R>[] => [
  { key: "items_sold", label: "Τεμάχια", align: "right", value: (r) => r.items_sold, render: (r) => number(r.items_sold) },
  { key: "net_sales", label: "Καθαρές πωλήσεις", align: "right", value: (r) => r.net_sales, render: (r) => money(r.net_sales) },
  { key: "orders", label: "Παραγγελίες", align: "right", value: (r) => r.orders, render: (r) => number(r.orders) },
]

export const productColumns = (showVariations: (productId: string) => void): Column<ProductRow>[] => [
  {
    key: "title",
    label: "Προϊόν",
    value: (r) => r.title,
    render: (r) => (
      <span className="block min-w-[160px]">
        <TitleLink productId={r.product_id}>{r.title}</TitleLink>
      </span>
    ),
  },
  // A product with sizes has a SKU per size: the first, then "+N".
  { key: "sku", label: "SKU", value: (r) => r.sku, render: (r) => <FirstAndMore items={r.sku ? r.sku.split(", ") : []} /> },
  ...sales<ProductRow>(),
  {
    key: "categories",
    label: "Κατηγορία",
    value: (r) => r.categories.join(", "),
    render: (r) => <FirstAndMore items={r.categories} />,
  },
  {
    key: "variations",
    label: "Παραλλαγές",
    align: "right",
    value: (r) => r.variations,
    render: (r) =>
      r.variations && r.product_id ? (
        <button
          type="button"
          className="text-ui-fg-interactive hover:underline"
          onClick={() => showVariations(r.product_id!)}
          title="Πωλήσεις ανά παραλλαγή"
        >
          {r.variations}
        </button>
      ) : (
        "—"
      ),
  },
  { key: "status", label: "Κατάσταση", value: (r) => PRODUCT_STATUS[r.status]?.label ?? r.status, render: (r) => <ProductStatus status={r.status} /> },
  { key: "stock", label: "Απόθεμα", align: "right", value: (r) => r.stock, render: (r) => stockCell(r.stock) },
]

export const variationColumns: Column<VariationRow>[] = [
  {
    key: "title",
    label: "Προϊόν / Παραλλαγή",
    value: (r) => `${r.title} — ${r.variant_title}`,
    render: (r) => (
      <span className="flex flex-col">
        <TitleLink productId={r.product_id}>{r.title}</TitleLink>
        <Text size="xsmall" className="text-ui-fg-subtle">
          {r.variant_title}
        </Text>
      </span>
    ),
  },
  { key: "sku", label: "SKU", value: (r) => r.sku, render: (r) => r.sku || "—" },
  ...sales<VariationRow>(),
  { key: "status", label: "Κατάσταση", value: (r) => PRODUCT_STATUS[r.status]?.label ?? r.status, render: (r) => <ProductStatus status={r.status} /> },
  { key: "stock", label: "Απόθεμα", align: "right", value: (r) => r.stock, render: (r) => stockCell(r.stock) },
]

/** «5 προϊόντα · 49 τεμάχια · 801,70 € καθαρές πωλήσεις · 34 παραγγελίες» */
export const SalesSummary = ({ count, noun, totals }: { count: number; noun: [string, string]; totals: Record<string, number> }) => (
  <>
    <Text size="small">
      <strong>{number(count)}</strong> {count === 1 ? noun[0] : noun[1]}
    </Text>
    <Text size="small">
      <strong>{number(totals.items_sold ?? 0)}</strong> τεμάχια
    </Text>
    <Text size="small">
      <strong>{money(totals.net_sales ?? 0)}</strong> καθαρές πωλήσεις
    </Text>
    <Text size="small">
      <strong>{number(totals.orders ?? 0)}</strong> {totals.orders === 1 ? "παραγγελία" : "παραγγελίες"}
    </Text>
  </>
)
