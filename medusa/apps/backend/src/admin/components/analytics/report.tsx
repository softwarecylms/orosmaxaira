import { ArrowDownMini, ArrowUpMini, ChartActivity, ChartBar, InformationCircleSolid, ListBullet } from "@medusajs/icons"
import { Alert, Badge, clx, Container, Heading, IconButton, Label, Select, Table, Text, Tooltip } from "@medusajs/ui"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  bucketLabel,
  bucketTitle,
  COMPARE_LABELS,
  delta,
  formatMetric,
  formatRange,
  INTERVAL_LABELS,
  METRICS,
  PERIOD_LABELS,
  useAnalyticsParams,
  useReport,
  type ReportData,
} from "../../lib/analytics"
import { DateRangePicker } from "./date-range-picker"
import { TrendChart, type ChartPoint } from "./trend-chart"

/**
 * The building blocks of an «Αναλύσεις» page: the header with the filters, the
 * KPI tiles, the chart and the leaderboards. Each route under routes/analytics
 * stacks them and adds its own table.
 */

export type ReportPage<Row = any> = ReturnType<typeof useReportPage<Row>>

export function useReportPage<Row = any>(report: string) {
  const params = useAnalyticsParams()
  const { data, loading, error } = useReport<Row>(report, params.apiQuery)
  return { report, data, loading, error, ...params }
}

/** The KPI whose chart is shown (`?chart=`), defaulting to the first. */
export function useSelectedMetric(page: ReportPage, metrics: string[]) {
  const chosen = page.get("chart")
  const selected = chosen && metrics.includes(chosen) ? chosen : metrics[0]
  return [selected, (key: string) => page.update({ chart: key })] as const
}

export const currentLabel = (d: ReportData) => `${PERIOD_LABELS[d.period] ?? d.period} (${formatRange(d.range)})`
export const previousLabel = (d: ReportData) => `${COMPARE_LABELS[d.compare] ?? d.compare} (${formatRange(d.compare_range)})`

export const Loading = () => <div className="text-ui-fg-subtle px-6 py-8">Φόρτωση…</div>

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export const ReportHeader = ({
  page,
  title,
  description,
  filters,
}: {
  page: ReportPage
  title: string
  description?: string
  filters?: ReactNode
}) => {
  const { data, error, get, update } = page
  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading>{title}</Heading>
        {description ? (
          <Text size="small" className="text-ui-fg-subtle mt-1">
            {description}
          </Text>
        ) : null}
      </div>
      <div className="flex flex-wrap items-end gap-4 px-6 py-4">
        <DateRangePicker
          period={data?.period ?? get("period") ?? "month"}
          compare={data?.compare ?? get("compare") ?? "previous_year"}
          range={data?.range ?? null}
          compareRange={data?.compare_range ?? null}
          onChange={(v) =>
            update({
              period: v.period,
              compare: v.compare,
              after: v.period === "custom" ? v.after : null,
              before: v.period === "custom" ? v.before : null,
              // A new range gets its own default interval.
              interval: null,
            })
          }
        />
        {filters}
      </div>
      {error ? (
        <div className="px-6 py-4">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}
    </Container>
  )
}

