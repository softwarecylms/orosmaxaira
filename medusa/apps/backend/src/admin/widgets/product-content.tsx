import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../lib/sdk"
import { Repeater } from "../components/repeater"
import { RichTextarea } from "../components/rich-textarea"
import { LangToggle } from "../components/lang-toggle"

/**
 * «Περιεχόμενο καρτελών» — edits the two tabs under a product on the storefront:
 * «Περιγραφή» (one free-text field, blank line between paragraphs) and
 * «Διατροφική Αξία» (a unit label + label/value rows).
 *
 * Both used to live only in the storefront repo, so changing them meant a code
 * change and a deploy. They now live in the product's `metadata`, as JSON
 * *strings* (`sections_json`, `sections_en_json`, `nutrition_json`,
 * `nutrition_en_json`) — strings rather than nested objects so the dashboard's
 * own flat key/value metadata editor cannot mangle them.
 *
 * The storefront reads these ahead of its editorial snapshot and falls back to
 * it when a key is empty or unparseable, so a product is never left with a blank
 * tab. seed-product-tabs.ts loaded the existing copy in, so this form opens on
 * what is already live rather than on an empty page.
 */

type Section = { heading?: string; body: string }
type NutritionRow = { label: string; value: string }
type Nutrition = { unit: string; rows: NutritionRow[] }

type Lang = "el" | "en"

function readJson<T>(metadata: unknown, key: string, fallback: T): T {
  const raw = (metadata as Record<string, unknown> | null | undefined)?.[key]
  if (typeof raw !== "string" || !raw.trim()) return fallback
  try {
    return (JSON.parse(raw) as T) ?? fallback
  } catch {
    return fallback
  }
}

const EMPTY_NUTRITION: Nutrition = { unit: "", rows: [] }

/**
 * The Περιγραφή tab is edited as ONE field: paragraphs separated by a blank
 * line. A paragraph may open with a "## Τίτλος" line, which the storefront
 * renders as a subheading. It is not advertised in the UI — it exists so the
 * five products that already have subheadings (θυμαρίσιο, γύρη, βασιλικός
 * πολτός, κηρήθρα, βάμμα πρόπολης) survive a round-trip through this one field
 * instead of losing them. Inline markup is Markdown: `**bold**`, `*italic*`,
 * `- item`, `[label](href)` — written by the toolbar, rendered by <RichBody>.
 */
const HEADING_PREFIX = "## "

function sectionsToText(sections: Section[]): string {
  return sections
    .map((s) => (s.heading?.trim() ? `${HEADING_PREFIX}${s.heading.trim()}\n${s.body ?? ""}` : s.body ?? ""))
    .join("\n\n")
}

function textToSections(text: string): Section[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [first, ...rest] = block.split("\n")
      if (first.startsWith(HEADING_PREFIX)) {
        return { heading: first.slice(HEADING_PREFIX.length).trim(), body: rest.join("\n").trim() }
      }
      return { body: block }
    })
    .filter((s) => (s.body ?? "").trim() || (s.heading ?? "").trim())
}

const ProductContentWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [lang, setLang] = useState<Lang>("el")
  const [saving, setSaving] = useState(false)

  // One draft per language, loaded from metadata and edited locally until save.
  const initial = useMemo(
    () => ({
      el: {
        // Raw text, not parsed sections: parsing on every keystroke would strip
        // the blank line the moment you typed it, making new paragraphs
        // impossible. Text becomes sections once, on save.
        sectionsText: sectionsToText(readJson<Section[]>(data.metadata, "sections_json", [])),
        nutrition: readJson<Nutrition>(data.metadata, "nutrition_json", EMPTY_NUTRITION),
      },
      en: {
        sectionsText: sectionsToText(readJson<Section[]>(data.metadata, "sections_en_json", [])),
        nutrition: readJson<Nutrition>(data.metadata, "nutrition_en_json", EMPTY_NUTRITION),
      },
    }),
    [data.id, data.metadata]
  )

  const [draft, setDraft] = useState(initial)
  useEffect(() => setDraft(initial), [initial])

  const current = draft[lang]

  const setSectionsText = (sectionsText: string) =>
    setDraft((d) => ({ ...d, [lang]: { ...d[lang], sectionsText } }))
  const setNutrition = (patch: Partial<Nutrition>) =>
    setDraft((d) => ({ ...d, [lang]: { ...d[lang], nutrition: { ...d[lang].nutrition, ...patch } } }))

  const save = async () => {
    setSaving(true)
    try {
      // An empty tab is stored as "" so the storefront falls back to its
      // editorial snapshot rather than rendering an empty tab.
      const serialise = (base: "sections" | "nutrition", l: Lang) => {
        const v = draft[l]
        if (base === "sections") {
          const rows = textToSections(v.sectionsText)
          return rows.length ? JSON.stringify(rows) : ""
        }
        const rows = v.nutrition.rows.filter((r) => r.label?.trim() || r.value?.trim())
        return rows.length ? JSON.stringify({ unit: v.nutrition.unit ?? "", rows }) : ""
      }

      const metadata: Record<string, unknown> = {
        ...(data.metadata ?? {}),
        sections_json: serialise("sections", "el"),
        sections_en_json: serialise("sections", "en"),
        nutrition_json: serialise("nutrition", "el"),
        nutrition_en_json: serialise("nutrition", "en"),
      }

      await sdk.client.fetch(`/admin/products/${data.id}`, {
        method: "POST",
        body: { metadata },
      })
      toast.success("Αποθηκεύτηκε — ανανεώστε τη σελίδα του προϊόντος για να τη δείτε.")
    } catch (e) {
      toast.error("Σφάλμα αποθήκευσης: " + ((e as Error)?.message ?? String(e)))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-col">
          <Heading level="h2">Περιεχόμενο καρτελών</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Οι καρτέλες «Περιγραφή» και «Διατροφική Αξία» κάτω από το προϊόν.
          </Text>
        </div>
        <Button size="small" onClick={save} isLoading={saving}>
          Αποθήκευση
        </Button>
      </div>

      <div className="flex flex-col gap-6 px-6 py-4">
        <LangToggle lang={lang} onChange={setLang} />

        <div className="flex flex-col gap-1">
          <Label weight="plus">Περιγραφή</Label>
          <Text size="xsmall" className="text-ui-fg-subtle">
            Αφήστε μια κενή γραμμή ανάμεσα στις παραγράφους.
          </Text>
          <RichTextarea
            rows={12}
            value={current.sectionsText}
            onChange={setSectionsText}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label weight="plus">Διατροφική Αξία — μονάδα</Label>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Ο τίτλος της στήλης, π.χ. «Ανά 100g». Αφήστε τις γραμμές κενές για να
              μην εμφανίζεται η καρτέλα.
            </Text>
            <Input
              value={current.nutrition.unit ?? ""}
              onChange={(e) => setNutrition({ unit: e.target.value })}
            />
          </div>

          <Repeater<NutritionRow>
            label="Διατροφική Αξία — γραμμές"
            value={current.nutrition.rows}
            onChange={(rows) => setNutrition({ rows })}
            blank={{ label: "", value: "" }}
            fields={[
              { key: "label", label: "Θρεπτικό συστατικό" },
              { key: "value", label: "Τιμή" },
            ]}
          />
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductContentWidget
