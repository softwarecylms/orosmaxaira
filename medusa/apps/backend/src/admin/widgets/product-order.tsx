import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../lib/sdk"

/**
 * «Σειρά προϊόντων» — drag the products into the order the shop shows them in
 * (its default «Προτεινόμενα» sort). ONE overall order: the shop page follows it
 * as is, a category page shows its own products in the same relative order.
 * Saved per product in `metadata.sort_rank` by POST /admin/product-order, so
 * both languages follow it too. Collapsed by default.
 *
 * «Όλα τα προϊόντα» shows the whole list. Picking a category only filters the
 * view: its products are reordered among the positions they already hold, and
 * every other product stays where it is. Saving always sends the whole list.
 *
 * Plain HTML5 drag and drop — no extra dependency — plus ↑/↓ buttons for anyone
 * who would rather click (and for keyboards).
 */

type Row = {
  id: string
  title: string
  thumbnail: string | null
  status: string
  hidden: boolean
  category: string | null
  sort_rank: number | null
}

const ALL = "__all__"
const NO_CATEGORY = "Χωρίς κατηγορία"
const categoryOf = (r: Row) => r.category ?? NO_CATEGORY

const ProductOrderWidget = () => {
  const [open, setOpen] = useState(false)
  /** The whole order, as it will be saved. Arrives already in shop order. */
  const [order, setOrder] = useState<Row[] | null>(null)
  const [filter, setFilter] = useState(ALL)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || order) return
    sdk.client
      .fetch<{ products: Row[] }>("/admin/product-order", { method: "GET" })
      .then((r) => setOrder(r.products))
      .catch(() => toast.error("Δεν φορτώθηκαν τα προϊόντα"))
  }, [open, order])

  const categories = useMemo(() => {
    const seen: string[] = []
    for (const r of order ?? []) if (!seen.includes(categoryOf(r))) seen.push(categoryOf(r))
    return seen // first-appearance order = the shop's category order
  }, [order])

  const visible = useMemo(
    () => (order ?? []).filter((r) => filter === ALL || categoryOf(r) === filter),
    [order, filter],
  )

  /** Move within the visible list; in a filtered view the moved rows trade the
   *  positions they already hold in the whole list, nothing else moves. */
  function move(from: number, to: number) {
    if (!order || from === to || to < 0 || to >= visible.length) return
    const next = [...visible]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    if (filter === ALL) {
      setOrder(next)
    } else {
      const queue = [...next]
      setOrder(order.map((r) => (categoryOf(r) === filter ? queue.shift()! : r)))
    }
    setDirty(true)
  }

  async function save() {
    if (!order) return
    setSaving(true)
    try {
      await sdk.client.fetch("/admin/product-order", { method: "POST", body: { ids: order.map((r) => r.id) } })
      setOrder(order.map((r, i) => ({ ...r, sort_rank: (i + 1) * 10 })))
      setDirty(false)
      toast.success("Αποθηκεύτηκε η σειρά των προϊόντων")
    } catch {
      toast.error("Η σειρά δεν αποθηκεύτηκε")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Σειρά προϊόντων</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Σύρετε τα προϊόντα για να αλλάξετε τη σειρά τους στο κατάστημα — ίδια σειρά σε ελληνικά και αγγλικά.
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={() => setOpen((o) => !o)}>
          {open ? "Κλείσιμο" : "Αλλαγή σειράς"}
        </Button>
      </div>

      {open ? (
        <div className="flex flex-col gap-4 px-6 py-4">
          {!order ? (
            <Text size="small">Φόρτωση…</Text>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2">
                  <Text size="small" weight="plus">Εμφάνιση</Text>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-ui-bg-field shadow-borders-base rounded-md px-2 py-1.5 text-sm"
                  >
                    <option value={ALL}>Όλα τα προϊόντα (σελίδα καταστήματος)</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center gap-3">
                  {dirty ? <Text size="small" className="text-ui-fg-subtle">Μη αποθηκευμένες αλλαγές</Text> : null}
                  <Button size="small" onClick={save} isLoading={saving} disabled={!dirty}>
                    Αποθήκευση
                  </Button>
                </div>
              </div>
              {filter !== ALL ? (
                <Text size="small" className="text-ui-fg-subtle">
                  Αλλάζετε τη σειρά μόνο μεταξύ των προϊόντων «{filter}» — τα υπόλοιπα μένουν στη θέση τους.
                </Text>
              ) : null}

              <ol data-product-order className="flex flex-col gap-1">
                {visible.map((r, i) => (
                  <li
                    key={r.id}
                    draggable
                    onDragStart={() => setDragging(r.id)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      const from = visible.findIndex((x) => x.id === dragging)
                      if (from >= 0 && from !== i) move(from, i)
                    }}
                    onDragEnd={() => setDragging(null)}
                    className={`flex cursor-grab items-center gap-3 rounded-md border px-3 py-2 ${
                      dragging === r.id ? "bg-ui-bg-highlight opacity-70" : "bg-ui-bg-base"
                    }`}
                  >
                    <span className="text-ui-fg-muted select-none" aria-hidden>⋮⋮</span>
                    <span className="text-ui-fg-subtle w-6 text-right text-xs">{i + 1}</span>
                    {r.thumbnail ? (
                      <img src={r.thumbnail} alt="" className="size-8 rounded object-cover" />
                    ) : (
                      <span className="bg-ui-bg-component size-8 rounded" />
                    )}
                    <Text size="small" className="flex-1 truncate">
                      {r.title}
                      {r.status !== "published" ? <span className="text-ui-fg-muted"> · πρόχειρο</span> : null}
                      {r.hidden ? <span className="text-ui-fg-muted"> · κρυφό</span> : null}
                    </Text>
                    {filter === ALL ? (
                      <Text size="xsmall" className="text-ui-fg-muted hidden w-40 truncate text-right md:block">
                        {categoryOf(r)}
                      </Text>
                    ) : null}
                    <Button size="small" variant="transparent" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Πάνω">↑</Button>
                    <Button size="small" variant="transparent" onClick={() => move(i, i + 1)} disabled={i === visible.length - 1} aria-label="Κάτω">↓</Button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      ) : null}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default ProductOrderWidget
