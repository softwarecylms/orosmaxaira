import { Button, IconButton, Input, Label, Text } from "@medusajs/ui"
import { Plus, Trash } from "@medusajs/icons"

export type RepeaterField = {
  key: string
  label: string
  type?: "text" | "number" | "textarea"
  width?: string // tailwind col span helper, e.g. "col-span-2"
}

/**
 * Generic editor for an array of flat objects (price tiers, features, policies,
 * gallery images, reviews). Renders one card per row with a field grid + remove
 * button, plus an "add" button.
 */
export function Repeater<T extends Record<string, unknown>>({
  label,
  value,
  onChange,
  fields,
  blank,
}: {
  label: string
  value: T[] | null | undefined
  onChange: (next: T[]) => void
  fields: RepeaterField[]
  blank: T
}) {
  const rows = value ?? []

  const setCell = (i: number, key: string, raw: string, type?: string) => {
    const v = type === "number" ? (raw === "" ? "" : Number(raw)) : raw
    const next = rows.map((r, j) => (j === i ? { ...r, [key]: v } : r))
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <Label weight="plus">{label}</Label>
      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-2 gap-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3"
          >
            {fields.map((f) => (
              <div key={f.key} className={`flex flex-col gap-1 ${f.width ?? ""}`}>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {f.label}
                </Text>
                {f.type === "textarea" ? (
                  <textarea
                    className="min-h-[64px] w-full rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1.5 text-sm outline-none focus:border-ui-border-interactive"
                    value={String(row[f.key] ?? "")}
                    onChange={(e) => setCell(i, f.key, e.target.value, f.type)}
                  />
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : "text"}
                    value={String(row[f.key] ?? "")}
                    onChange={(e) => setCell(i, f.key, e.target.value, f.type)}
                  />
                )}
              </div>
            ))}
            <div className="col-span-2 flex justify-end">
              <IconButton
                size="small"
                variant="transparent"
                type="button"
                onClick={() => onChange(rows.filter((_, j) => j !== i))}
              >
                <Trash />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
      <div>
        <Button
          size="small"
          variant="secondary"
          type="button"
          onClick={() => onChange([...rows, { ...blank }])}
        >
          <Plus />
          Προσθήκη
        </Button>
      </div>
    </div>
  )
}
