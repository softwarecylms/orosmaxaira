import { ArrowDownMini, ArrowDownTray, ArrowUpMini, ChevronLeftMini, ChevronRightMini, MagnifyingGlass } from "@medusajs/icons"
import { Button, clx, Heading, IconButton, Input, Select, Table, Text } from "@medusajs/ui"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { downloadCsv } from "../../lib/analytics"

/**
 * The table under each report, as in WooCommerce Analytics: sortable columns
 * (the sorted one is shaded), search, paging with "go to page" and rows per
 * page, a summary line, and a CSV of every matching row.
 */

export type Column<R> = {
  key: string
  label: string
  align?: "left" | "right"
  /** Sort and CSV value; numbers sort numerically. */
  value: (r: R) => string | number | null | undefined
  render?: (r: R) => ReactNode
  /** CSV value when it differs from `value` (e.g. a list joined). */
  csv?: (r: R) => string | number | null | undefined
  sortable?: boolean
}

type Props<R> = {
  title: string
  rows: R[]
  columns: Column<R>[]
  rowKey: (r: R) => string
  defaultSort: { key: string; desc: boolean }
  /** The text a row is searched by; leave out for no search box. */
  searchText?: (r: R) => string
  searchPlaceholder?: string
  filename: string
  summary?: ReactNode
  toolbar?: ReactNode
  empty?: string
  dimmed?: boolean
}

const PAGE_SIZES = [25, 50, 100]

/** Lower-case without accents, so «μελι» finds «Μέλι». */
const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("el")

function compare(a: unknown, b: unknown) {
  if (a == null || a === "") return b == null || b === "" ? 0 : 1
  if (b == null || b === "") return -1
  if (typeof a === "number" && typeof b === "number") return a - b
  return String(a).localeCompare(String(b), "el", { numeric: true })
}

