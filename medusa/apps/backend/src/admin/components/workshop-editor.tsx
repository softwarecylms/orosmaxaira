import { useEffect, useState } from "react"
import {
  Badge,
  Button,
  FocusModal,
  Heading,
  IconButton,
  Input,
  Label,
  Table,
  Tabs,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { Trash, ArrowDownTray } from "@medusajs/icons"
import { sdk } from "../lib/sdk"
import { Repeater } from "./repeater"
import { LangToggle } from "./lang-toggle"

// Scalar fields that carry an English translation. Structural fields (slug, image,
// rank, months, status, currency, booking_closed) are shared and stay Greek-only.
const TRANSLATABLE_SCALARS = new Set([
  "title",
  "season_label",
  "duration_label",
  "age_label",
  "excerpt",
  "description",
  "meta_title",
  "meta_description",
])

const api = {
  get: <T,>(u: string) => sdk.client.fetch<T>(u, { method: "GET" }),
  post: <T,>(u: string, body: unknown) =>
    sdk.client.fetch<T>(u, { method: "POST", body: body as Record<string, unknown> }),
  del: <T,>(u: string) => sdk.client.fetch<T>(u, { method: "DELETE" }),
}

const WEEKDAYS = [
  "Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο",
]

// Standard age labels stored back onto age-tiered combos.
const AGE_LABELS = {
  adult: "Ενήλικες (12+ ετών)",
  child: "Παιδιά (4–11 ετών)",
  infant: "Βρέφη & Νήπια (0–3 ετών)",
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

type Slot = {
  id: string
  date: string
  start_time: string
  end_time?: string | null
  capacity: number
  booked_count: number
  status: string
  combo_key?: string | null
}
type Booking = {
  id: string
  reference: string
  customer_name: string
  email: string
  phone?: string | null
  adults: number
  children: number
  infants: number
  total_amount: number
  currency: string
  status: string
  slot_id?: string | null
  combo_label?: string | null
}

// A combo row as edited in the flat repeater (nested `prices` is flattened to
// adult/child/infant cells; a legacy flat `price` stays available for enquiry
// combos). `_comboRows` holds these; `price_tiers` is rebuilt on save.
type ComboRow = {
  key: string
  label: string
  long_label?: string
  start_time?: string
  end_time?: string
  adult?: number | string
  child?: number | string
  infant?: number | string
  price?: number | string
  note?: string
}

function tiersToRows(tiers: any[]): ComboRow[] {
  return (tiers ?? []).map((t) => ({
    key: t.key ?? "",
    label: t.label ?? "",
    long_label: t.long_label ?? "",
    start_time: t.start_time ?? "",
    end_time: t.end_time ?? "",
    adult: t.prices?.adult ?? "",
    child: t.prices?.child ?? "",
    infant: t.prices?.infant ?? "",
    price: t.price ?? "",
    note: t.note ?? "",
  }))
}

function rowsToTiers(rows: ComboRow[]): any[] {
  return (rows ?? []).map((r) => {
    const out: any = { key: r.key, label: r.label }
    if (r.long_label) out.long_label = r.long_label
    if (r.start_time) out.start_time = r.start_time
    if (r.end_time) out.end_time = r.end_time
    if (r.note) out.note = r.note
    const hasAge = [r.adult, r.child, r.infant].some((v) => v !== "" && v != null)
    if (hasAge) {
      out.prices = {
        adult: Number(r.adult) || 0,
        child: Number(r.child) || 0,
        infant: Number(r.infant) || 0,
      }
      out.age_labels = AGE_LABELS
    }
    if (r.price !== "" && r.price != null) out.price = Number(r.price) || 0
    return out
  })
}

/**
 * Full workshop editor: content + combo pricing (age-tiered), availability (with
 * a per-combo slot generator), and bookings. Seasonal workshops (with slots)
 * book online + pay; workshops without slots fall back to the enquiry form.
 */
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
  const [slots, setSlots] = useState<Slot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [gen, setGen] = useState({
    weekday: "6",
    start_time: "11:00",
    end_time: "12:45",
    capacity: "15",
    combo_key: "half",
    from: "",
    to: "",
  })
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  // Language being edited in the content tab (see LangToggle).
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
  // JSON overlay value (features/gallery): fall back to the Greek array in EN.
  const jval = (k: string) => (en ? form.translations?.en?.[k] ?? form[k] : form[k])
  // English combo label/description overrides, keyed by combo key. Prices stay on
  // the base record; only the visible strings are translated here.
  const comboLabels: Record<string, { label?: string; long_label?: string; note?: string }> =
    form.translations?.en?.combo_labels ?? {}
  const setComboLabel = (key: string, field: string, v: string) =>
    setForm((f) => {
      const en = f.translations?.en ?? {}
      const map = { ...(en.combo_labels ?? {}) }
      map[key] = { ...(map[key] ?? {}), [field]: v }
      return { ...f, translations: { ...(f.translations ?? {}), en: { ...en, combo_labels: map } } }
    })

  const reload = async () => {
    const [{ workshop }, { slots }, { bookings }] = await Promise.all([
      api.get<{ workshop: any }>(`/admin/workshops/${workshopId}`),
      api.get<{ slots: Slot[] }>(`/admin/workshops/${workshopId}/slots`),
      api.get<{ bookings: Booking[] }>(`/admin/bookings?workshop_id=${workshopId}`),
    ])
    setForm({
      ...workshop,
      _monthsText: (workshop.months ?? []).join(", "),
      _comboRows: tiersToRows(workshop.price_tiers),
    })
    setSlots(slots)
    setBookings(bookings)
  }

  useEffect(() => {
    if (!open) return
    setLoading(true)
    reload()
      .catch((e) => toast.error("Σφάλμα φόρτωσης: " + (e?.message ?? e)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      payload.price_tiers = rowsToTiers(form._comboRows ?? [])
      payload.booking_closed = !!form.booking_closed
      for (const k of ["gallery", "features"]) {
        if (form[k] !== undefined) payload[k] = form[k]
      }
      payload.status = form.status ?? "draft"
      payload.currency = form.currency ?? "eur"
      // English overlay: drop empty scalars/maps so blanks fall back to Greek.
      if (form.translations?.en) {
        const enOut: Record<string, any> = {}
        for (const [k, v] of Object.entries(form.translations.en)) {
          if (v === "" || v == null) continue
          if (k === "combo_labels") {
            const map: Record<string, any> = {}
            for (const [ck, cv] of Object.entries(v as Record<string, any>)) {
              const clean: Record<string, any> = {}
              for (const [f, fv] of Object.entries(cv ?? {})) {
                if (fv === "" || fv == null) continue
                clean[f] = fv
              }
              if (Object.keys(clean).length) map[ck] = clean
            }
            if (Object.keys(map).length) enOut.combo_labels = map
            continue
          }
          enOut[k] = v
        }
        payload.translations = Object.keys(enOut).length ? { ...form.translations, en: enOut } : null
      } else {
        payload.translations = form.translations ?? null
      }
      await api.post(`/admin/workshops/${workshopId}`, payload)
      toast.success("Αποθηκεύτηκε")
      onSaved()
    } catch (e: any) {
      toast.error("Σφάλμα αποθήκευσης: " + (e?.message ?? e))
    } finally {
      setSaving(false)
    }
  }

  const runGenerate = async () => {
    if (!gen.from || !gen.to) {
      toast.error("Συμπληρώστε ημερομηνίες Από/Έως")
      return
    }
    try {
      const r = await api.post<{ created: number; skipped: number }>(
        `/admin/workshops/${workshopId}/slots/generate`,
        {
          weekday: Number(gen.weekday),
          start_time: gen.start_time,
          end_time: gen.end_time || null,
          capacity: Number(gen.capacity),
          combo_key: gen.combo_key || null,
          from: gen.from,
          to: gen.to,
        },
      )
      toast.success(`Δημιουργήθηκαν ${r.created} slots (${r.skipped} υπήρχαν ήδη)`)
      const { slots } = await api.get<{ slots: Slot[] }>(
        `/admin/workshops/${workshopId}/slots`,
      )
      setSlots(slots)
    } catch (e: any) {
      toast.error("Σφάλμα: " + (e?.message ?? e))
    }
  }

  const saveSlot = async (s: Slot) => {
    try {
      await api.post(`/admin/slots/${s.id}`, {
        capacity: Number(s.capacity),
        status: s.status,
        combo_key: s.combo_key || null,
      })
      toast.success("Το slot αποθηκεύτηκε")
    } catch (e: any) {
      toast.error("Σφάλμα: " + (e?.message ?? e))
    }
  }
  const deleteSlot = async (id: string) => {
    await api.del(`/admin/slots/${id}`)
    setSlots((sl) => sl.filter((s) => s.id !== id))
  }
  const cancelBooking = async (id: string) => {
    const { booking } = await api.post<{ booking: Booking }>(
      `/admin/bookings/${id}/cancel`,
      {},
    )
    setBookings((bs) => bs.map((b) => (b.id === id ? booking : b)))
    toast.success("Η κράτηση ακυρώθηκε")
  }

  const slotLabel = (id?: string | null) => {
    const s = slots.find((x) => x.id === id)
    return s ? `${s.date} ${s.start_time}` : "—"
  }

  // Combo options for the generator + per-slot select (from the edited combos).
  const comboOptions: { key: string; label: string }[] = (form._comboRows ?? [])
    .filter((r: ComboRow) => r.key)
    .map((r: ComboRow) => ({ key: r.key, label: r.label || r.key }))

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
        <FocusModal.Body className="flex flex-col overflow-y-auto">
          {loading ? (
            <div className="p-8 text-ui-fg-subtle">Φόρτωση…</div>
          ) : (
            <Tabs defaultValue="content" className="flex flex-1 flex-col">
              <div className="border-b border-ui-border-base px-6 pt-4">
                <Tabs.List>
                  <Tabs.Trigger value="content">Περιεχόμενο & Τιμές</Tabs.Trigger>
                  <Tabs.Trigger value="availability">
                    Διαθεσιμότητα ({slots.length})
                  </Tabs.Trigger>
                  <Tabs.Trigger value="bookings">Κρατήσεις ({bookings.length})</Tabs.Trigger>
                </Tabs.List>
              </div>

              {/* CONTENT */}
              <Tabs.Content value="content" className="overflow-y-auto p-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-6">
                  <LangToggle lang={lang} onChange={setLang} />

                  <div className="grid grid-cols-2 gap-4">
                    {SCALARS.map((s) => {
                      const translatable = TRANSLATABLE_SCALARS.has(s.key)
                      const locked = en && !translatable
                      const value = translatable ? tval(s.key) : form[s.key] ?? ""
                      const onChange = (v: string) => (translatable ? tset(s.key, v) : set(s.key, v))
                      return (
                        <div key={s.key} className={`flex flex-col gap-1 ${s.full ? "col-span-2" : ""}`}>
                          <Label size="small" weight="plus">
                            {s.label}
                            {locked ? <span className="text-ui-fg-muted"> · κοινό</span> : null}
                          </Label>
                          {s.type === "textarea" ? (
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
                      )
                    })}
                    <div className="flex flex-col gap-1">
                      <Label size="small" weight="plus">
                        Μήνες (1–12, με κόμμα · κενό = κατόπιν ραντεβού)
                        {en ? <span className="text-ui-fg-muted"> · κοινό</span> : null}
                      </Label>
                      <Input
                        value={form._monthsText ?? ""}
                        placeholder="π.χ. 7, 8"
                        disabled={en}
                        onChange={(e) => set("_monthsText", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label size="small" weight="plus">
                        Κατάσταση
                      </Label>
                      <select
                        className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm disabled:opacity-50"
                        value={form.status ?? "draft"}
                        disabled={en}
                        onChange={(e) => set("status", e.target.value)}
                      >
                        <option value="draft">Πρόχειρο</option>
                        <option value="published">Δημοσιευμένο</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label size="small" weight="plus">
                        Κρατήσεις
                      </Label>
                      <select
                        className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm disabled:opacity-50"
                        value={form.booking_closed ? "closed" : "open"}
                        disabled={en}
                        onChange={(e) => set("booking_closed", e.target.value === "closed")}
                      >
                        <option value="open">Ανοιχτές</option>
                        <option value="closed">Κλειστές (εποχιακά)</option>
                      </select>
                    </div>
                  </div>

                  {en ? (
                    /* EN: translate combo labels only — prices stay on the Greek base. */
                    <div className="flex flex-col gap-3 rounded-lg border border-ui-border-base p-4">
                      <Label size="small" weight="plus">
                        Προγράμματα — αγγλικές ετικέτες
                      </Label>
                      {(form._comboRows ?? []).filter((r: ComboRow) => r.key).length === 0 ? (
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          Δεν υπάρχουν προγράμματα ακόμη (προσθέστε τα στα Ελληνικά).
                        </Text>
                      ) : (
                        (form._comboRows ?? [])
                          .filter((r: ComboRow) => r.key)
                          .map((r: ComboRow) => (
                            <div key={r.key} className="flex flex-col gap-2 rounded-md bg-ui-bg-subtle p-3">
                              <Text size="xsmall" className="text-ui-fg-subtle">
                                {r.key} · {r.label || "—"}
                              </Text>
                              <Input
                                placeholder="Label (EN)"
                                value={comboLabels[r.key]?.label ?? ""}
                                onChange={(e) => setComboLabel(r.key, "label", e.target.value)}
                              />
                              <Input
                                placeholder="Long label (EN)"
                                value={comboLabels[r.key]?.long_label ?? ""}
                                onChange={(e) => setComboLabel(r.key, "long_label", e.target.value)}
                              />
                              <Input
                                placeholder="Note (EN)"
                                value={comboLabels[r.key]?.note ?? ""}
                                onChange={(e) => setComboLabel(r.key, "note", e.target.value)}
                              />
                            </div>
                          ))
                      )}
                    </div>
                  ) : (
                    <>
                      <Repeater<ComboRow>
                        label="Προγράμματα & τιμές (συνδυασμοί εμπειρίας)"
                        value={form._comboRows}
                        onChange={(v) => set("_comboRows", v)}
                        fields={[
                          { key: "key", label: "Κλειδί (half / full)" },
                          { key: "label", label: "Ετικέτα (π.χ. Μισό πρόγραμμα)" },
                          { key: "long_label", label: "Πλήρης περιγραφή συνδυασμού", width: "col-span-2" },
                          { key: "start_time", label: "Ώρα από (π.χ. 11:00)" },
                          { key: "end_time", label: "Ώρα έως" },
                          { key: "adult", label: "€ Ενήλικες (12+)", type: "number" },
                          { key: "child", label: "€ Παιδιά (4–11)", type: "number" },
                          { key: "infant", label: "€ Βρέφη (0–3)", type: "number" },
                          { key: "price", label: "€ Ενιαία τιμή (μόνο για αίτημα)", type: "number" },
                          { key: "note", label: "Σημείωση", width: "col-span-2" },
                        ]}
                        blank={{
                          key: "",
                          label: "",
                          long_label: "",
                          start_time: "",
                          end_time: "",
                          adult: 0,
                          child: 0,
                          infant: 0,
                          price: "",
                          note: "",
                        }}
                      />
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        Συμπληρώστε τιμές ανά ηλικία για online κράτηση (half/full). Η
                        «Ενιαία τιμή» χρησιμοποιείται μόνο για εργαστήρια με φόρμα αιτήματος.
                      </Text>
                    </>
                  )}

                  <Repeater
                    label="Χαρακτηριστικά (features)"
                    value={jval("features")}
                    onChange={(v) => tset("features", v)}
                    fields={[
                      { key: "title", label: "Τίτλος", width: "col-span-2" },
                      { key: "text", label: "Κείμενο", type: "textarea", width: "col-span-2" },
                    ]}
                    blank={{ title: "", text: "" }}
                  />
                  <Repeater
                    label="Εικόνες gallery"
                    value={jval("gallery")}
                    onChange={(v) => tset("gallery", v)}
                    fields={[
                      { key: "url", label: "URL", width: "col-span-2" },
                      { key: "alt", label: "Alt", width: "col-span-2" },
                    ]}
                    blank={{ url: "", alt: "" }}
                  />
                </div>
              </Tabs.Content>

              {/* AVAILABILITY */}
              <Tabs.Content value="availability" className="overflow-y-auto p-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-6">
                  <div className="flex flex-col gap-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4">
                    <Heading level="h3">Δημιουργία επαναλαμβανόμενων slots</Heading>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <Text size="xsmall">Ημέρα</Text>
                        <select
                          className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm"
                          value={gen.weekday}
                          onChange={(e) => setGen({ ...gen, weekday: e.target.value })}
                        >
                          {WEEKDAYS.map((w, i) => (
                            <option key={i} value={i}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Text size="xsmall">Πρόγραμμα (combo)</Text>
                        <select
                          className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm"
                          value={gen.combo_key}
                          onChange={(e) => setGen({ ...gen, combo_key: e.target.value })}
                        >
                          <option value="">— κανένα —</option>
                          {comboOptions.map((c) => (
                            <option key={c.key} value={c.key}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <LabeledInput label="Χωρητικότητα" type="number" value={gen.capacity} onChange={(v) => setGen({ ...gen, capacity: v })} />
                      <LabeledInput label="Ώρα από" value={gen.start_time} onChange={(v) => setGen({ ...gen, start_time: v })} />
                      <LabeledInput label="Ώρα έως" value={gen.end_time} onChange={(v) => setGen({ ...gen, end_time: v })} />
                      <div />
                      <LabeledInput label="Από" type="date" value={gen.from} onChange={(v) => setGen({ ...gen, from: v })} />
                      <LabeledInput label="Έως" type="date" value={gen.to} onChange={(v) => setGen({ ...gen, to: v })} />
                    </div>
                    <div>
                      <Button size="small" variant="secondary" onClick={runGenerate}>
                        Δημιουργία
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-ui-border-base">
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Ημ/νία</Table.HeaderCell>
                          <Table.HeaderCell>Ώρα</Table.HeaderCell>
                          <Table.HeaderCell>Πρόγραμμα</Table.HeaderCell>
                          <Table.HeaderCell>Χωρητ.</Table.HeaderCell>
                          <Table.HeaderCell>Κρατ.</Table.HeaderCell>
                          <Table.HeaderCell>Κατάσταση</Table.HeaderCell>
                          <Table.HeaderCell />
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {slots.map((s) => (
                          <Table.Row key={s.id}>
                            <Table.Cell>{s.date}</Table.Cell>
                            <Table.Cell>
                              {s.start_time}
                              {s.end_time ? `–${s.end_time}` : ""}
                            </Table.Cell>
                            <Table.Cell>
                              <select
                                className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm"
                                value={s.combo_key ?? ""}
                                onChange={(e) =>
                                  setSlots((sl) =>
                                    sl.map((x) =>
                                      x.id === s.id ? { ...x, combo_key: e.target.value } : x,
                                    ),
                                  )
                                }
                              >
                                <option value="">—</option>
                                {comboOptions.map((c) => (
                                  <option key={c.key} value={c.key}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            </Table.Cell>
                            <Table.Cell>
                              <Input
                                className="w-16"
                                type="number"
                                value={String(s.capacity)}
                                onChange={(e) =>
                                  setSlots((sl) =>
                                    sl.map((x) =>
                                      x.id === s.id ? { ...x, capacity: e.target.value as any } : x,
                                    ),
                                  )
                                }
                              />
                            </Table.Cell>
                            <Table.Cell>{s.booked_count}</Table.Cell>
                            <Table.Cell>
                              <select
                                className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm"
                                value={s.status}
                                onChange={(e) =>
                                  setSlots((sl) =>
                                    sl.map((x) =>
                                      x.id === s.id ? { ...x, status: e.target.value } : x,
                                    ),
                                  )
                                }
                              >
                                <option value="open">Ανοιχτό</option>
                                <option value="closed">Κλειστό</option>
                              </select>
                            </Table.Cell>
                            <Table.Cell>
                              <div className="flex justify-end gap-1">
                                <IconButton size="small" variant="transparent" onClick={() => saveSlot(s)}>
                                  <ArrowDownTray />
                                </IconButton>
                                <IconButton size="small" variant="transparent" onClick={() => deleteSlot(s.id)}>
                                  <Trash />
                                </IconButton>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                        {slots.length === 0 ? (
                          <Table.Row>
                            <Table.Cell className="text-ui-fg-subtle">
                              Κανένα slot. Χωρίς slots, το εργαστήρι δέχεται αιτήματα (enquiry).
                            </Table.Cell>
                          </Table.Row>
                        ) : null}
                      </Table.Body>
                    </Table>
                  </div>
                </div>
              </Tabs.Content>

              {/* BOOKINGS */}
              <Tabs.Content value="bookings" className="overflow-y-auto p-6">
                <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-ui-border-base">
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Κωδικός</Table.HeaderCell>
                        <Table.HeaderCell>Ημ/νία</Table.HeaderCell>
                        <Table.HeaderCell>Πρόγραμμα</Table.HeaderCell>
                        <Table.HeaderCell>Πελάτης</Table.HeaderCell>
                        <Table.HeaderCell>Άτομα</Table.HeaderCell>
                        <Table.HeaderCell>Σύνολο</Table.HeaderCell>
                        <Table.HeaderCell>Κατάσταση</Table.HeaderCell>
                        <Table.HeaderCell />
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {bookings.map((b) => (
                        <Table.Row key={b.id}>
                          <Table.Cell>{b.reference}</Table.Cell>
                          <Table.Cell>{slotLabel(b.slot_id)}</Table.Cell>
                          <Table.Cell className="max-w-[180px] truncate" title={b.combo_label ?? ""}>
                            {b.combo_label ?? "—"}
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex flex-col">
                              <span>{b.customer_name}</span>
                              <span className="text-ui-fg-subtle text-xs">{b.email}</span>
                            </div>
                          </Table.Cell>
                          <Table.Cell>{b.adults + b.children + b.infants}</Table.Cell>
                          <Table.Cell>
                            {b.total_amount} {b.currency?.toUpperCase()}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              size="2xsmall"
                              color={
                                b.status === "confirmed"
                                  ? "green"
                                  : b.status === "cancelled"
                                    ? "red"
                                    : "grey"
                              }
                            >
                              {b.status}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            {b.status !== "cancelled" ? (
                              <Button size="small" variant="transparent" onClick={() => cancelBooking(b.id)}>
                                Ακύρωση
                              </Button>
                            ) : null}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {bookings.length === 0 ? (
                        <Table.Row>
                          <Table.Cell className="text-ui-fg-subtle">Καμία κράτηση ακόμη.</Table.Cell>
                        </Table.Row>
                      ) : null}
                    </Table.Body>
                  </Table>
                </div>
              </Tabs.Content>
            </Tabs>
          )}
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <Text size="xsmall">{label}</Text>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
