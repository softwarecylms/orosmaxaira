import { useEffect, useState } from "react"
import { Badge, Button, Heading, Table, Text, toast, usePrompt } from "@medusajs/ui"
import { ArrowUturnLeft, Trash, TriangleDownMini, TriangleRightMini } from "@medusajs/icons"
import { sdk } from "../lib/sdk"

/**
 * The trash for a list screen. Deleting from an editor is a soft delete, so the
 * record still exists — this is where it can be brought back, or finally
 * removed for good.
 *
 * Collapsed and unlabelled when empty, so it costs nothing on a screen where
 * nothing has been deleted.
 */

const COPY = {
  activity: {
    path: "activities",
    key: "activities",
    // Genitive pronoun, so «τις κρατήσεις της» agrees with η δραστηριότητα.
    possessive: "της",
    restored: "Η δραστηριότητα επαναφέρθηκε",
    purged: "Η δραστηριότητα διαγράφηκε οριστικά",
    purgeTitle: "Οριστική διαγραφή δραστηριότητας;",
  },
  workshop: {
    path: "workshops",
    key: "workshops",
    possessive: "του",
    restored: "Το εργαστήρι επαναφέρθηκε",
    purged: "Το εργαστήρι διαγράφηκε οριστικά",
    purgeTitle: "Οριστική διαγραφή εργαστηρίου;",
  },
} as const

type TrashedRecord = {
  id: string
  title: string
  slug: string
  deleted_at?: string | null
}

/** «πριν από 3 ημέρες» — a rough age is all this list needs. */
function deletedAgo(iso?: string | null): string {
  if (!iso) return "—"
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return "σήμερα"
  if (days === 1) return "χθες"
  return `πριν από ${days} ημέρες`
}

export function TrashSection({
  kind,
  reloadToken = 0,
  onRestored,
}: {
  kind: keyof typeof COPY
  /** Bump after a delete so the trash picks the record up. */
  reloadToken?: number
  /** Called after a restore, so the main list reloads too. */
  onRestored: () => void
}) {
  const copy = COPY[kind]
  const prompt = usePrompt()
  const [records, setRecords] = useState<TrashedRecord[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const load = () =>
    sdk.client
      .fetch<Record<string, TrashedRecord[]>>(`/admin/${copy.path}?deleted=1`, {
        method: "GET",
      })
      .then((r) => setRecords(r[copy.key] ?? []))
      .catch(() => setRecords([]))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken])

  const restore = async (record: TrashedRecord) => {
    setBusy(record.id)
    try {
      await sdk.client.fetch(`/admin/${copy.path}/${record.id}/restore`, { method: "POST" })
      toast.success(copy.restored)
      await load()
      onRestored()
    } catch (e: any) {
      toast.error(e?.message ?? String(e))
    } finally {
      setBusy(null)
    }
  }

  const purge = async (record: TrashedRecord) => {
    const confirmed = await prompt({
      title: copy.purgeTitle,
      description:
        `Το «${record.title}» θα διαγραφεί οριστικά, μαζί με τις ημερομηνίες και τις κρατήσεις ${copy.possessive}. ` +
        "Η ενέργεια αυτή δεν αναιρείται.",
      variant: "danger",
      verificationText: record.slug,
      verificationInstruction: "Πληκτρολογήστε {val} για επιβεβαίωση:",
      confirmText: "Οριστική διαγραφή",
      cancelText: "Άκυρο",
    })
    if (!confirmed) return

    setBusy(record.id)
    try {
      await sdk.client.fetch(`/admin/${copy.path}/${record.id}?permanent=1`, {
        method: "DELETE",
      })
      toast.success(copy.purged)
      await load()
    } catch (e: any) {
      toast.error(e?.message ?? String(e))
    } finally {
      setBusy(null)
    }
  }

  if (!records.length) return null

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-6 py-4 text-left"
      >
        {open ? <TriangleDownMini /> : <TriangleRightMini />}
        <Trash className="text-ui-fg-muted" />
        <Heading level="h3" className="text-ui-fg-subtle">
          Κάδος ανακύκλωσης
        </Heading>
        <Badge size="2xsmall" color="grey">
          {records.length}
        </Badge>
      </button>

      {open ? (
        <>
          <Table>
            <Table.Body>
              {records.map((r) => (
                <Table.Row key={r.id}>
                  <Table.Cell>{r.title}</Table.Cell>
                  <Table.Cell className="text-ui-fg-subtle">/{r.slug}</Table.Cell>
                  <Table.Cell className="text-ui-fg-subtle">
                    Διαγράφηκε {deletedAgo(r.deleted_at)}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        isLoading={busy === r.id}
                        onClick={() => restore(r)}
                      >
                        <ArrowUturnLeft />
                        Επαναφορά
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        disabled={busy === r.id}
                        onClick={() => purge(r)}
                      >
                        Οριστική διαγραφή
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Text size="xsmall" className="px-6 py-3 text-ui-fg-muted">
            Ό,τι βρίσκεται στον κάδο δεν εμφανίζεται στον ιστότοπο. Η επαναφορά
            τα φέρνει πίσω μαζί με τις ημερομηνίες και τις κρατήσεις τους.
          </Text>
        </>
      ) : null}
    </div>
  )
}
