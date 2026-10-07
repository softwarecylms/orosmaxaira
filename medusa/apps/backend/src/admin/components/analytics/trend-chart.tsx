import { Checkbox, clx, Text } from "@medusajs/ui"
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { formatMetric, formatTick, type MetricKind } from "../../lib/analytics"

/**
 * One measure over time, the selected period against the one it is compared
 * with — the chart under WooCommerce's KPI tiles. Plain SVG, no chart library.
 *
 * Marks follow the data-viz rules: 2px lines, ≥8px dots ringed in the surface
 * colour, bars ≤24px with a rounded end, hairline grid, one y-axis. A crosshair
 * snaps to the nearest bucket and one tooltip lists both series; the arrow keys
 * do the same from the keyboard. The series colours (blue / orange) were checked
 * for colour-blind separation and contrast on the admin's light and dark
 * surfaces.
 */

export type ChartPoint = {
  label: string
  title: string
  previousTitle: string | null
  current: number
  previous: number | null
}

type Props = {
  points: ChartPoint[]
  kind: MetricKind
  type: "line" | "bar"
  currentLabel: string
  previousLabel: string
  currentTotal?: string
  previousTotal?: string
  ariaLabel: string
  dimmed?: boolean
  height?: number
}

const CSS = `
.oros-viz { --viz-current: #2a78d6; --viz-previous: #eb6834; }
.dark .oros-viz { --viz-current: #3987e5; --viz-previous: #d95926; }
`

const MARGIN = { top: 12, right: 16, bottom: 28 }
const BAR_MAX = 24

/** Round tick steps (1, 2, 2.5, 5 × 10ⁿ) covering [lo, hi]; whole steps for counts. */
function niceScale(lo: number, hi: number, wholeSteps: boolean, count = 4) {
  if (hi <= lo) hi = lo + (wholeSteps ? count : 1)
  const raw = (hi - lo) / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  let step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag
  if (wholeSteps) step = Math.max(1, Math.ceil(step))
  const min = Math.floor(lo / step) * step
  const max = Math.ceil(hi / step) * step
  const ticks: number[] = []
  for (let v = min; v <= max + step / 2; v += step) ticks.push(Math.round(v * 100) / 100)
  return { min, max, step, ticks }
}

/** A column with a 4px rounded data end and a square foot on the baseline. */
function barPath(x: number, yValue: number, yBase: number, w: number) {
  const h = Math.abs(yBase - yValue)
  if (h < 0.5) return ""
  const r = Math.min(4, w / 2, h)
  if (yValue <= yBase) {
    return `M${x},${yBase}V${yValue + r}A${r},${r} 0 0 1 ${x + r},${yValue}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${yValue + r}V${yBase}Z`
  }
  return `M${x},${yBase}V${yValue - r}A${r},${r} 0 0 0 ${x + r},${yValue}H${x + w - r}A${r},${r} 0 0 0 ${x + w},${yValue - r}V${yBase}Z`
}

/** A line through the points, broken where a value is missing. */
function linePath(xs: number[], ys: (number | null)[]) {
  let d = ""
  let pen = false
  ys.forEach((y, i) => {
    if (y === null) {
      pen = false
      return
    }
    d += `${pen ? "L" : "M"}${xs[i]},${y}`
    pen = true
  })
  return d
}

const LineKey = ({ color }: { color: string }) => (
  <span aria-hidden className="inline-block h-[2px] w-3 shrink-0 rounded-full" style={{ background: color }} />
)
const BarKey = ({ color }: { color: string }) => (
  <span aria-hidden className="inline-block size-2.5 shrink-0 rounded-[3px]" style={{ background: color }} />
)

