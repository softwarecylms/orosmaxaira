import Image from 'next/image'
import { Check } from 'lucide-react'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'
import { ADOPT_PAGE } from './adopt-content'

/** "Οι Δύο Επισκέψεις" — cinematic image cards with a dark gradient scrim, an
 *  overlaid season badge + title, a big ghost numeral, and a gold check-list of
 *  what each visit includes. */
export function VisitsShowcase() {
  const v = ADOPT_PAGE.visits

  return (
    <section id="visits" className="scroll-mt-24 pb-14 pt-6 md:pb-20 md:pt-8">
      <div className="container-wide flex flex-col gap-10 md:gap-14">
        <Reveal className="mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
            {v.eyebrow}
          </span>
          <h2 className="font-display text-[30px] font-bold leading-[1.1] text-foreground md:text-[40px]">
            {v.heading}
          </h2>
          <p className="text-[16px] leading-[1.6] text-muted">{v.sub}</p>
        </Reveal>

        <RevealStagger className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8" stagger={0.14}>
          {v.items.map((visit, idx) => (
            <RevealStaggerItem
              key={visit.title}
              className="relative flex flex-col overflow-hidden rounded-[22px] bg-white shadow-card ring-1 ring-border"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={visit.image}
                  alt={visit.title}
                  fill
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className={cn('object-cover', visit.imageClass)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-foreground/5" />
                <span className="pointer-events-none absolute -top-2 right-3 font-display text-[110px] font-bold leading-none text-white/35">
                  {idx === 0 ? '01' : '02'}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-6">
                  <div className="flex flex-wrap gap-2">
                    {visit.pills.map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[13px] font-medium text-white backdrop-blur"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display text-[26px] font-bold text-white md:text-[30px]">
                    {visit.title}
                  </h3>
                </div>
              </div>
              <ul className="flex flex-col gap-4 p-6 md:p-7">
                {visit.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-gold-strong">
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-[15px] leading-[1.55] text-foreground/90">{act.text}</span>
                  </li>
                ))}
              </ul>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}