export function DataTable<R>({
  title,
  rows,
  columns,
  rowKey,
  defaultSort,
  searchText,
  searchPlaceholder = "Αναζήτηση…",
  filename,
  summary,
  toolbar,
  empty = "Δεν υπάρχουν δεδομένα για αυτή την περίοδο.",
  dimmed,
}: Props<R>) {
  const [sort, setSort] = useState(defaultSort)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [goTo, setGoTo] = useState("1")

  const shown = useMemo(() => {
    const needle = fold(search.trim())
    const filtered = needle && searchText ? rows.filter((r) => fold(searchText(r)).includes(needle)) : rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return filtered
    // Empty values stay last whichever way the column is sorted.
    return [...filtered].sort((a, b) => {
      const va = col.value(a)
      const vb = col.value(b)
      if (va == null || va === "" || vb == null || vb === "") return compare(va, vb)
      return sort.desc ? compare(vb, va) : compare(va, vb)
    })
  }, [rows, search, searchText, sort, columns])

  const pageCount = Math.max(1, Math.ceil(shown.length / pageSize))
  useEffect(() => setPage(0), [rows, search, sort, pageSize])
  useEffect(() => setGoTo(String(page + 1)), [page])
  const pageRows = shown.slice(page * pageSize, (page + 1) * pageSize)

  // A new column sorts biggest-first when it holds numbers, A→Z otherwise.
  const toggleSort = (key: string) =>
    setSort((s) => {
      if (s.key === key) return { key, desc: !s.desc }
      const col = columns.find((c) => c.key === key)
      return { key, desc: !!rows.length && typeof col?.value(rows[0]) === "number" }
    })

  const download = () =>
    downloadCsv(
      filename,
      columns.map((c) => c.label),
      shown.map((r) => columns.map((c) => (c.csv ?? c.value)(r) ?? ""))
    )

  const jump = () => {
    const n = Number(goTo)
    if (Number.isFinite(n)) setPage(Math.min(pageCount - 1, Math.max(0, Math.round(n) - 1)))
  }

  return (
    <div className={clx("transition-opacity", dimmed && "opacity-50")}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Heading level="h2">{title}</Heading>
        <div className="flex flex-wrap items-center gap-2">
          {toolbar}
          {searchText ? (
            <div className="relative">
              <MagnifyingGlass className="text-ui-fg-muted pointer-events-none absolute left-2 top-1/2 -translate-y-1/2" />
              <Input
                size="small"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-[220px] pl-8"
              />
            </div>
          ) : null}
          <Button size="small" variant="secondary" onClick={download} disabled={!shown.length}>
            <ArrowDownTray />
            Λήψη CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border-t">
        <Table>
          <Table.Header>
            <Table.Row>
              {columns.map((c) => {
                const sorted = sort.key === c.key
                const sortable = c.sortable !== false
                return (
                  <Table.HeaderCell
                    key={c.key}
                    className={clx(c.align === "right" && "text-right", sorted && "bg-ui-bg-subtle")}
                    aria-sort={sorted ? (sort.desc ? "descending" : "ascending") : undefined}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className={clx(
                          "inline-flex items-center gap-x-1 whitespace-nowrap outline-none hover:text-ui-fg-base focus-visible:underline",
                          c.align === "right" && "flex-row-reverse"
                        )}
                      >
                        {c.label}
                        {sorted ? sort.desc ? <ArrowDownMini /> : <ArrowUpMini /> : null}
                      </button>
                    ) : (
                      <span className="whitespace-nowrap">{c.label}</span>
                    )}
                  </Table.HeaderCell>
                )
              })}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {pageRows.map((r) => (
              <Table.Row key={rowKey(r)}>
                {columns.map((c) => (
                  <Table.Cell
                    key={c.key}
                    className={clx(
                      c.align === "right" && "text-right tabular-nums",
                      sort.key === c.key && "bg-ui-bg-subtle"
                    )}
                  >
                    {c.render ? c.render(r) : (c.value(r) ?? "—")}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
            {!pageRows.length ? (
              <Table.Row>
                <td colSpan={columns.length} className="text-ui-fg-subtle txt-compact-small px-6 py-8 text-center">
                  {search ? "Κανένα αποτέλεσμα για αυτή την αναζήτηση." : empty}
                </td>
              </Table.Row>
            ) : null}
          </Table.Body>
        </Table>
      </div>

      {shown.length > PAGE_SIZES[0] ? (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t px-6 py-3">
          <div className="flex items-center gap-x-2">
            <Text size="small" className="text-ui-fg-subtle">
              Σελίδα {page + 1} από {pageCount}
            </Text>
            <IconButton size="small" variant="transparent" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Προηγούμενη σελίδα">
              <ChevronLeftMini />
            </IconButton>
            <IconButton
              size="small"
              variant="transparent"
              disabled={page >= pageCount - 1}
              onClick={() => setPage(page + 1)}
              aria-label="Επόμενη σελίδα"
            >
              <ChevronRightMini />
            </IconButton>
          </div>
          <label className="flex items-center gap-x-2">
            <Text size="small" className="text-ui-fg-subtle">
              Μετάβαση στη σελίδα
            </Text>
            <Input
              size="small"
              type="number"
              min={1}
              max={pageCount}
              value={goTo}
              onChange={(e) => setGoTo(e.target.value)}
              onBlur={jump}
              onKeyDown={(e) => e.key === "Enter" && jump()}
              className="w-16"
            />
          </label>
          <div className="flex items-center gap-x-2">
            <Text size="small" className="text-ui-fg-subtle">
              Γραμμές ανά σελίδα
            </Text>
            <Select size="small" value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <Select.Trigger className="w-20">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {PAGE_SIZES.map((s) => (
                  <Select.Item key={s} value={String(s)}>
                    {s}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
      ) : null}

      {summary ? (
        <div className="bg-ui-bg-subtle text-ui-fg-subtle flex flex-wrap justify-center gap-x-6 gap-y-1 border-t px-6 py-3">
          {summary}
        </div>
      ) : null}
    </div>
  )
}
