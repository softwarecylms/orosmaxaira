import { BadgeCheck, Truck, Recycle, CreditCard } from 'lucide-react'
import { RevealGroup, RevealItem } from './reveal-up'
import { TRUST, type TrustIcon } from './home-content'

const ICONS: Record<TrustIcon, typeof BadgeCheck> = {
  purity: BadgeCheck,
  delivery: Truck,
  eco: Recycle,
  payment: CreditCard,
}

/** Section 3 — four trust badges (Figma 156:592). */
export function TrustBadges() {
  return (
    <section data-testid="trust-badges" className="bg-white py-14 md:py-[72px]">
      <div className="container-wide">
        <RevealGroup className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <RevealItem
                key={item.title}
                data-testid="trust-badge-cell"
                className="flex flex-col items-center px-2 text-center"
              >
                <Icon className="size-9 text-accent" strokeWidth={1.6} aria-hidden="true" />
                <h3 className="mt-4 text-[17px] font-bold leading-[24px] text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-[260px] text-[14px] leading-[21px] text-muted">
                  {item.body}
                </p>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
