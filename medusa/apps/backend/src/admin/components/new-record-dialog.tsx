import { Button, FocusModal, Input, Label, Text, toast } from "@medusajs/ui"
import { useState } from "react"
import { sdk } from "../lib/sdk"

/**
 * "Νέα δραστηριότητα" / "Νέο εργαστήρι" — collects a title and a permalink,
 * creates a DRAFT record, and hands its id back so the caller can open the full
 * editor on it.
 *
 * The record is created only once the form is confirmed, rather than on the
 * button click: an abandoned click would otherwise leave an empty draft behind,
 * and the list has no delete action to clear one.
 *
 * `slug` is unique in the model, so a clash is reported as such instead of
 * surfacing the raw Postgres error.
 */

/** Greek → Latin, matching the hand-written slugs already in the catalogue
 *  ("Περιπέτειες στις Κυψέλες" → "peripeteies-stis-kypseles"). */
const GREEK: Record<string, string> = {
  α: "a", β: "v", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th", ι: "i",
  κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s",
  ς: "s", τ: "t", υ: "y", φ: "f", χ: "ch", ψ: "ps", ω: "o",
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents (ά → α)
    .split("")
    .map((ch) => GREEK[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export function NewRecordDialog({
  kind,
  open,
  onClose,
  onCreated,
}: {
  kind: "activity" | "workshop"
  open: boolean
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const labels =
    kind === "activity"
      ? { heading: "Νέα δραστηριότητα", titleLabel: "Τίτλος δραστηριότητας", placeholder: "π.χ. Ξενάγηση στο μελισσοκομείο" }
      : { heading: "Νέο εργαστήρι", titleLabel: "Τίτλος εργαστηρίου", placeholder: "π.χ. Εργαστήρι κεριού" }

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  const effectiveSlug = slugTouched ? slugify(slug) : slugify(title)
  const canCreate = !!title.trim() && !!effectiveSlug && !saving

  const reset = () => {
    setTitle("")
    setSlug("")
    setSlugTouched(false)
  }

  const create = async () => {
    if (!canCreate) return
    setSaving(true)
    try {
      const path = kind === "activity" ? "/admin/activities" : "/admin/workshops"
      // status defaults to "draft" in the model — a new record is never public
      // until it is filled in and published from the editor.
      const res = await sdk.client.fetch<{ activity?: { id: string }; workshop?: { id: string } }>(
        path,
        { method: "POST", body: { title: title.trim(), slug: effectiveSlug } },
      )
      const id = (res.activity ?? res.workshop)?.id
      if (!id) throw new Error("Δεν επιστράφηκε αναγνωριστικό.")
      toast.success(`${labels.heading} — δημιουργήθηκε ως πρόχειρη.`)
      reset()
      onCreated(id)
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e)
      toast.error(
        // Medusa reports this as "Activity with slug: x, already exists."
        /unique|duplicate|already exists/i.test(msg)
          ? `Το permalink «${effectiveSlug}» χρησιμοποιείται ήδη — δοκιμάστε άλλο.`
          : "Σφάλμα δημιουργίας: " + msg,
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <FocusModal
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset()
          onClose()
        }
      }}
    >
      <FocusModal.Content>
        <FocusModal.Header>
          <div className="flex w-full items-center justify-between gap-4">
            <Text className="text-ui-fg-subtle">{labels.heading}</Text>
            <Button size="small" onClick={create} isLoading={saving} disabled={!canCreate}>
              Δημιουργία
            </Button>
          </div>
        </FocusModal.Header>
        <FocusModal.Body className="flex justify-center overflow-y-auto p-6">
          <div className="flex w-full max-w-[560px] flex-col gap-5">
            <div className="flex flex-col gap-1">
              <Label weight="plus">{labels.titleLabel}</Label>
              <Input
                autoFocus
                value={title}
                placeholder={labels.placeholder}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    void create()
                  }
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label weight="plus">Permalink</Label>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Η διεύθυνση της σελίδας. Συμπληρώνεται αυτόματα από τον τίτλο — αλλάξτε
                τη μόνο αν χρειάζεται, γιατί μετά τη δημοσίευση είναι μόνιμη.
              </Text>
              <Input
                value={slugTouched ? slug : effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(e.target.value)
                }}
              />
            </div>

            <Text size="small" className="text-ui-fg-subtle">
              Δημιουργείται ως <strong>πρόχειρη</strong> — δεν εμφανίζεται στο site μέχρι
              να τη συμπληρώσετε και να τη δημοσιεύσετε.
            </Text>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}
