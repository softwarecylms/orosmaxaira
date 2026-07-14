import { useEffect, useState } from "react"
import { Button, FocusModal, Input, Label, Text, Textarea, toast } from "@medusajs/ui"
import { sdk } from "../lib/sdk"
import { Repeater } from "./repeater"

const api = {
  get: <T,>(u: string) => sdk.client.fetch<T>(u, { method: "GET" }),
  post: <T,>(u: string, body: unknown) =>
    sdk.client.fetch<T>(u, { method: "POST", body: body as Record<string, unknown> }),
}

const SCALARS: {
  key: string
  label: string
  type?: "text" | "number" | "textarea"
  full?: boolean
}[] = [
  { key: "title", label: "Τίτλος" },
  { key: "slug", label: "Permalink (slug)" },
  { key: "season_label", label: "Εποχή (π.χ. Πάσχα)" },
  { key: "image", label: "Κύρια εικόνα (URL)" },
  { key: "duration_label", label: "Διάρκεια" },
  { key: "age_label", label: "Ηλικίες" },
  { key: "rank", label: "Σειρά εμφάνισης", type: "number" },
  { key: "excerpt", label: "Σύντομη περιγραφή", type: "textarea", full: true },
  { key: "description", label: "Περιγραφή (** = έντονα)", type: "textarea", full: true },
  { key: "meta_title", label: "SEO τίτλος", full: true },
  { key: "meta_description", label: "SEO περιγραφή", type: "textarea", full: true },
]

/** Editor for a single Εργαστήρι — content + demo combo pricing (no slots). */
export function WorkshopEditor({
  workshopId,
  open,
  onClose,
  onSaved,
}: {
  workshopId: string
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!open) return
    setLoading(true)
    api
      .get<{ workshop: any }>(`/admin/workshops/${workshopId}`)
      .then(({ workshop }) =>
        setForm({ ...workshop, _monthsText: (workshop.months ?? []).join(", ") }),
      )
      .catch((e) => toast.error("Σφάλμα φόρτωσης: " + (e?.message ?? e)))
      .finally(() => setLoading(false))
  }, [open, workshopId])

  const save = async () => {
    setSaving(true)
    try {
      const payload: Record<string, any> = {}
      for (const s of SCALARS) {
        let v = form[s.key]
        if (s.type === "number") v = v === "" || v == null ? null : Number(v)
        payload[s.key] = v
      }
      payload.months = String(form._monthsText ?? "")
        .split(",")
        .map((x) => parseInt(x.trim(), 10))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 12)
      for (const k of ["price_tiers", "gallery", "features"]) {
        if (form[k] !== undefined) payload[k] = form[k]
      }
      if (Array.isArray(payload.price_tiers)) {
        payload.price_tiers = payload.price_tiers.map((t: any) => ({
          ...t,
          price: Number(t.price) || 0,
        }))
      }
      payload.status = form.status ?? "draft"
      payload.currency = form.currency ?? "eur"
      await api.post(`/admin/workshops/${workshopId}`, payload)
      toast.success("Αποθηκεύτηκε")
      onSaved()
    } catch (e: any) {
      toast.error("Σφάλμα αποθήκευσης: " + (e?.message ?? e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <FocusModal open={open} onOpenChange={(v) => !v && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <div className="flex w-full items-center justify-between gap-4">
            <Text className="text-ui-fg-subtle">
              {form.title ? `Επεξεργασία: ${form.title}` : "Εργαστήρι"}
            </Text>
            <Button size="small" onClick={save} isLoading={saving}>
              Αποθήκευση
            </Button>
          </div>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col overflow-y-auto p-6">
          {loading ? (
            <div className="p-8 text-ui-fg-subtle">Φόρτωση…</div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                {SCALARS.map((s) => (
                  <div key={s.key} className={`flex flex-col gap-1 ${s.full ? "col-span-2" : ""}`}>
                    <Label size="small" weight="plus">
                      {s.label}
                    </Label>
                    {s.type === "textarea" ? (
                      <Textarea value={form[s.key] ?? ""} onChange={(e) => set(s.key, e.target.value)} />
                    ) : (
                      <Input
                        type={s.type === "number" ? "number" : "text"}
                        value={form[s.key] ?? ""}
                        onChange={(e) => set(s.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <Label size="small" weight="plus">
                    Μήνες (1–12, χωρισμένοι με κόμμα · κενό = κατόπιν ραντεβού)
                  </Label>
                  <Input
                    value={form._monthsText ?? ""}
                    placeholder="π.χ. 3, 4"
                    onChange={(e) => set("_monthsText", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label size="small" weight="plus">
                    Κατάσταση
                  </Label>
                  <select
                    className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm"
                    value={form.status ?? "draft"}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    <option value="draft">Πρόχειρο</option>
                    <option value="published">Δημοσιευμένο</option>
                  </select>
                </div>
              </div>

              <Repeater
                label="Επιλογές & τιμές (συνδυασμοί εμπειρίας)"
                value={form.price_tiers}
                onChange={(v) => set("price_tiers", v)}
                fields={[
                  { key: "key", label: "Κλειδί (gnorizw / gnorizw-peripeteies)" },
                  { key: "price", label: "Τιμή (€)", type: "number" },
                  { key: "label", label: "Ετικέτα", width: "col-span-2" },
                  { key: "note", label: "Σημείωση", width: "col-span-2" },
                ]}
                blank={{ key: "", label: "", price: 0, note: "" }}
              />
              <Repeater
                label="Χαρακτηριστικά (features)"
                value={form.features}
                onChange={(v) => set("features", v)}
                fields={[
                  { key: "title", label: "Τίτλος", width: "col-span-2" },
                  { key: "text", label: "Κείμενο", type: "textarea", width: "col-span-2" },
                ]}
                blank={{ title: "", text: "" }}
              />
              <Repeater
                label="Εικόνες gallery"
                value={form.gallery}
                onChange={(v) => set("gallery", v)}
                fields={[
                  { key: "url", label: "URL", width: "col-span-2" },
                  { key: "alt", label: "Alt", width: "col-span-2" },
                ]}
                blank={{ url: "", alt: "" }}
              />
            </div>
          )}
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}
