import { TICKER } from './home-content'

/** Section 5 — honey-gold marquee strip (Figma 156:1431): uppercase white
 *  labels, no separators. Seamless CSS loop — the track is two identical
 *  groups translated -50%; each group repeats the labels enough times to be
 *  wider than any viewport, so the bar is never empty at the wrap point.
 *  CSS-driven so it pauses cleanly under prefers-reduced-motion. */
export function Ticker() {
  // One group repeats the labels so it always exceeds the viewport width; the
  // second (identical) group then fills the bar exactly when the track wraps.
  const group = Array.from({ length: 3 }, () => TICKER).flat()
  const run = [...group, ...group]

  return (
    <section
      data-testid="home-ticker"
      aria-label="Οφέλη αγοράς"
      className="overflow-hidden bg-accent"
    >
      <div className="home-marquee flex w-max items-center py-2.5 will-change-transform">
        {run.map((label, i) => (
          <span
            key={i}
            className="whitespace-nowrap px-16 text-[17px] uppercase leading-[24px] text-white"
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  )
}
