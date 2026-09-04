import { defineRouteConfig } from "@medusajs/admin-sdk"
import { AcademicCap } from "@medusajs/icons"
import { Button, Container, Heading, Input, Label, Tabs, Text, Textarea, toast } from "@medusajs/ui"
import { Fragment, useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"
import { Repeater } from "../../components/repeater"
import { LangToggle } from "../../components/lang-toggle"
import { ImagePicker } from "../../components/image-picker"
import { ViewPageButton } from "../../components/view-page-button"
import { PagePreview } from "../../components/page-preview"

const api = {
  get: <T,>(u: string) => sdk.client.fetch<T>(u, { method: "GET" }),
  post: <T,>(u: string, body: unknown) =>
    sdk.client.fetch<T>(u, { method: "POST", body: body as Record<string, unknown> }),
}

// Scalars that carry an English translation. hero_image + max_students are shared.
const TRANSLATABLE_SCALARS = new Set([
  "title",
  "hero_image_alt",
  "intro",
  "closing",
  "program_note",
  "tour_title",
  "tour_intro",
  "workshop_intro",
  "workshop_note",
  "play_title",
  "play_text",
  "duration_text",
  "allergy_title",
  "meta_title",
  "meta_description",
])

type Tab = "basics" | "content"

/**
 * `group` decides which tab a field appears under — "basics" for identity,
 * image, capacity and SEO; "content" for the page copy. It only ever filters the
 * *rendering*: `save()` still walks the whole array, so moving a field between
 * tabs can never drop it from the payload.
 */
const SCALARS: {
  key: string
  label: string
  group: Tab
  type?: "text" | "number" | "textarea" | "image"
  full?: boolean
  /** For an image field: the companion alt key, rendered inside the image box. */
  altKey?: string
}[] = [
  // ── Βασικά & SEO ──
  { key: "title", label: "Τίτλος", group: "basics" },
  { key: "hero_image", label: "Κύρια εικόνα", group: "basics", type: "image", full: true, altKey: "hero_image_alt" },
  { key: "max_students", label: "Μέγιστος αριθμός παιδιών", group: "basics", type: "number" },
  { key: "meta_title", label: "SEO τίτλος", group: "basics", full: true },
  { key: "meta_description", label: "SEO περιγραφή", group: "basics", type: "textarea", full: true },

  // ── Περιεχόμενο ──
  { key: "intro", label: "Περιγραφή — 1η παράγραφος", group: "content", type: "textarea", full: true },
  { key: "closing", label: "Περιγραφή — κλείσιμο", group: "content", type: "textarea", full: true },
  { key: "program_note", label: "Σημείωση προγράμματος", group: "content", type: "textarea", full: true },
  { key: "tour_title", label: "Δραστ. 1 — τίτλος", group: "content" },
  { key: "tour_intro", label: "Δραστ. 1 — εισαγωγή", group: "content", type: "textarea", full: true },
  { key: "workshop_intro", label: "Δραστ. 2 — εισαγωγή", group: "content", type: "textarea", full: true },
  { key: "workshop_note", label: "Δραστ. 2 — σημείωση", group: "content", type: "textarea", full: true },
  { key: "play_title", label: "Δραστ. 3 — τίτλος", group: "content" },
  { key: "play_text", label: "Δραστ. 3 — κείμενο", group: "content", type: "textarea", full: true },
  { key: "duration_text", label: "Διάρκεια & ροή", group: "content", type: "textarea", full: true },
  { key: "allergy_title", label: "Αλλεργίες — τίτλος", group: "content", full: true },
]

const SchoolProgramPage = () => {
  const [form, setForm] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<Tab>("basics")
  /** Incremented on every successful save so the preview reloads. */
  const [savedAt, setSavedAt] = useState(0)
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const [lang, setLang] = useState<"el" | "en">("el")
  const en = lang === "en"
  const tval = (k: string) => (en ? form.translations?.en?.[k] ?? "" : form[k] ?? "")
  const tset = (k: string, v: any) =>
    en
      ? setForm((f) => ({
          ...f,
          translations: { ...(f.translations ?? {}), en: { ...(f.translations?.en ?? {}), [k]: v } },
        }))
      : set(k, v)
  const jval = (k: string) => (en ? form.translations?.en?.[k] ?? form[k] : form[k])

  useEffect(() => {
    api
      .get<{ program: any }>("/admin/school-program")
      .then(({ program }) =>
        setForm({ ...(program ?? {}), _allergyText: (program?.allergy_body ?? []).join("\n") }),
      )
      .catch(() => setForm({}))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const payload: Record<string, any> = {}
      // Walks every scalar regardless of which tab it renders on.
      for (const s of SCALARS) {
        let v = form[s.key]
        if (s.type === "number") v = v === "" || v == null ? null : Number(v)
        payload[s.key] = v
        // Alt lives inside the image field rather than as a row of its own.
        if (s.altKey) payload[s.altKey] = form[s.altKey] ?? ""
      }
      for (const k of ["tour_stops", "workshop_options", "pricing", "notes"]) {
        if (form[k] !== undefined) payload[k] = form[k]
      }
      if (Array.isArray(payload.pricing)) {
        payload.pricing = payload.pricing.map((t: any) => ({
          ...t,
          price: t.price === "" || t.price == null ? null : Number(t.price),
        }))
      }
      payload.allergy_body = String(form._allergyText ?? "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean)
      payload.status = form.status ?? "published"
      // English overlay: drop empty scalars so blanks fall back to Greek.
      if (form.translations?.en) {
        const enOut: Record<string, any> = {}
        for (const [k, v] of Object.entries(form.translations.en)) {
          if (v === "" || v == null) continue
          if (Array.isArray(v) && v.length === 0) continue
          enOut[k] = v
        }
        payload.translations = Object.keys(enOut).length ? { ...form.translations, en: enOut } : null
      } else {
        payload.translations = form.translations ?? null
      }
      await api.post("/admin/school-program", payload)
      toast.success("Αποθηκεύτηκε")
      setSavedAt((n) => n + 1)
    } catch (e: any) {
      toast.error("Σφάλμα αποθήκευσης: " + (e?.message ?? e))
    } finally {
      setSaving(false)
    }
  }

  /** The scalar fields belonging to one tab. */
  const scalarFields = (group: Tab) =>
    SCALARS.filter((s) => s.group === group).map((s) => {
      const translatable = TRANSLATABLE_SCALARS.has(s.key)
      const locked = en && !translatable
      const value = translatable ? tval(s.key) : form[s.key] ?? ""
      const onChange = (v: string) => (translatable ? tset(s.key, v) : set(s.key, v))
      return (
        <Fragment key={s.key}>
          <div className={`flex flex-col gap-1 ${s.full ? "col-span-2" : ""}`}>
            <Label size="small" weight="plus">
              {s.label}
              {locked ? <span className="text-ui-fg-muted"> · κοινό</span> : null}
            </Label>
            {s.type === "image" ? (
              <ImagePicker
                value={value}
                onChange={onChange}
                disabled={locked}
                hint={locked ? "κοινό για όλες τις γλώσσες" : undefined}
                alt={s.altKey ? tval(s.altKey) : undefined}
                onAltChange={s.altKey ? (v) => tset(s.altKey!, v) : undefined}
              />
            ) : s.type === "textarea" ? (
              <Textarea value={value} disabled={locked} onChange={(e) => onChange(e.target.value)} />
            ) : (
              <Input
                type={s.type === "number" ? "number" : "text"}
                value={value}
                disabled={locked}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </div>

          {/* Status shares the first row with the title, so the hero image below
              it gets the full width of its own row. */}
          {s.key === "title" ? (
            <div className="flex flex-col gap-1">
              <Label size="small" weight="plus">
                Κατάσταση
              </Label>
              <select
                className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm disabled:opacity-50"
                value={form.status ?? "published"}
                disabled={en}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="draft">Πρόχειρο</option>
                <option value="published">Δημοσιευμένο</option>
              </select>
            </div>
          ) : null}
        </Fragment>
      )
    })

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>Εκπαιδευτικές Επισκέψεις Σχολείων</Heading>
        <div className="flex items-center gap-2">
          <ViewPageButton kind="school" />
          <Button size="small" onClick={save} isLoading={saving}>
            Αποθήκευση
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-ui-fg-subtle">Φόρτωση…</div>
      ) : (
        <div className="flex flex-col gap-6 px-6 py-6">
          <LangToggle lang={lang} onChange={setLang} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_540px]">
            <div className="flex min-w-0 flex-col gap-6">
              <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
                <Tabs.List>
                  <Tabs.Trigger value="basics">Βασικά &amp; SEO</Tabs.Trigger>
                  <Tabs.Trigger value="content">Περιεχόμενο</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="basics" className="flex flex-col gap-6 pt-5">
                  <div className="grid grid-cols-2 gap-4">{scalarFields("basics")}</div>
                  <Repeater
                    label="Κόστος (ανά παιδί)"
                    value={jval("pricing")}
                    onChange={(v) => tset("pricing", v)}
                    fields={[
                      { key: "range", label: "Κλίμακα (π.χ. Μέχρι 25 παιδιά)", width: "col-span-2" },
                      { key: "price", label: "Τιμή € (κενό = δωρεάν)", type: "number" },
                      { key: "note", label: "Σημείωση" },
                    ]}
                    blank={{ range: "", price: 0, note: "" }}
                  />
                </Tabs.Content>

                <Tabs.Content value="content" className="flex flex-col gap-6 pt-5">
                  <div className="grid grid-cols-2 gap-4">{scalarFields("content")}</div>
                  <Repeater
                    label="Δραστ. 1 — στάσεις ξενάγησης"
                    value={jval("tour_stops")}
                    onChange={(v) => tset("tour_stops", v)}
                    fields={[{ key: "text", label: "Κείμενο", type: "textarea", width: "col-span-2" }]}
                    blank={{ text: "" }}
                  />
                  <Repeater
                    label="Δραστ. 2 — επιλογές εργαστηρίου"
                    value={jval("workshop_options")}
                    onChange={(v) => tset("workshop_options", v)}
                    fields={[
                      { key: "key", label: "Κλειδί" },
                      { key: "short", label: "Τίτλος" },
                      { key: "description", label: "Περιγραφή", type: "textarea", width: "col-span-2" },
                    ]}
                    blank={{ key: "", short: "", description: "" }}
                  />
                  <Repeater
                    label="Σημαντικές σημειώσεις"
                    value={jval("notes")}
                    onChange={(v) => tset("notes", v)}
                    fields={[
                      { key: "title", label: "Τίτλος", width: "col-span-2" },
                      { key: "body", label: "Κείμενο", type: "textarea", width: "col-span-2" },
                    ]}
                    blank={{ title: "", body: "" }}
                  />
                  <div className="flex flex-col gap-1">
                    <Label size="small" weight="plus">
                      Αλλεργίες — παράγραφοι (μία ανά γραμμή)
                    </Label>
                    <Textarea
                      rows={4}
                      value={
                        en
                          ? (form.translations?.en?.allergy_body ?? form.allergy_body ?? []).join("\n")
                          : form._allergyText ?? ""
                      }
                      onChange={(e) =>
                        en
                          ? tset(
                              "allergy_body",
                              e.target.value.split("\n").map((x) => x.trim()).filter(Boolean),
                            )
                          : set("_allergyText", e.target.value)
                      }
                    />
                  </div>
                </Tabs.Content>
              </Tabs>

              <Text size="xsmall" className="text-ui-fg-subtle">
                Οι αλλαγές είναι άμεσα ορατές στη σελίδα /drastiriotites/scholeia.
              </Text>
            </div>

            {/* Live preview — only on wide screens, where it does not squeeze the
                form. The eye button in the header covers the narrow case. */}
            <aside className="hidden xl:block">
              <div className="sticky top-4 h-[calc(100vh-9rem)]">
                <PagePreview kind="school" reloadToken={savedAt} />
              </div>
            </aside>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Επισκέψεις Σχολείων",
  icon: AcademicCap,
})

export default SchoolProgramPage
