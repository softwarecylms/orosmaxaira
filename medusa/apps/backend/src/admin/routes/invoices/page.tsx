import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowDownTray, Eye, Receipt } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Table,
  Tabs,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../../lib/sdk"
import {
  dateTime,
  errorText,
  formatCode,
  openPdfFromPost,
  pdfUrl,
  type InvoiceConfig,
  type InvoiceRow,
  type InvoiceSettings,
} from "../../lib/invoices"

/**
 * «Τιμολόγια» — the shop's invoices, like the WooCommerce "PDF Invoices &
 * Packing Slips" plugin: the list of issued invoices, and the settings behind
 * them (numbering, seller block, logo, every printed label, the email).
 * Settings apply to invoices issued from then on; an existing invoice picks
 * them up only through «Ενημέρωση στοιχείων» on its order.
 */

const PAGE_SIZE = 50

const LABELS: [key: string, label: string][] = [
  ["invoice_number", "Αριθμός παραστατικού"],
  ["invoice_date", "Ημερομηνία τιμολογίου"],
  ["order_number", "Αριθμός παραγγελίας"],
  ["order_date", "Ημερομηνία παραγγελίας"],
  ["payment_method", "Τρόπος πληρωμής"],
  ["product", "Στήλη προϊόντος"],
  ["quantity", "Στήλη ποσότητας"],
  ["price", "Στήλη τιμής"],
  ["sku", "SKU"],
  ["subtotal", "Υποσύνολο"],
  ["discount", "Έκπτωση"],
  ["shipping", "Αποστολή"],
  ["shipping_via", "«μέσω» (πριν τον τρόπο αποστολής)"],
  ["total", "Σύνολο"],
  ["vat_note", "Σημείωση ΦΠΑ — {vat} ποσό, {rate} συντελεστής"],
  ["company", "Εταιρεία πελάτη"],
  ["vat_number", "ΑΦΜ πελάτη"],
]

const PAYMENTS: [key: string, label: string][] = [
  ["card", "Κάρτα"],
  ["cod", "Αντικαταβολή"],
  ["bank", "Τραπεζική κατάθεση"],
]

const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <div className="flex flex-col gap-y-1.5">
    <Label size="small" weight="plus">
      {label}
    </Label>
    {children}
    {hint ? (
      <Text size="xsmall" className="text-ui-fg-subtle">
        {hint}
      </Text>
    ) : null}
  </div>
)

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-center gap-x-3">
    <Switch checked={checked} onCheckedChange={onChange} />
    <Text size="small">{label}</Text>
  </label>
)

const Section = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
  <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
    <div>
      <Heading level="h2">{title}</Heading>
      {description ? (
        <Text size="small" className="text-ui-fg-subtle mt-1">
          {description}
        </Text>
      ) : null}
    </div>
    <div className="flex flex-col gap-y-4 lg:col-span-2">{children}</div>
  </div>
)

