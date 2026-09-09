import { IconButton, toast, usePrompt } from "@medusajs/ui"
import { Trash } from "@medusajs/icons"
import { sdk } from "../lib/sdk"

/**
 * Subtle trash button for an editor header. Confirms first, then moves the
 * record to the trash — a soft delete, so the page disappears from the site
 * and the admin list but nothing is lost and it can be restored from
 * «Κάδος ανακύκλωσης» on the list screen.
 *
 * When the record has bookings against it, the confirmation says so: those
 * customers keep their reference but lose the page they booked from, which is
 * a decision worth making deliberately.
 */

// `pronoun` keeps the sentence agreeing in gender: η δραστηριότητα → «να την
// επαναφέρετε», το εργαστήρι → «να το επαναφέρετε».
const COPY = {
  activity: {
    noun: "τη δραστηριότητα",
    subject: "Η δραστηριότητα",
    pronoun: "την",
    path: "activities",
  },
  workshop: {
    noun: "το εργαστήρι",
    subject: "Το εργαστήρι",
    pronoun: "το",
    path: "workshops",
  },
} as const

export function DeleteRecordButton({
  kind,
  id,
  title,
  bookingCount = 0,
  disabled = false,
  onDeleted,
}: {
  kind: keyof typeof COPY
  id: string
  title?: string | null
  /** Bookings already taken against this record — surfaced in the warning. */
  bookingCount?: number
  disabled?: boolean
  onDeleted: () => void
}) {
  const prompt = usePrompt()
  const copy = COPY[kind]

  const remove = async () => {
    const confirmed = await prompt({
      title: "Μεταφορά στον κάδο;",
      description: [
        `Θα αφαιρέσετε ${copy.noun}${title ? ` «${title}»` : ""} από τον ιστότοπο.`,
        bookingCount > 0
          ? `Προσοχή: υπάρχουν ${bookingCount} κρατήσεις — οι πελάτες δεν θα μπορούν πλέον να δουν τη σελίδα.`
          : "",
        `Μπορείτε να ${copy.pronoun} επαναφέρετε ανά πάσα στιγμή από τον κάδο ανακύκλωσης.`,
      ]
        .filter(Boolean)
        .join(" "),
      variant: "danger",
      confirmText: "Μεταφορά στον κάδο",
      cancelText: "Άκυρο",
    })
    if (!confirmed) return

    try {
      await sdk.client.fetch(`/admin/${copy.path}/${id}`, { method: "DELETE" })
      toast.success(`${copy.subject} μεταφέρθηκε στον κάδο`)
      onDeleted()
    } catch (e: any) {
      toast.error("Σφάλμα διαγραφής: " + (e?.message ?? e))
    }
  }

  return (
    <IconButton
      size="small"
      variant="transparent"
      type="button"
      title="Μεταφορά στον κάδο"
      disabled={disabled}
      onClick={remove}
      className="text-ui-fg-muted hover:text-ui-fg-error"
    >
      <Trash />
    </IconButton>
  )
}