export const TrendChart = ({
  points,
  kind,
  type,
  currentLabel,
  previousLabel,
  currentTotal,
  previousTotal,
  ariaLabel,
  dimmed,
  height = 260,
}: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  const [active, setActive] = useState<number | null>(null)
  const [show, setShow] = useState({ current: true, previous: true })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.floor(entry.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const n = points.length
  useEffect(() => setActive((a) => (a !== null && a >= n ? null : a)), [n])

  const scale = useMemo(() => {
    const values = points.flatMap((p) => [
      ...(show.current ? [p.current] : []),
      ...(show.previous && p.previous !== null ? [p.previous] : []),
    ])
    const lo = Math.min(0, ...values)
    const hi = Math.max(0, ...values)
    return niceScale(lo, hi, kind === "number")
  }, [points, show, kind])

  const tickText = scale.ticks.map((t) => formatTick(kind, t, scale.step))
  const left = Math.max(...tickText.map((t) => t.length)) * 6.5 + 14
  const plotW = Math.max(width - left - MARGIN.right, 40)
  const plotH = height - MARGIN.top - MARGIN.bottom
  const y = (v: number) => MARGIN.top + plotH - ((v - scale.min) / (scale.max - scale.min)) * plotH
  const yBase = y(Math.max(scale.min, Math.min(0, scale.max)))

  const band = plotW / Math.max(n, 1)
  const xs = points.map((_, i) =>
    type === "bar" ? left + band * (i + 0.5) : n === 1 ? left + plotW / 2 : left + (i * plotW) / (n - 1)
  )

  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(plotW / 72))))
  // Keep edge labels inside the chart: centred unless that would cut them off.
  const anchorFor = (x: number, text: string) => {
    const half = (text.length * 6) / 2
    return x - half < left - 8 ? "start" : x + half > width - 2 ? "end" : "middle"
  }
  const showDots = type === "line" && n <= 45

  const pick = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect || !n) return
    const x = clientX - rect.left
    const i = type === "bar" ? Math.floor((x - left) / band) : n === 1 ? 0 : Math.round(((x - left) / plotW) * (n - 1))
    setActive(Math.min(n - 1, Math.max(0, i)))
  }

  const onKey = (e: KeyboardEvent) => {
    if (!n) return
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault()
      const step = e.key === "ArrowRight" ? 1 : -1
      setActive((a) => (a === null ? (step > 0 ? 0 : n - 1) : Math.min(n - 1, Math.max(0, a + step))))
    } else if (e.key === "Escape") setActive(null)
  }

  const barW = Math.max(2, Math.min(BAR_MAX, (band * 0.72 - 2) / (show.current && show.previous ? 2 : 1)))
  const both = show.current && show.previous
  const point = active !== null ? points[active] : null
  const Key = type === "bar" ? BarKey : LineKey

  return (
    <div className={clx("oros-viz transition-opacity", dimmed && "opacity-50")}>
      <style>{CSS}</style>

      <div className="flex flex-wrap gap-x-6 gap-y-2 px-6 pb-2 pt-4">
        {(
          [
            ["current", currentLabel, currentTotal, "var(--viz-current)"],
            ["previous", previousLabel, previousTotal, "var(--viz-previous)"],
          ] as const
        ).map(([key, label, total, color]) => (
          <label key={key} className="flex cursor-pointer items-center gap-x-2">
            <Checkbox
              checked={show[key]}
              onCheckedChange={(v) => setShow((s) => ({ ...s, [key]: v === true }))}
              aria-label={`Εμφάνιση: ${label}`}
            />
            <Key color={color} />
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              {label}
            </Text>
            {total !== undefined ? (
              <Text size="small" weight="plus" leading="compact">
                {total}
              </Text>
            ) : null}
          </label>
        ))}
      </div>

      <div
        ref={wrapRef}
        className="relative px-0 outline-none focus-visible:shadow-borders-focus"
        tabIndex={0}
        role="group"
        aria-label={`${ariaLabel}. Με τα βέλη αριστερά/δεξιά εμφανίζονται οι τιμές.`}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        onPointerMove={(e: PointerEvent) => pick(e.clientX)}
        onPointerLeave={() => setActive(null)}
      >
        <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block">
          {scale.ticks.map((t, i) => (
            <g key={t}>
              <line
                x1={left}
                x2={left + plotW}
                y1={Math.round(y(t)) + 0.5}
                y2={Math.round(y(t)) + 0.5}
                stroke={t === 0 ? "var(--border-strong)" : "var(--border-base)"}
                strokeWidth={1}
              />
              <text
                x={left - 8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                fontSize={11}
                fill="var(--fg-muted)"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {tickText[i]}
              </text>
            </g>
          ))}

          {points.map((p, i) =>
            i % labelEvery === 0 ? (
              <text
                key={i}
                x={xs[i]}
                y={height - 8}
                fontSize={11}
                fill="var(--fg-muted)"
                textAnchor={anchorFor(xs[i], p.label)}
              >
                {p.label}
              </text>
            ) : null
          )}

          {point && active !== null ? (
            <line
              x1={xs[active]}
              x2={xs[active]}
              y1={MARGIN.top}
              y2={MARGIN.top + plotH}
              stroke="var(--border-strong)"
              strokeWidth={1}
            />
          ) : null}

          {type === "bar"
            ? points.map((p, i) => {
                const prevX = both ? xs[i] - barW - 1 : xs[i] - barW / 2
                const curX = both ? xs[i] + 1 : xs[i] - barW / 2
                const faded = active !== null && active !== i
                return (
                  <g key={i} opacity={faded ? 0.55 : 1}>
                    {show.previous && p.previous !== null ? (
                      <path d={barPath(prevX, y(p.previous), yBase, barW)} fill="var(--viz-previous)" />
                    ) : null}
                    {show.current ? <path d={barPath(curX, y(p.current), yBase, barW)} fill="var(--viz-current)" /> : null}
                  </g>
                )
              })
            : null}

          {type === "line" ? (
            <>
              {show.previous ? (
                <path
                  d={linePath(xs, points.map((p) => (p.previous === null ? null : y(p.previous))))}
                  fill="none"
                  stroke="var(--viz-previous)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ) : null}
              {show.current ? (
                <path
                  d={linePath(xs, points.map((p) => y(p.current)))}
                  fill="none"
                  stroke="var(--viz-current)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ) : null}
              {points.map((p, i) =>
                showDots || active === i ? (
                  <g key={i}>
                    {show.previous && p.previous !== null ? (
                      <circle cx={xs[i]} cy={y(p.previous)} r={4} fill="var(--viz-previous)" stroke="var(--bg-base)" strokeWidth={2} />
                    ) : null}
                    {show.current ? (
                      <circle cx={xs[i]} cy={y(p.current)} r={4} fill="var(--viz-current)" stroke="var(--bg-base)" strokeWidth={2} />
                    ) : null}
                  </g>
                ) : null
              )}
            </>
          ) : null}
        </svg>

        {point && active !== null ? (
          <div
            className="bg-ui-bg-base shadow-elevation-tooltip pointer-events-none absolute top-2 z-10 min-w-[180px] rounded-lg px-3 py-2"
            style={xs[active] > width / 2 ? { right: width - xs[active] + 12 } : { left: xs[active] + 12 }}
          >
            {show.current ? (
              <div className="flex items-center gap-x-2 py-0.5">
                <Key color="var(--viz-current)" />
                <Text size="small" weight="plus" leading="compact">
                  {formatMetric(kind, point.current)}
                </Text>
                <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                  {point.title}
                </Text>
              </div>
            ) : null}
            {show.previous && point.previous !== null ? (
              <div className="flex items-center gap-x-2 py-0.5">
                <Key color="var(--viz-previous)" />
                <Text size="small" weight="plus" leading="compact">
                  {formatMetric(kind, point.previous)}
                </Text>
                <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                  {point.previousTitle}
                </Text>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
