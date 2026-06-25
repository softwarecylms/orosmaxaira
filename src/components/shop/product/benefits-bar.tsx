import { ShieldCheck, Truck, CreditCard, Leaf, Headset } from 'lucide-react'
import { RevealGroup, RevealItem } from '@/components/home/reveal-up'

const ITEMS = [
  { icon: ShieldCheck, label: '100% ΕΓΓΥΗΣΗ ΑΓΝΟΤΗΤΑΣ' },
  { icon: Truck, label: 'ΑΜΕΣΗ ΠΑΡΑΔΟΣΗ' },
  { icon: CreditCard, label: 'ΑΣΦΑΛΕΙΣ ONLINE ΠΛΗΡΩΜΕΣ' },
  { icon: Leaf, label: 'ΟΙΚΟΛΟΓΙΚΗ ΣΥΣΚΕΥΑΣΙΑ' },
  { icon: Headset, label: 'ΑΜΕΣΗ ΕΞΥΠΗΡΕΤΗΣΗ' },
]

/** Gold trust strip under the product info (Figma 237:1213). Full row on tablet+,
 *  a continuously-scrolling marquee on mobile. */
export function BenefitsBar() {
  return (
    <section className="bg-accent text-white">
      {/* Tablet / desktop: full row */}
      <RevealGroup
        className="container-wide hidden flex-wrap items-center justify-center gap-x-8 gap-y-3 py-4 md:flex md:justify-between md:gap-x-4"
        stagger={0.07}
      >
        {ITEMS.map(({ icon: Icon, label }) => (
          <RevealItem key={label} className="flex items-center gap-2.5">
            <Icon className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <span className="text-[13px] font-medium leading-[18px] tracking-wide">{label}</span>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Mobile: continuous marquee (items duplicated for a seamless loop) */}
      <div className="overflow-hidden py-3.5 md:hidden">
        <ul
          className="flex w-max items-center"
          style={{ animation: 'marquee-x 20s linear infinite' }}
        >
          {[...ITEMS, ...ITEMS].map(({ icon: Icon, label }, i) => (
            <li key={i} className="flex shrink-0 items-center gap-2.5 px-5">
              <Icon className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
              <span className="whitespace-nowrap text-[13px] font-medium leading-[18px] tracking-wide">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
