import { TICKER } from './home-content'

/** Section 5 — honey-gold marquee strip (Figma 156:1431). CSS-driven so it
 *  pauses cleanly under prefers-reduced-motion (see `.home-marquee`). */
export function Ticker() {
  // Duplicate the run once so translateX(-50%) loops seamlessly.
  const run = [...TICKER, ...TICKER]

  return (
    <section
      data-testid="home-ticker"
      aria-label="Οφέλη αγοράς"
      className="overflow-hidden bg-accent"
    >
      <div className="home-marquee flex w-max items-center py-3 will-change-transform">
        {run.map((label, i) => (
          <div key={i} className="flex items-center whitespace-nowrap">
            <span className="px-10 text-[14px] font-medium uppercase tracking-[0.08em] text-white">
              {label}
            </span>
            <span aria-hidden="true" className="text-[8px] text-white/60">
              ●
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
