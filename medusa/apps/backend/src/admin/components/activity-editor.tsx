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
import { ImagePicker } from "./image-picker"
import { ImageGallery } from "./image-gallery"
import { RichTextarea } from "./rich-textarea"
import { ViewPageButton } from "./view-page-button"
import { LangToggle } from "./lang-toggle"

const api = {
  get: <T,>(u: string) => sdk.client.fetch<T>(u, { method: "GET" }),
  post: <T,>(u: string, body: unknown) =>
    sdk.client.fetch<T>(u, { method: "POST", body: body as Record<string, unknown> }),
  del: <T,>(u: string) => sdk.client.fetch<T>(u, { method: "DELETE" }),
}

const WEEKDAYS = [
  "Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο",
]

const CONTENT_SCALARS: {
  key: string
  label: string
  type?: "text" | "number" | "textarea" | "image"
  full?: boolean
}[] = [
  { key: "title", label: "Τίτλος" },
  { key: "slug", label: "Permalink (slug)" },
  { key: "subtitle", label: "Υπότιτλος", full: true },
  { key: "hero_image", label: "Κύρια εικόνα", type: "image", full: true },
  { key: "hero_image_alt", label: "Alt κύριας εικόνας" },
  { key: "video_url", label: "Video URL", full: true },
  { key: "description", label: "Περιγραφή", type: "textarea", full: true },
  { key: "details", label: "Λεπτομέρειες", type: "textarea", full: true },
  { key: "note", label: "Σημαντική σημείωση", type: "textarea", full: true },
  { key: "rating", label: "Βαθμολογία (0–5)", type: "number" },
  { key: "review_count", label: "Αριθμός κριτικών", type: "number" },
  { key: "duration_label", label: "Διάρκεια" },
  { key: "age_label", label: "Ηλικίες" },
  { key: "season_start_month", label: "Σεζόν από (μήνας 1–12)", type: "number" },
  { key: "season_end_month", label: "Σεζόν έως (μήνας 1–12)", type: "number" },
  { key: "currency", label: "Νόμισμα" },
  { key: "meta_title", label: "SEO τίτλος", full: true },
  { key: "meta_description", label: "SEO περιγραφή", type: "textarea", full: true },
]

const NUMERIC = new Set([
  "rating",
  "review_count",
  "season_start_month",
  "season_end_month",
])

// Scalar fields that carry an English translation. Everything else (slug, image
// URLs, video, prices, dates, numbers, currency, status, booking_type) is shared
// across locales and stays editable only in the Greek (base) view.
const TRANSLATABLE_SCALARS = new Set([
  "title",
  "subtitle",
  "hero_image_alt",
  "description",
  "details",
  "note",
  "duration_label",
  "age_label",
  "meta_title",
  "meta_description",
])
// Repeater / structured-content keys get an English overlay too (price_tiers,
// features, policies, gallery, reviews, benefits) — bound via `jval`/`tset`, which
// seed the English array from the Greek one so only the visible strings change.

type Slot = {
  id: string
  date: string
  start_time: string
  end_time?: string | null
  capacity: number
  booked_count: number
  status: string
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
}

