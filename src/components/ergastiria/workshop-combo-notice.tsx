import Link from 'next/link'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const linkCls = 'font-semibold text-accent underline-offset-2 hover:underline'

/**
 * The combination rule (R1): a workshop is never booked on its own — always
 * paired with an experience. Prominent callout reused on the hub and on every
 * workshop detail page. Server component (links only).
 */
export function WorkshopComboNotice({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'flex items-start gap-3.5 rounded-[16px] bg-accent-soft p-5 ring-1 ring-accent/15 md:p-6',
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-gold-strong shadow-card">
        <Info className="size-5" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-[16px] font-bold text-foreground md:text-[18px]">
          Πώς κρατούνται τα εργαστήρια
        </h3>
        <p className="text-[14.5px] leading-[1.65] text-foreground/80 md:text-[15px]">
          Τα βιωματικά εργαστήρια δεν κρατούνται αυτόνομα. Συνδυάζονται πάντα είτε με την εμπειρία{' '}
          <Link href="/drastiriotites/xenagiseis" className={linkCls}>
            «Γνωρίζω τη μέλισσα»
          </Link>
          , είτε με τον συνδυασμό{' '}
          <Link href="/drastiriotites/xenagiseis" className={linkCls}>
            «Γνωρίζω τη μέλισσα»
          </Link>{' '}
          &amp;{' '}
          <Link href="/drastiriotites/peripeteies-stis-kypseles" className={linkCls}>
            «Περιπέτειες στις Κυψέλες»
          </Link>
          .
        </p>
      </div>
    </aside>
  )
}