/** «Εμφάνιση»: all products, or one product (its variations then fill the table). */
export const ProductFilter = ({ page }: { page: ReportPage }) => {
  const products = page.data?.products ?? []
  return (
    <div className="flex flex-col gap-y-1.5">
      <Label size="xsmall" weight="plus" className="text-ui-fg-subtle">
        Εμφάνιση
      </Label>
      <Select
        size="small"
        value={page.get("product_id") ?? "all"}
        onValueChange={(v) => page.update({ product_id: v === "all" ? null : v })}
      >
        <Select.Trigger className="w-[280px]">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="all">Όλα τα προϊόντα</Select.Item>
          {products.map((p) => (
            <Select.Item key={p.id} value={p.id}>
              {p.title}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  )
}

// ---------------------------------------------------------------------------
// KPI tiles
// ---------------------------------------------------------------------------

const DeltaBadge = ({ metric, current, previous }: { metric: string; current: number; previous: number | undefined }) => {
  const d = delta(current, previous)
  if (d === null) {
    return (
      <Badge size="2xsmall" color="grey" title="Καμία κίνηση στην περίοδο σύγκρισης">
        —
      </Badge>
    )
  }
  const rounded = Math.round(d)
  const direction = METRICS[metric]?.direction ?? "neutral"
  const color = rounded === 0 || direction === "neutral" ? "grey" : (rounded > 0) === (direction === "up") ? "green" : "red"
  return (
    <Badge size="2xsmall" color={color} className="gap-x-0.5 tabular-nums">
      {rounded > 0 ? <ArrowUpMini /> : rounded < 0 ? <ArrowDownMini /> : null}
      {Math.abs(rounded)}%
    </Badge>
  )
}

/** Rows of equal length where possible: 6 tiles as 3 + 3, 7 as 4 + 3. */
const colsFor = (n: number) =>
  n <= 2 ? "lg:grid-cols-2" : n === 3 || n === 6 ? "lg:grid-cols-3" : "lg:grid-cols-4"

/**
 * The row of figures over the chart. Clicking one charts it (`onSelect`), or —
 * on the overview — opens its report (`links`).
 */
export const KpiTiles = ({
  page,
  metrics,
  selected,
  onSelect,
  links,
}: {
  page: ReportPage
  metrics: string[]
  selected?: string
  onSelect?: (key: string) => void
  links?: Record<string, string>
}) => {
  const { data, loading } = page
  const tile = (key: string) => {
    const m = METRICS[key]
    const current = data?.totals.current[key] ?? 0
    const previous = data?.totals.previous[key]
    const isSelected = selected === key
    const body = (
      <>
        {isSelected ? <span aria-hidden className="bg-ui-fg-interactive absolute inset-x-0 top-0 h-0.5" /> : null}
        <span className="flex items-center gap-x-1">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {m.label}
          </Text>
          {m.hint ? (
            <Tooltip content={m.hint}>
              <InformationCircleSolid className="text-ui-fg-muted" />
            </Tooltip>
          ) : null}
        </span>
        <span className="mt-3 flex items-end justify-between gap-x-2">
          <span className="text-ui-fg-base text-2xl font-medium leading-none">{data ? formatMetric(m.kind, current) : "—"}</span>
          {data ? <DeltaBadge metric={key} current={current} previous={previous} /> : null}
        </span>
        <Text size="xsmall" leading="compact" className="text-ui-fg-muted mt-2">
          {data && previous !== undefined ? `έναντι ${formatMetric(m.kind, previous)}` : " "}
        </Text>
      </>
    )
    const className = clx(
      "relative flex flex-col border-b border-r border-ui-border-base bg-ui-bg-base px-5 py-4 text-left outline-none transition-fg",
      (onSelect || links?.[key]) && "hover:bg-ui-bg-base-hover focus-visible:bg-ui-bg-base-hover"
    )
    if (links?.[key]) {
      return (
        <Link key={key} to={links[key]} className={className}>
          {body}
        </Link>
      )
    }
    if (onSelect) {
      return (
        <button key={key} type="button" className={className} aria-pressed={isSelected} onClick={() => onSelect(key)}>
          {body}
        </button>
      )
    }
    return (
      <div key={key} className={className}>
        {body}
      </div>
    )
  }

  return (
    <div
      className={clx(
        "shadow-elevation-card-rest bg-ui-bg-base overflow-hidden rounded-lg transition-opacity",
        loading && data && "opacity-50"
      )}
    >
      {/* Dividers are each tile's right/bottom border; the -1px margins tuck the outer ones under the card's edge. */}
      <div className={clx("-mb-px -mr-px grid grid-cols-1 sm:grid-cols-2", colsFor(metrics.length))}>
        {metrics.map(tile)}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Chart
// ---------------------------------------------------------------------------

type ChartType = "line" | "bar" | "table"

const TYPES: [type: ChartType, label: string, icon: ReactNode][] = [
  ["line", "Γράφημα γραμμής", <ChartActivity key="line" />],
  ["bar", "Γράφημα στηλών", <ChartBar key="bar" />],
  ["table", "Πίνακας", <ListBullet key="table" />],
]

function pointsOf(d: ReportData, metric: string): ChartPoint[] {
  return d.intervals.map((iv) => ({
    label: bucketLabel(iv, d.interval),
    title: bucketTitle(iv, d.interval),
    previousTitle: iv.previous_from ? bucketTitle({ key: iv.key, from: iv.previous_from, to: iv.previous_to ?? iv.previous_from }, d.interval) : null,
    current: iv.current[metric] ?? 0,
    previous: iv.previous ? (iv.previous[metric] ?? 0) : null,
  }))
}

/** The chart in table form — the same numbers without needing to hover. */
const ChartTable = ({ d, metric }: { d: ReportData; metric: string }) => {
  const kind = METRICS[metric].kind
  return (
    <div className="max-h-[320px] overflow-y-auto">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Περίοδος</Table.HeaderCell>
            <Table.HeaderCell className="text-right">{METRICS[metric].label}</Table.HeaderCell>
            <Table.HeaderCell>{COMPARE_LABELS[d.compare]}</Table.HeaderCell>
            <Table.HeaderCell className="text-right">{METRICS[metric].label}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {pointsOf(d, metric).map((p, i) => (
            <Table.Row key={i}>
              <Table.Cell>{p.title}</Table.Cell>
              <Table.Cell className="text-right tabular-nums">{formatMetric(kind, p.current)}</Table.Cell>
              <Table.Cell className="text-ui-fg-subtle">{p.previousTitle ?? "—"}</Table.Cell>
              <Table.Cell className="text-right tabular-nums">{p.previous === null ? "—" : formatMetric(kind, p.previous)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

/**
 * One chart per metric (two side by side on the overview), with the interval
 * and line/bar/table switch above them — the controls apply to every chart.
 */
export const ChartCard = ({ page, metrics }: { page: ReportPage; metrics: string[] }) => {
  const { data, loading, get, update } = page
  const type = (["line", "bar", "table"].includes(get("chart_type") ?? "") ? get("chart_type") : "line") as ChartType

  return (
    <Container className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Heading level="h2">{metrics.length === 1 ? METRICS[metrics[0]].label : "Γραφήματα"}</Heading>
        <div className="flex items-center gap-x-2">
          {data && data.intervals_allowed.length > 1 ? (
            <Select size="small" value={data.interval} onValueChange={(v) => update({ interval: v })}>
              <Select.Trigger className="w-[150px]" aria-label="Διάστημα">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {data.intervals_allowed.map((i) => (
                  <Select.Item key={i} value={i}>
                    {INTERVAL_LABELS[i] ?? i}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          ) : null}
          <div className="flex items-center" role="group" aria-label="Εμφάνιση γραφήματος">
            {TYPES.map(([t, label, icon]) => (
              <Tooltip key={t} content={label}>
                <IconButton
                  size="small"
                  variant="transparent"
                  aria-label={label}
                  aria-pressed={type === t}
                  className={clx(type === t ? "text-ui-fg-base bg-ui-bg-base-pressed" : "text-ui-fg-muted")}
                  onClick={() => update({ chart_type: t === "line" ? null : t })}
                >
                  {icon}
                </IconButton>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
      {!data ? (
        <Loading />
      ) : (
        <div className={clx("grid grid-cols-1 border-t", metrics.length > 1 && "xl:grid-cols-2 xl:divide-x")}>
          {metrics.map((metric) => (
            <div key={metric} className="min-w-0 pb-4">
              {metrics.length > 1 ? (
                <Text size="small" weight="plus" className="px-6 pt-4">
                  {METRICS[metric].label}
                </Text>
              ) : null}
              {type === "table" ? (
                <div className={clx("transition-opacity", loading && "opacity-50")}>
                  <ChartTable d={data} metric={metric} />
                </div>
              ) : (
                <TrendChart
                  points={pointsOf(data, metric)}
                  kind={METRICS[metric].kind}
                  type={type}
                  currentLabel={currentLabel(data)}
                  previousLabel={previousLabel(data)}
                  currentTotal={formatMetric(METRICS[metric].kind, data.totals.current[metric] ?? 0)}
                  previousTotal={formatMetric(METRICS[metric].kind, data.totals.previous[metric] ?? 0)}
                  ariaLabel={`${METRICS[metric].label}, ${currentLabel(data)}, σε σύγκριση με ${previousLabel(data)}`}
                  dimmed={loading}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}

// ---------------------------------------------------------------------------
// Leaderboards
// ---------------------------------------------------------------------------

export type LeaderColumn<R> = { label: string; align?: "right"; render: (r: R) => ReactNode }

export function Leaderboard<R>({
  title,
  rows,
  columns,
  more,
  dimmed,
}: {
  title: string
  rows: R[]
  columns: LeaderColumn<R>[]
  more?: { to: string; label: string }
  dimmed?: boolean
}) {
  return (
    <Container className={clx("flex flex-col p-0 transition-opacity", dimmed && "opacity-50")}>
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{title}</Heading>
        {more ? (
          <Link to={more.to} className="text-ui-fg-interactive txt-compact-small hover:underline">
            {more.label}
          </Link>
        ) : null}
      </div>
      <div className="border-t">
        <Table>
          <Table.Header>
            <Table.Row>
              {columns.map((c) => (
                <Table.HeaderCell key={c.label} className={clx(c.align === "right" && "text-right")}>
                  {c.label}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((r, i) => (
              <Table.Row key={i}>
                {columns.map((c) => (
                  <Table.Cell key={c.label} className={clx(c.align === "right" && "text-right tabular-nums")}>
                    {c.render(r)}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
            {!rows.length ? (
              <Table.Row>
                <td colSpan={columns.length} className="text-ui-fg-subtle txt-compact-small px-6 py-6 text-center">
                  Καμία κίνηση στην περίοδο.
                </td>
              </Table.Row>
            ) : null}
          </Table.Body>
        </Table>
      </div>
    </Container>
  )
}
