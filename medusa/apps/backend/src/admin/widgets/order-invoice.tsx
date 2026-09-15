import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { ArrowDownTray, ArrowPath, Envelope, Eye } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Text, toast, usePrompt } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { sdk } from "../lib/sdk"
import { dateTime, errorText, pdfUrl, type InvoiceRow } from "../lib/invoices"

/**
 * «Τιμολόγιο» — the order's invoice in the order page's side column: its
 * number, whether the customer has received it, and view / download / email /
 * rebuild. Orders placed before invoicing started have none until one is issued
 * here (it takes the next number).
 */

const OrderInvoiceWidget = ({ data }: DetailWidgetProps<HttpTypes.AdminOrder>) => {
  const [invoice, setInvoice] = useState<InvoiceRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<"issue" | "send" | "refresh" | null>(null)
  const prompt = usePrompt()
  const path = `/admin/order-invoices/${data.id}`

  useEffect(() => {
    setLoading(true)
    sdk.client
      .fetch<{ invoice: InvoiceRow | null }>(path, { method: "GET" })
      .then((r) => setInvoice(r.invoice))
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false))
    // Re-read when the order changes (a fulfillment sends the invoice).
  }, [data.id, data.fulfillment_status])

  const run = async (
    kind: "issue" | "send" | "refresh",
    confirm: { title: string; description: string },
    request: () => Promise<{ invoice: InvoiceRow }>,
    done: string
  ) => {
    const ok = await prompt({ ...confirm, confirmText: "Συνέχεια", cancelText: "Άκυρο" })
    if (!ok) return
    setBusy(kind)
    try {
      const r = await request()
      setInvoice(r.invoice)
      toast.success(done)
    } catch (e) {
      toast.error(errorText(e))
    } finally {
      setBusy(null)
    }
  }

  const issue = () =>
    run(
      "issue",
      {
        title: "Έκδοση τιμολογίου;",
        description: `Η παραγγελία #${data.display_id} θα πάρει τον επόμενο αριθμό τιμολογίου. Δεν αναιρείται.`,
      },
      () => sdk.client.fetch(path, { method: "POST", body: {} }),
      "Το τιμολόγιο εκδόθηκε."
    )

  const send = () =>
    run(
      "send",
      {
        title: "Αποστολή τιμολογίου;",
        description: `Το ${invoice?.code} θα σταλεί με email στο ${invoice?.customer_email || data.email}.`,
      },
      () => sdk.client.fetch(`${path}/send`, { method: "POST", body: {} }),
      "Το τιμολόγιο στάλθηκε."
    )

  const refresh = () =>
    run(
      "refresh",
      {
        title: "Ενημέρωση στοιχείων;",
        description: `Το ${invoice?.code} θα ξαναφτιαχτεί από την παραγγελία όπως είναι τώρα και τις τρέχουσες ρυθμίσεις. Ο αριθμός και η ημερομηνία μένουν ίδια.`,
      },
      () => sdk.client.fetch(path, { method: "POST", body: { refresh: true } }),
      "Το τιμολόγιο ενημερώθηκε."
    )

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Τιμολόγιο</Heading>
        {invoice ? (
          <Badge size="2xsmall" color={invoice.sent_at ? "green" : "grey"}>
            {invoice.sent_at ? "Στάλθηκε" : "Δεν έχει σταλεί"}
          </Badge>
        ) : null}
      </div>

      {loading ? (
        <div className="text-ui-fg-subtle px-6 py-4">
          <Text size="small">Φόρτωση…</Text>
        </div>
      ) : invoice ? (
        <>
          <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
            <Text size="small" weight="plus" leading="compact">
              Αριθμός
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-base font-medium">
              {invoice.code}
            </Text>
          </div>
          <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
            <Text size="small" weight="plus" leading="compact">
              Έκδοση
            </Text>
            <Text size="small" leading="compact">
              {dateTime(invoice.issued_at)}
            </Text>
          </div>
          {invoice.sent_at ? (
            <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
              <Text size="small" weight="plus" leading="compact">
                Στάλθηκε
              </Text>
              <Text size="small" leading="compact" className="break-words">
                {dateTime(invoice.sent_at)}
                <br />
                {invoice.sent_to}
              </Text>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 px-6 py-4">
            <Button size="small" variant="secondary" asChild>
              <a href={pdfUrl(data.id)} target="_blank" rel="noreferrer">
                <Eye />
                Προβολή
              </a>
            </Button>
            <Button size="small" variant="secondary" asChild>
              <a href={pdfUrl(data.id, true)}>
                <ArrowDownTray />
                Λήψη
              </a>
            </Button>
            <Button size="small" variant="secondary" onClick={send} isLoading={busy === "send"} disabled={!!busy}>
              <Envelope />
              {invoice.sent_at ? "Αποστολή ξανά" : "Αποστολή στον πελάτη"}
            </Button>
            <Button size="small" variant="transparent" onClick={refresh} isLoading={busy === "refresh"} disabled={!!busy}>
              <ArrowPath />
              Ενημέρωση στοιχείων
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-start gap-y-3 px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Η παραγγελία δεν έχει τιμολόγιο.
          </Text>
          <Button size="small" variant="secondary" onClick={issue} isLoading={busy === "issue"}>
            Έκδοση τιμολογίου
          </Button>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default OrderInvoiceWidget
