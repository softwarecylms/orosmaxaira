import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Checkbox, Container, Heading, Input, Label, Select, Text, toast } from "@medusajs/ui"
import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { COMPARE_MODES, errorText, number, PRESETS } from "../../../lib/analytics"
import { sdk } from "../../../lib/sdk"

type Settings = {
  excluded_statuses: string[]
  default_period: string
  default_compare: string
  low_stock_threshold: number
}

type SettingsResponse = { settings: Settings; statuses: [status: string, label: string][]; vat_rate: number }

const Section = ({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) => (
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

/** «Αναλύσεις → Ρυθμίσεις», like WooCommerce's: which orders count, and how reports open. */
const AnalyticsSettingsPage = () => {
  const [data, setData] = useState<SettingsResponse | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [threshold, setThreshold] = useState("")
  const [saving, setSaving] = useState(false)

  const apply = (r: SettingsResponse) => {
    setData(r)
    setSettings(r.settings)
    setThreshold(String(r.settings.low_stock_threshold))
  }

  useEffect(() => {
    sdk.client
      .fetch<SettingsResponse>("/admin/analytics/settings", { method: "GET" })
      .then(apply)
      .catch((e) => toast.error(errorText(e)))
  }, [])

  if (!data || !settings) {
    return (
      <Container className="p-0">
        <div className="text-ui-fg-subtle px-6 py-8">Φόρτωση…</div>
      </Container>
    )
  }

  const toggleStatus = (status: string, counted: boolean) =>
    setSettings({
      ...settings,
      excluded_statuses: counted
        ? settings.excluded_statuses.filter((s) => s !== status)
        : [...settings.excluded_statuses, status],
    })

  const save = async () => {
    setSaving(true)
    try {
      const r = await sdk.client.fetch<SettingsResponse>("/admin/analytics/settings", {
        method: "POST",
        body: { ...settings, low_stock_threshold: Number(threshold) },
      })
      apply(r)
      toast.success("Οι ρυθμίσεις αποθηκεύτηκαν.")
    } catch (e) {
      toast.error(errorText(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading>Ρυθμίσεις αναλύσεων</Heading>
      </div>

      <Section
        title="Παραγγελίες που μετράνε"
        description="Οι παραγγελίες με κατάσταση χωρίς τσεκ δεν μετράνε σε καμία αναφορά. Οι πρόχειρες παραγγελίες δεν μετράνε ποτέ."
      >
        {data.statuses.map(([status, label]) => (
          <label key={status} className="flex items-center gap-x-3">
            <Checkbox
              checked={!settings.excluded_statuses.includes(status)}
              onCheckedChange={(v) => toggleStatus(status, v === true)}
            />
            <Text size="small">{label}</Text>
          </label>
        ))}
      </Section>

      <Section title="Προεπιλεγμένη περίοδος" description="Με αυτή ανοίγουν οι αναφορές, μέχρι να επιλέξετε άλλη.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-y-1.5">
            <Label size="small" weight="plus">
              Περίοδος
            </Label>
            <Select value={settings.default_period} onValueChange={(v) => setSettings({ ...settings, default_period: v })}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {PRESETS.map(([key, label]) => (
                  <Select.Item key={key} value={key}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-y-1.5">
            <Label size="small" weight="plus">
              Σύγκριση με
            </Label>
            <Select value={settings.default_compare} onValueChange={(v) => setSettings({ ...settings, default_compare: v })}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {COMPARE_MODES.map(([key, label]) => (
                  <Select.Item key={key} value={key}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
      </Section>

      <Section title="Απόθεμα" description="Πότε μια παραλλαγή φαίνεται ως «Χαμηλό απόθεμα» στην αναφορά Απόθεμα.">
        <div className="flex flex-col gap-y-1.5 md:max-w-[240px]">
          <Label size="small" weight="plus" htmlFor="low-stock">
            Χαμηλό απόθεμα: έως (τεμάχια)
          </Label>
          <Input id="low-stock" type="number" min={0} value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </div>
      </Section>

      <Section title="ΦΠΑ" description="Οι τιμές περιλαμβάνουν ΦΠΑ· οι αναλύσεις τον υπολογίζουν με τον συντελεστή των τιμολογίων.">
        <Text size="small">
          Συντελεστής: <strong>{number(data.vat_rate)}%</strong>. Αλλάζει στα{" "}
          <Link to="/invoices" className="text-ui-fg-interactive hover:underline">
            Τιμολόγια → Ρυθμίσεις
          </Link>
          .
        </Text>
      </Section>

      <div className="bg-ui-bg-base sticky bottom-0 flex justify-end px-6 py-4">
        <Button onClick={save} isLoading={saving}>
          Αποθήκευση
        </Button>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Ρυθμίσεις",
  rank: 9,
})

export default AnalyticsSettingsPage
