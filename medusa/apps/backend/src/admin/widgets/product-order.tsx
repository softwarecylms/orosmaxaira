import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../lib/sdk"

/**
 * «Σειρά προϊόντων» — drag the products of one category into the order the shop
 * shows them in (its default «Προτεινόμενα» sort). Saved per product in
 * `metadata.sort_rank` by POST /admin/product-order, so both languages follow
 * the same order. Collapsed by default: the Products list stays as it was.
 *
 * Plain HTML5 drag and drop — no extra dependency — plus ↑/↓ buttons for anyone
 * who would rather click (and for keyboards).
 */

type Row = {
  id: string
  title: string
  thumbnail: string | null
  status: string
  categories: string[]
  sort_rank: number | null
}

const NO_CATEGORY = "Χωρίς κατηγορία"

/** Ranked first (by rank), then the rest in the order Medusa listed them. */
const byRank = (a: Row, b: Row) =>
  (a.sort_rank ?? Number.MAX_SAFE_INTEGER) - (b.sort_rank ?? Number.MAX_SAFE_INTEGER)

const ProductOrderWidget = () => {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<Row[] | null>(null)
  const [category, setCategory] = useState("")
  const [list, setList] = useState<Row[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || rows) return
    sdk.client
      .fetch<{ products: Row[] }>("/admin/product-order", { method: "GET" })
      .then((r) => setRows(r.products))
      .catch(() => toast.error("Δεν φορτώθηκαν τα προϊόντα"))
  }, [open, rows])

  const categories = useMemo(() => {
    const names = new Set<string>()
    for (const r of rows ?? []) names.add(r.categories[0] ?? NO_CATEGORY)
    return [...names].sort((a, b) => a.localeCompare(b, "el"))
  }, [rows])

  useEffect(() => {
    if (!category && categories.length) setCategory(categories.includes("Μέλι") ? "Μέλι" : categories[0])
  }, [categories, category])

  useEffect(() => {
    if (!rows || !category) return
    setList(rows.filter((r) => (r.categories[0] ?? NO_CATEGORY) === category).sort(byRank))
    setDirty(false)
  }, [rows, category])

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= list.length) return
    const next = [...list]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setList(next)
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    try {
      await sdk.client.fetch("/admin/product-order", { method: "POST", body: { ids: list.map((r) => r.id) } })
      const rank = new Map(list.map((r, i) => [r.id, (i + 1) * 10]))
      setRows((prev) => (prev ?? []).map((r) => (rank.has(r.id) ? { ...r, sort_rank: rank.get(r.id)! } : r)))
      toast.success(`Αποθηκεύτηκε η σειρά: ${category}`)
    } catch {
      toast.error("Η σειρά δεν αποθηκεύτηκε")
    } finally {
      setSaving(false)
    }
  }

  function pickCategory(next: string) {
    if (dirty && !window.confirm("Η νέα σειρά δεν έχει αποθηκευτεί. Να χαθεί;")) return
    setCategory(next)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Σειρά προϊόντων</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Σύρετε τα προϊόντα για να αλλάξετε τη σειρά τους στο κατάστημα (ελληνικά και αγγλικά).
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={() => setOpen((o) => !o)}>
          {open ? "Κλείσιμο" : "Αλλαγή σειράς"}
        </Button>
      </div>

      {open ? (
        <div className="flex flex-col gap-4 px-6 py-4">
          {!rows ? (
            <Text size="small">Φόρτωση…</Text>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2">
                  <Text size="small" weight="plus">Κατηγορία</Text>
                  <select
                    value={category}
                    onChange={(e) => pickCategory(e.target.value)}
                    className="bg-ui-bg-field shadow-borders-base rounded-md px-2 py-1.5 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <Button size="small" onClick={save} isLoading={saving} disabled={!dirty}>
                  Αποθήκευση
                </Button>
              </div>

              <ol data-product-order className="flex flex-col gap-1">
                {list.map((r, i) => (
                  <li
                    key={r.id}
                    draggable
                    onDragStart={() => setDragging(i)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (dragging !== null && dragging !== i) {
                        move(dragging, i)
                        setDragging(i)
                      }
                    }}
                    onDragEnd={() => setDragging(null)}
                    className={`flex cursor-grab items-center gap-3 rounded-md border px-3 py-2 ${
                      dragging === i ? "bg-ui-bg-highlight opacity-70" : "bg-ui-bg-base"
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
                    </Text>
                    <Button size="small" variant="transparent" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Πάνω">↑</Button>
                    <Button size="small" variant="transparent" onClick={() => move(i, i + 1)} disabled={i === list.length - 1} aria-label="Κάτω">↓</Button>
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
