import Link from 'next/link'
import { CalendarClock, ArrowRight } from 'lucide-react'

/**
 * Sidebar card shown when a seasonal workshop has its bookings closed
 * (`booking_closed`). Replaces the seat-booking widget / enquiry form with a
 * discreet "not available right now" message and a link to Επικοινωνία.
 */
export function WorkshopClosedNotice({
  seasonLabel,
}: {
  seasonLabel?: string | null
}) {
  const season = seasonLabel?.trim()
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-border bg-white p-6 shadow-card">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-gold-strong">
        <CalendarClock className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-[20px] font-bold leading-[1.15] text-foreground">
          Οι κρατήσεις είναι κλειστές
        </h3>
        <p className="text-[15px] leading-[1.6] text-muted">
          Πρόκειται για εποχιακό εργαστήρι{season ? ` (${season})` : ''}. Οι κρατήσεις θα
          ανοίξουν ξανά ενόψει της νέας περιόδου. Για ενημέρωση ή ομαδικό αίτημα,
          επικοινωνήστε μαζί μας.
        </p>
      </div>
      <Link
        href="/epikoinonia"
        className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-accent px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-foreground"
      >
        Επικοινωνήστε μαζί μας
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
