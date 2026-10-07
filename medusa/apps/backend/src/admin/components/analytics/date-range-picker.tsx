import { CalendarMini, CheckMini } from "@medusajs/icons"
import { Button, clx, Input, Label, Popover, Tabs, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { COMPARE_LABELS, COMPARE_MODES, formatRange, PERIOD_LABELS, PRESETS, type DateRange } from "../../lib/analytics"

/**
 * The «Περίοδος» control, as in WooCommerce Analytics: preset ranges or a
 * custom one, plus what to compare with. Nothing changes until «Ενημέρωση».
 */

type Value = { period: string; compare: string; after: string; before: string }

type Props = {
  period: string
  compare: string
  range: DateRange | null
  compareRange: DateRange | null
  onChange: (v: Value) => void
}

const Choice = ({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={clx(
      "txt-compact-small flex items-center gap-x-2 rounded-md px-3 py-2 text-left outline-none transition-fg",
      "hover:bg-ui-bg-base-hover focus-visible:shadow-borders-focus",
      selected ? "text-ui-fg-base font-medium" : "text-ui-fg-subtle"
    )}
  >
    <span className="flex size-4 shrink-0 items-center justify-center">{selected ? <CheckMini /> : null}</span>
    {label}
  </button>
)

export const DateRangePicker = ({ period, compare, range, compareRange, onChange }: Props) => {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Value>({ period, compare, after: range?.from ?? "", before: range?.to ?? "" })

  // Start each opening from what is on screen.
  useEffect(() => {
    if (open) setDraft({ period, compare, after: range?.from ?? "", before: range?.to ?? "" })
  }, [open, period, compare, range?.from, range?.to])

  // Back on the presets tab, reselect the preset on screen (or "month to date").
  const switchTab = (tab: string) =>
    setDraft((d) => {
      if (tab === "custom") return { ...d, period: "custom" }
      if (d.period !== "custom") return d
      return { ...d, period: period === "custom" ? "month" : period }
    })

  const customValid = draft.period !== "custom" || (!!draft.after && !!draft.before)
  const apply = () => {
    onChange(draft)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-y-1.5">
      <Label size="xsmall" weight="plus" className="text-ui-fg-subtle">
        Περίοδος
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="bg-ui-bg-field shadow-borders-base hover:bg-ui-bg-field-hover focus-visible:shadow-borders-interactive-with-active flex min-w-[260px] items-center gap-x-3 rounded-md px-3 py-1.5 text-left outline-none"
          >
            <CalendarMini className="text-ui-fg-muted shrink-0" />
            <span className="flex flex-col">
              <Text size="small" weight="plus" leading="compact">
                {PERIOD_LABELS[period] ?? period}
                {range ? ` (${formatRange(range)})` : ""}
              </Text>
              <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                σε σύγκριση με: {COMPARE_LABELS[compare] ?? compare}
                {compareRange ? ` (${formatRange(compareRange)})` : ""}
              </Text>
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Content align="start" className="w-[min(420px,calc(100vw-32px))] p-0">
          <Tabs value={draft.period === "custom" ? "custom" : "presets"} onValueChange={switchTab}>
            <div className="border-b px-4 pb-3 pt-4">
              <Text size="xsmall" weight="plus" className="text-ui-fg-muted mb-2 uppercase tracking-wide">
                Επιλογή περιόδου
              </Text>
              <Tabs.List>
                <Tabs.Trigger value="presets">Προκαθορισμένες</Tabs.Trigger>
                <Tabs.Trigger value="custom">Προσαρμοσμένη</Tabs.Trigger>
              </Tabs.List>
            </div>
            <Tabs.Content value="presets" className="grid grid-cols-2 gap-1 p-2">
              {PRESETS.map(([key, label]) => (
                <Choice key={key} label={label} selected={draft.period === key} onClick={() => setDraft({ ...draft, period: key })} />
              ))}
            </Tabs.Content>
            <Tabs.Content value="custom" className="grid grid-cols-2 gap-3 p-4">
              <div className="flex flex-col gap-y-1.5">
                <Label size="xsmall" weight="plus" htmlFor="analytics-after">
                  Από
                </Label>
                <Input
                  id="analytics-after"
                  type="date"
                  size="small"
                  value={draft.after}
                  max={draft.before || undefined}
                  onChange={(e) => setDraft({ ...draft, after: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-y-1.5">
                <Label size="xsmall" weight="plus" htmlFor="analytics-before">
                  Έως
                </Label>
                <Input
                  id="analytics-before"
                  type="date"
                  size="small"
                  value={draft.before}
                  min={draft.after || undefined}
                  onChange={(e) => setDraft({ ...draft, before: e.target.value })}
                />
              </div>
            </Tabs.Content>
          </Tabs>
          <div className="border-t px-4 pb-2 pt-3">
            <Text size="xsmall" weight="plus" className="text-ui-fg-muted uppercase tracking-wide">
              Σύγκριση με
            </Text>
          </div>
          <div className="grid grid-cols-2 gap-1 px-2 pb-2">
            {COMPARE_MODES.map(([key, label]) => (
              <Choice key={key} label={label} selected={draft.compare === key} onClick={() => setDraft({ ...draft, compare: key })} />
            ))}
          </div>
          <div className="flex justify-end gap-x-2 border-t px-4 py-3">
            <Button size="small" variant="secondary" onClick={() => setOpen(false)}>
              Ακύρωση
            </Button>
            <Button size="small" onClick={apply} disabled={!customValid}>
              Ενημέρωση
            </Button>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  )
}