/** Full activity editor: content + prices, availability (with generator), bookings. */
export function ActivityEditor({
  activityId,
  open,
  onClose,
  onSaved,
}: {
  activityId: string
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
    start_time: "10:00",
    end_time: "12:00",
    capacity: "15",
    from: "",
    to: "",
  })

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  // Language being edited in the content tab. "el" edits the base record;
  // "en" edits the `translations.en` overlay (only translatable fields).
  const [lang, setLang] = useState<"el" | "en">("el")
  const en = lang === "en"

  // Value/setter routed to the base record or the English overlay.
  const tval = (k: string) => (en ? form.translations?.en?.[k] ?? "" : form[k] ?? "")
  const tset = (k: string, v: any) =>
    en
      ? setForm((f) => ({
          ...f,
          translations: { ...(f.translations ?? {}), en: { ...(f.translations?.en ?? {}), [k]: v } },
        }))
      : set(k, v)
  // Repeater/JSON value: in EN, fall back to the Greek array until it's overridden
  // so the editor starts from the existing structure (prices, keys, images).
  const jval = (k: string) => (en ? form.translations?.en?.[k] ?? form[k] : form[k])

  const reload = async () => {
    const [{ activity }, { slots }, { bookings }] = await Promise.all([
      api.get<{ activity: any }>(`/admin/activities/${activityId}`),
      api.get<{ slots: Slot[] }>(`/admin/activities/${activityId}/slots`),
      api.get<{ bookings: Booking[] }>(`/admin/bookings?activity_id=${activityId}`),
    ])
    setForm(activity)
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
  }, [open, activityId])

  const save = async () => {
    setSaving(true)
    try {
      const payload: Record<string, any> = {}
      for (const s of CONTENT_SCALARS) {
        let v = form[s.key]
        if (NUMERIC.has(s.key)) v = v === "" || v == null ? null : Number(v)
        payload[s.key] = v
      }
      for (const k of ["price_tiers", "gallery", "features", "policies", "reviews", "related_slugs"]) {
        if (form[k] !== undefined) payload[k] = form[k]
      }
      // Coerce repeater number cells (they can be typed as "" while editing) so a
      // paid tier never persists as an empty string (which the storefront reads as 0).
      if (Array.isArray(payload.price_tiers)) {
        payload.price_tiers = payload.price_tiers.map((t: any) => ({
          ...t,
          price: Number(t.price) || 0,
          // Empty ⇒ null (this tier has no separate weekend price → falls back
          // to `price`); otherwise a number.
          weekend_price:
            t.weekend_price === "" || t.weekend_price == null
              ? null
              : Number(t.weekend_price) || 0,
        }))
      }
      if (Array.isArray(payload.reviews)) {
        payload.reviews = payload.reviews.map((r: any) => ({
          ...r,
          rating: r.rating === "" || r.rating == null ? null : Number(r.rating),
        }))
      }
      payload.status = form.status ?? "draft" // rendered as a separate select
      payload.booking_type = form.booking_type ?? "seats"
      if (form.benefits !== undefined) payload.benefits = form.benefits
      // English overlay: drop empty scalars so a blank EN field falls back to Greek.
      if (form.translations?.en) {
        const enOut: Record<string, any> = {}
        for (const [k, v] of Object.entries(form.translations.en)) {
          if (v === "" || v == null) continue
          enOut[k] = v
        }
        payload.translations = Object.keys(enOut).length ? { ...form.translations, en: enOut } : null
      } else {
        payload.translations = form.translations ?? null
      }
      await api.post(`/admin/activities/${activityId}`, payload)
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
        `/admin/activities/${activityId}/slots/generate`,
        {
          weekday: Number(gen.weekday),
          start_time: gen.start_time,
          end_time: gen.end_time || null,
          capacity: Number(gen.capacity),
          from: gen.from,
          to: gen.to,
        },
      )
      toast.success(`Δημιουργήθηκαν ${r.created} slots (${r.skipped} υπήρχαν ήδη)`)
      const { slots } = await api.get<{ slots: Slot[] }>(
        `/admin/activities/${activityId}/slots`,
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

  return (
    <FocusModal open={open} onOpenChange={(v) => !v && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <div className="flex w-full items-center justify-between gap-4">
            <Text className="text-ui-fg-subtle">
              {form.title ? `Επεξεργασία: ${form.title}` : "Δραστηριότητα"}
            </Text>
            <div className="flex items-center gap-2">
              <ViewPageButton kind="activity" slug={form.slug as string | undefined} />
              <Button size="small" onClick={save} isLoading={saving}>
                Αποθήκευση
              </Button>
            </div>
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
                  <Tabs.Trigger value="bookings">
                    Κρατήσεις ({bookings.length})
                  </Tabs.Trigger>
                </Tabs.List>
              </div>

              {/* CONTENT */}
              <Tabs.Content value="content" className="overflow-y-auto p-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-6">
                  <LangToggle lang={lang} onChange={setLang} />

                  <div className="grid grid-cols-2 gap-4">
                    {CONTENT_SCALARS.map((s) => {
                      if (s.key === "status") return null
                      const translatable = TRANSLATABLE_SCALARS.has(s.key)
                      // Shared (non-translatable) fields are read-only in EN mode.
                      const locked = en && !translatable
                      const value = translatable ? tval(s.key) : form[s.key] ?? ""
                      const onChange = (v: string) =>
                        translatable ? tset(s.key, v) : set(s.key, v)
                      return (
                        <div
                          key={s.key}
                          className={`flex flex-col gap-1 ${s.full ? "col-span-2" : ""}`}
                        >
                          <Label size="small" weight="plus">
                            {s.label}
                            {locked ? <span className="text-ui-fg-muted"> · κοινό</span> : null}
                          </Label>
                          {s.type === "image" ? (
                            <ImagePicker
                              value={value}
                              onChange={onChange}
                              hint={locked ? "κοινό για όλες τις γλώσσες" : undefined}
                            />
                          ) : s.type === "textarea" ? (
                            <RichTextarea
                              value={value}
                              disabled={locked}
                              onChange={onChange}
                            />
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
                        Κατάσταση
                      </Label>
                      <select
                        className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm disabled:opacity-50"
                        value={form.status ?? "draft"}
                        disabled={en}
                        onChange={(e) => set("status", e.target.value)}
                      >
                        <option value="draft">Πρόχειρη</option>
                        <option value="published">Δημοσιευμένη</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label size="small" weight="plus">
                        Τύπος κράτησης
                      </Label>
                      <select
                        className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm disabled:opacity-50"
                        value={form.booking_type ?? "seats"}
                        disabled={en}
                        onChange={(e) => set("booking_type", e.target.value)}
                      >
                        <option value="seats">Θέσεις (slots + πληρωμή)</option>
                        <option value="enquiry">Αίτημα / ραντεβού</option>
                      </select>
                    </div>
                  </div>

                  <Repeater
                    label="Τιμές (price tiers)"
                    value={jval("price_tiers")}
                    onChange={(v) => tset("price_tiers", v)}
                    fields={[
                      { key: "key", label: "Κλειδί (adult/child/infant)" },
                      { key: "price", label: "Τιμή καθημ. (€)", type: "number" },
                      { key: "weekend_price", label: "Τιμή Σ/Κ (€, προαιρετικό)", type: "number" },
                      { key: "label", label: "Ετικέτα", width: "col-span-2" },
                      { key: "note", label: "Σημείωση (π.χ. Δωρεάν)", width: "col-span-2" },
                    ]}
                    blank={{ key: "", label: "", price: 0, weekend_price: "", note: "" }}
                  />
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
                    label="Πολιτικές (accordion)"
                    value={jval("policies")}
                    onChange={(v) => tset("policies", v)}
                    fields={[
                      { key: "title", label: "Τίτλος", width: "col-span-2" },
                      { key: "body", label: "Κείμενο", type: "textarea", width: "col-span-2" },
                    ]}
                    blank={{ title: "", body: "" }}
                  />
                  <ImageGallery
                    label="Εικόνες gallery"
                    value={jval("gallery")}
                    onChange={(v) => tset("gallery", v)}
                  />
                  <Repeater
                    label="Κριτικές"
                    value={jval("reviews")}
                    onChange={(v) => tset("reviews", v)}
                    fields={[
                      { key: "name", label: "Όνομα" },
                      { key: "rating", label: "Βαθμ. (1–5)", type: "number" },
                      { key: "date", label: "Ημ/νία" },
                      { key: "body", label: "Κείμενο", type: "textarea", width: "col-span-2" },
                    ]}
                    blank={{ name: "", rating: 5, date: "", body: "" }}
                  />

                  {/* Οφέλη — for enquiry activities like Μελισσοθεραπεία. */}
                  <div className="flex flex-col gap-3 rounded-lg border border-ui-border-base p-4">
                    <Label size="small" weight="plus">
                      Οφέλη (π.χ. Μελισσοθεραπεία)
                    </Label>
                    <div className="flex flex-col gap-1">
                      <Text size="xsmall">Εισαγωγή</Text>
                      <Textarea
                        value={jval("benefits")?.intro ?? ""}
                        onChange={(e) =>
                          tset("benefits", { ...(jval("benefits") ?? {}), intro: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Text size="xsmall">Λίστα — μία κατάσταση ανά γραμμή</Text>
                      <Textarea
                        value={(jval("benefits")?.items ?? []).join("\n")}
                        onChange={(e) =>
                          tset("benefits", {
                            ...(jval("benefits") ?? {}),
                            items: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean),
                          })
                        }
                      />
                    </div>
                  </div>
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
                      <LabeledInput label="Ώρα από" value={gen.start_time} onChange={(v) => setGen({ ...gen, start_time: v })} />
                      <LabeledInput label="Ώρα έως" value={gen.end_time} onChange={(v) => setGen({ ...gen, end_time: v })} />
                      <LabeledInput label="Χωρητικότητα" type="number" value={gen.capacity} onChange={(v) => setGen({ ...gen, capacity: v })} />
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
                              <Input
                                className="w-16"
                                type="number"
                                value={String(s.capacity)}
                                onChange={(e) =>
                                  setSlots((sl) =>
                                    sl.map((x) =>
                                      // Keep the raw value so the field can be cleared
                                      // mid-edit; saveSlot coerces with Number().
                                      x.id === s.id
                                        ? { ...x, capacity: e.target.value as any }
                                        : x,
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
                              <Button
                                size="small"
                                variant="transparent"
                                onClick={() => cancelBooking(b.id)}
                              >
                                Ακύρωση
                              </Button>
                            ) : null}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {bookings.length === 0 ? (
                        <Table.Row>
                          <Table.Cell className="text-ui-fg-subtle">
                            Καμία κράτηση ακόμη.
                          </Table.Cell>
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
