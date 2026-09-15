import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Container, Heading, Text } from "@medusajs/ui"

/**
 * "Αποστολή" — the delivery details of an order at a glance, at the top of the
 * order page's side column.
 *
 * Checkout stores how the customer chose to receive the order (ACS pickup point,
 * home delivery, payment method, notes…) in `order.metadata`, which the admin
 * only shows as a collapsed JSON blob. Labels match the order emails
 * (src/lib/order-email-html.ts in the storefront).
 */

const DELIVERY: Record<string, string> = {
  acs: "Παραλαβή από κατάστημα ACS",
  home: "Παράδοση κατ’ οίκον",
}

const PAYMENT: Record<string, string> = {
  card: "Πιστωτική / Χρεωστική κάρτα",
  cod: "Αντικαταβολή",
  bank: "Τραπεζική κατάθεση",
}

const money = (amount: number | undefined, currency: string | undefined) =>
  new Intl.NumberFormat("el-GR", { style: "currency", currency: (currency || "eur").toUpperCase() }).format(
    Number(amount ?? 0)
  )

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
    <Text size="small" weight="plus" leading="compact">
      {label}
    </Text>
    <Text size="small" leading="compact" className="whitespace-pre-line break-words">
      {children}
    </Text>
  </div>
)

const OrderDeliveryWidget = ({ data }: DetailWidgetProps<HttpTypes.AdminOrder>) => {
  const meta = (data.metadata ?? {}) as Record<string, unknown>
  const text = (key: string) => {
    const v = meta[key]
    return typeof v === "string" && v.trim() ? v.trim() : ""
  }

  const methods = data.shipping_methods ?? []
  const delivery = text("delivery")
  const payment = text("payment_method")

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Αποστολή</Heading>
      </div>
      <Row label="Τρόπος αποστολής">
        {methods.length
          ? methods.map((m) => `${m.name} · ${money(m.amount as number, data.currency_code)}`).join("\n")
          : "—"}
      </Row>
      {delivery && <Row label="Παράδοση">{DELIVERY[delivery] ?? delivery}</Row>}
      {text("acs_point") && <Row label="Κατάστημα ACS">{text("acs_point")}</Row>}
      {text("phone") && <Row label="Τηλέφωνο">{text("phone")}</Row>}
      {payment && <Row label="Πληρωμή">{PAYMENT[payment] ?? payment}</Row>}
      {text("company") && <Row label="Εταιρεία">{text("company")}</Row>}
      {text("vat") && <Row label="ΑΦΜ">{text("vat")}</Row>}
      {text("notes") && <Row label="Σημειώσεις">{text("notes")}</Row>}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default OrderDeliveryWidget
