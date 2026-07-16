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
    <section data-testid="trust-badges" className="bg-white py-12 md:py-[72px]">
      <div className="container-wide">
        <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4">
          {TRUST.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <RevealItem
                key={item.title}
                data-testid="trust-badge-cell"
                className="flex flex-col items-center px-2 text-center"
              >
                <Icon className="h-[30px] w-auto text-accent sm:h-[34px]" />
                <h3 className="mt-2.5 text-[17px] font-bold leading-[22px] text-foreground sm:mt-4 sm:leading-[24px]">
                  {item.title}
                </h3>
                <p className="mt-1.5 max-w-[260px] text-[13px] leading-[18px] text-muted sm:mt-2 sm:text-[14px] sm:leading-[21px]">
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
