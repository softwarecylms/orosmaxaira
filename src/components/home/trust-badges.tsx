import { RevealGroup, RevealItem } from './reveal-up'
import { TRUST, type TrustIcon } from './home-content'
import { PurityIcon, DeliveryIcon, EcoIcon, PaymentIcon } from './trust-icons'

const ICONS: Record<TrustIcon, (props: { className?: string }) => React.ReactElement> = {
  purity: PurityIcon,
  delivery: DeliveryIcon,
  eco: EcoIcon,
  payment: PaymentIcon,
}

/** Section 3 — four trust badges (Figma 156:592). */
export function TrustBadges() {
  return (
    <section data-testid="trust-badges" className="bg-white py-14 md:py-[72px]">
      <div className="container-wide">
        <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 lg:grid-cols-4">
          {TRUST.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <RevealItem
                key={item.title}
                data-testid="trust-badge-cell"
                className="flex flex-col items-center px-2 text-center"
              >
                <Icon className="h-[34px] w-auto text-accent" />
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