const InvoiceList = () => {
  const [rows, setRows] = useState<InvoiceRow[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    sdk.client
      .fetch<{ invoices: InvoiceRow[]; count: number }>("/admin/invoices", {
        method: "GET",
        query: { limit: PAGE_SIZE, offset },
      })
      .then((r) => {
        setRows(r.invoices)
        setCount(r.count)
      })
      .catch((e) => toast.error(errorText(e)))
      .finally(() => setLoading(false))
  }, [offset])

  if (loading) return <div className="text-ui-fg-subtle px-6 py-8">Φόρτωση…</div>

  return (
    <>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Τιμολόγιο</Table.HeaderCell>
            <Table.HeaderCell>Παραγγελία</Table.HeaderCell>
            <Table.HeaderCell>Πελάτης</Table.HeaderCell>
            <Table.HeaderCell>Έκδοση</Table.HeaderCell>
            <Table.HeaderCell>Σύνολο</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((r) => (
            <Table.Row key={r.id}>
              <Table.Cell className="font-medium">{r.code}</Table.Cell>
              <Table.Cell>
                <Link to={`/orders/${r.order_id}`} className="text-ui-fg-interactive hover:underline">
                  #{r.order_display_id}
                </Link>
              </Table.Cell>
              <Table.Cell>{r.customer}</Table.Cell>
              <Table.Cell>{dateTime(r.issued_at)}</Table.Cell>
              <Table.Cell>{r.total != null ? `€${Number(r.total).toFixed(2).replace(".", ",")}` : "—"}</Table.Cell>
              <Table.Cell>
                <Badge size="2xsmall" color={r.sent_at ? "green" : "grey"}>
                  {r.sent_at ? "Στάλθηκε" : "Όχι ακόμη"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <div className="flex justify-end gap-x-2">
                  <Button size="small" variant="transparent" asChild>
                    <a href={pdfUrl(r.order_id)} target="_blank" rel="noreferrer" title="Προβολή">
                      <Eye />
                    </a>
                  </Button>
                  <Button size="small" variant="transparent" asChild>
                    <a href={pdfUrl(r.order_id, true)} title="Λήψη">
                      <ArrowDownTray />
                    </a>
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
          {rows.length === 0 ? (
            <Table.Row>
              <Table.Cell className="text-ui-fg-subtle">
                Δεν έχει εκδοθεί τιμολόγιο ακόμη. Εκδίδεται αυτόματα με κάθε νέα παραγγελία.
              </Table.Cell>
            </Table.Row>
          ) : null}
        </Table.Body>
      </Table>
      {count > PAGE_SIZE ? (
        <div className="flex items-center justify-between px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, count)} από {count}
          </Text>
          <div className="flex gap-x-2">
            <Button size="small" variant="secondary" disabled={offset === 0} onClick={() => setOffset(offset - PAGE_SIZE)}>
              Προηγούμενα
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={offset + PAGE_SIZE >= count}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Επόμενα
            </Button>
          </div>
        </div>
      ) : null}
    </>
  )
}

const SettingsForm = () => {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null)
  const [config, setConfig] = useState<InvoiceConfig | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const [nextNumber, setNextNumber] = useState("")
  const [saving, setSaving] = useState(false)

  const apply = (s: InvoiceSettings) => {
    setSettings(s)
    setConfig(s.config)
    setLogo(s.logo)
    setNextNumber(String(s.next_number))
  }

  useEffect(() => {
    sdk.client
      .fetch<{ settings: InvoiceSettings }>("/admin/invoices/settings", { method: "GET" })
      .then((r) => apply(r.settings))
      .catch((e) => toast.error(errorText(e)))
  }, [])

  if (!config || !settings) return <div className="text-ui-fg-subtle px-6 py-8">Φόρτωση…</div>

  const set = <K extends keyof InvoiceConfig>(key: K, value: InvoiceConfig[K]) => setConfig({ ...config, [key]: value })
  const setLabel = (key: string, value: string) => set("labels", { ...config.labels, [key]: value })
  const setPayment = (key: string, value: string) => set("payment_labels", { ...config.payment_labels, [key]: value })

  const pickLogo = (file: File | undefined) => {
    if (!file) return
    if (!/^image\/(png|jpeg)$/.test(file.type)) return toast.error("Επιλέξτε εικόνα PNG ή JPG.")
    if (file.size > 2_000_000) return toast.error("Η εικόνα πρέπει να είναι μικρότερη από 2 MB.")
    const reader = new FileReader()
    reader.onload = () => setLogo(String(reader.result))
    reader.readAsDataURL(file)
  }

  const save = async () => {
    setSaving(true)
    try {
      const r = await sdk.client.fetch<{ settings: InvoiceSettings }>("/admin/invoices/settings", {
        method: "POST",
        body: { config, logo, next_number: Number(nextNumber) },
      })
      apply(r.settings)
      toast.success("Οι ρυθμίσεις αποθηκεύτηκαν.")
    } catch (e) {
      toast.error(errorText(e))
    } finally {
      setSaving(false)
    }
  }

  const preview = () => openPdfFromPost("/admin/invoices/preview", { config, logo }).catch((e) => toast.error(errorText(e)))
  const nextCode = formatCode(Number(nextNumber) || settings.next_number, config)

  return (
    <div className="divide-y">
      <Section
        title="Αρίθμηση"
        description="Κάθε νέα παραγγελία παίρνει αυτόματα τον επόμενο αριθμό τη στιγμή που υποβάλλεται."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Πρόθεμα">
            <Input value={config.prefix} onChange={(e) => set("prefix", e.target.value)} />
          </Field>
          <Field label="Ψηφία">
            <Input type="number" min={1} max={12} value={config.digits} onChange={(e) => set("digits", Number(e.target.value))} />
          </Field>
          <Field
            label="Επόμενος αριθμός"
            hint={settings.last_number != null ? `Τελευταίος που εκδόθηκε: ${settings.last_number}` : undefined}
          >
            <Input type="number" min={1} value={nextNumber} onChange={(e) => setNextNumber(e.target.value)} />
          </Field>
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          Το επόμενο τιμολόγιο θα είναι <strong className="text-ui-fg-base">{nextCode}</strong>.
        </Text>
      </Section>

      <Section title="Στοιχεία εταιρείας" description="Το πάνω δεξιά μέρος του τιμολογίου και το λογότυπο.">
        <Field label="Τίτλος εγγράφου">
          <Input value={config.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Επωνυμία" hint="Εμφανίζεται με έντονα γράμματα.">
          <Input value={config.shop_name} onChange={(e) => set("shop_name", e.target.value)} />
        </Field>
        <Field label="Στοιχεία" hint="Διεύθυνση, ΑΦΜ, τηλέφωνο, email — μία γραμμή ανά στοιχείο.">
          <Textarea rows={6} value={config.shop_details} onChange={(e) => set("shop_details", e.target.value)} />
        </Field>
        <Field label="Λογότυπο" hint="PNG ή JPG. Χωρίς αρχείο χρησιμοποιείται το λογότυπο του Όρους Μαχαιρά.">
          <div className="flex flex-wrap items-center gap-4">
            {logo ? <img src={logo} alt="" className="h-12 w-auto rounded border bg-white p-1" /> : null}
            <input type="file" accept="image/png,image/jpeg" onChange={(e) => pickLogo(e.target.files?.[0])} className="text-sm" />
            {logo ? (
              <Button size="small" variant="secondary" onClick={() => setLogo(null)}>
                Προεπιλεγμένο λογότυπο
              </Button>
            ) : null}
          </div>
        </Field>
      </Section>

      <Section title="Περιεχόμενο" description="Τι εμφανίζεται στο τιμολόγιο.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Toggle label="Κωδικός SKU κάτω από κάθε προϊόν" checked={config.show_sku} onChange={(v) => set("show_sku", v)} />
          <Toggle label="Email πελάτη" checked={config.show_email} onChange={(v) => set("show_email", v)} />
          <Toggle label="Τηλέφωνο πελάτη" checked={config.show_phone} onChange={(v) => set("show_phone", v)} />
          <Toggle label="Κατάστημα ACS παραλαβής" checked={config.show_acs_point} onChange={(v) => set("show_acs_point", v)} />
          <Toggle label="ΦΠΑ που περιλαμβάνεται στο σύνολο" checked={config.show_vat} onChange={(v) => set("show_vat", v)} />
        </div>
        <Field label="Συντελεστής ΦΠΑ (%)" hint="Οι τιμές του καταστήματος περιλαμβάνουν ΦΠΑ· υπολογίζεται από το σύνολο.">
          <Input type="number" min={0} step="0.01" value={config.vat_rate} onChange={(e) => set("vat_rate", Number(e.target.value))} />
        </Field>
        <Field label="Υπογραφές" hint="Μία γραμμή υπογραφής ανά σειρά. Κενό για καμία.">
          <Textarea rows={3} value={config.signatures} onChange={(e) => set("signatures", e.target.value)} />
        </Field>
        <Field label="Κείμενο υποσέλιδου" hint="Προαιρετικό — π.χ. τραπεζικός λογαριασμός ή όροι.">
          <Textarea rows={2} value={config.footer_text} onChange={(e) => set("footer_text", e.target.value)} />
        </Field>
      </Section>

      <Section title="Ετικέτες" description="Κάθε κείμενο που τυπώνεται στο τιμολόγιο.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {LABELS.map(([key, label]) => (
            <Field key={key} label={label}>
              <Input value={config.labels[key] ?? ""} onChange={(e) => setLabel(key, e.target.value)} />
            </Field>
          ))}
        </div>
        <Heading level="h3" className="mt-2">
          Τρόποι πληρωμής
        </Heading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PAYMENTS.map(([key, label]) => (
            <Field key={key} label={label}>
              <Input value={config.payment_labels[key] ?? ""} onChange={(e) => setPayment(key, e.target.value)} />
            </Field>
          ))}
        </div>
      </Section>

      <Section
        title="Email στον πελάτη"
        description="Το τιμολόγιο επισυνάπτεται ως PDF. Μεταβλητές: {number} τιμολόγιο, {order} παραγγελία, {name} όνομα πελάτη."
      >
        <Toggle
          label="Αυτόματη αποστολή όταν η παραγγελία γίνεται «Fulfilled»"
          checked={config.send_on_fulfillment}
          onChange={(v) => set("send_on_fulfillment", v)}
        />
        <Field label="Αντίγραφο σε" hint="Προαιρετικό — διευθύνσεις χωρισμένες με κόμμα που παίρνουν κάθε τιμολόγιο.">
          <Input value={config.copy_to} onChange={(e) => set("copy_to", e.target.value)} placeholder="accounts@orosmaxaira.com" />
        </Field>
        <Field label="Θέμα (Ελληνικά)">
          <Input value={config.email_subject_el} onChange={(e) => set("email_subject_el", e.target.value)} />
        </Field>
        <Field label="Κείμενο (Ελληνικά)">
          <Textarea rows={5} value={config.email_body_el} onChange={(e) => set("email_body_el", e.target.value)} />
        </Field>
        <Field label="Θέμα (Αγγλικά)" hint="Για πελάτες που παρήγγειλαν από την αγγλική έκδοση.">
          <Input value={config.email_subject_en} onChange={(e) => set("email_subject_en", e.target.value)} />
        </Field>
        <Field label="Κείμενο (Αγγλικά)">
          <Textarea rows={5} value={config.email_body_en} onChange={(e) => set("email_body_en", e.target.value)} />
        </Field>
      </Section>

      <div className="bg-ui-bg-base sticky bottom-0 flex justify-end gap-x-2 px-6 py-4">
        <Button variant="secondary" onClick={preview}>
          <Eye />
          Προεπισκόπηση
        </Button>
        <Button onClick={save} isLoading={saving}>
          Αποθήκευση
        </Button>
      </div>
    </div>
  )
}

const InvoicesPage = () => (
  <Container className="p-0">
    <Tabs defaultValue="invoices">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>Τιμολόγια</Heading>
        <Tabs.List>
          <Tabs.Trigger value="invoices">Τιμολόγια</Tabs.Trigger>
          <Tabs.Trigger value="settings">Ρυθμίσεις</Tabs.Trigger>
        </Tabs.List>
      </div>
      <div className="border-t">
        <Tabs.Content value="invoices">
          <InvoiceList />
        </Tabs.Content>
        <Tabs.Content value="settings">
          <SettingsForm />
        </Tabs.Content>
      </div>
    </Tabs>
  </Container>
)

export const config = defineRouteConfig({
  label: "Τιμολόγια",
  icon: Receipt,
})

export default InvoicesPage
