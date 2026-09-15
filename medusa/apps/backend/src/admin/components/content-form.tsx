import { Button, IconButton, Input, Label, Text, Textarea } from "@medusajs/ui"
import { ArrowDownMini, ArrowUpMini, Plus, Trash } from "@medusajs/icons"
import { useState } from "react"
import { ImagePicker } from "./image-picker"
import {
  blankLike,
  isObj,
  newId,
  type Json,
  type Obj,
  type Path,
} from "../lib/content-tree"
import {
  ADVANCED_KEYS,
  isSharedLeaf,
  labelFor,
  looksLikeImage,
  orderKeys,
  type ContentPage,
} from "../lib/content-pages"

/**
 * A form for any content tree, built from the content itself: text becomes an
 * input or text area, image paths an image picker, lists a set of cards that
 * can be added, removed and reordered, and inline rich text (spans with bold
 * or links) a single line with **bold** and [link](url) markup. Labels come
 * from content-pages.ts.
 *
 * In English, only text is editable: shared leaves (links, images, positions,
 * numbers) show the Greek value read-only, and list structure is fixed — items
 * are added, removed and reordered in Greek.
 */

export type FormProps = {
  page?: ContentPage
  lang: "el" | "en"
  /** The tree being edited, in the current language. */
  value: Json
  /** The Greek tree at the same place (shared leaves read from it in English). */
  greek: Json
  path: Path
  onSet: (path: Path, value: Json) => void
}

const RICH_KEYS = new Set(["lead", "paragraphs", "body"])

type Span = { _id?: string; text: string; bold?: boolean; href?: string }

const isSpan = (v: unknown): v is Span =>
  isObj(v) &&
  typeof v.text === "string" &&
  Object.keys(v).every((k) => k === "_id" || k === "text" || k === "bold" || k === "href")

/** A list of spans that reads as one line of rich text. */
function isRichLine(key: string, v: Json): v is Json[] {
  if (!Array.isArray(v) || !v.length || !v.every(isSpan)) return false
  return RICH_KEYS.has(key) || v.some((s) => (s as Span).bold || (s as Span).href)
}

const isRichParagraphs = (key: string, v: Json): v is Json[][] =>
  Array.isArray(v) && v.length > 0 && v.every((x) => isRichLine(key, x) || (Array.isArray(x) && RICH_KEYS.has(key) && x.every(isSpan)))

function spansToMarkup(spans: Span[]): string {
  return spans
    .map((s) => {
      let t = s.href ? `[${s.text}](${s.href})` : s.text
      if (s.bold) t = `**${t}**`
      return t
    })
    .join("")
}

/** Parse **bold** and [text](url) back into spans, reusing ids by position. */
function markupToSpans(markup: string, previous: Span[]): Span[] {
  const out: Span[] = []
  const re = /\*\*(\[([^\]]+)\]\(([^)]+)\)|[^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  const push = (s: Span) => {
    if (s.text) out.push(s)
  }
  while ((m = re.exec(markup))) {
    push({ text: markup.slice(last, m.index) })
    if (m[1] !== undefined) {
      push(m[2] !== undefined ? { text: m[2], href: m[3], bold: true } : { text: m[1], bold: true })
    } else {
      push({ text: m[4], href: m[5] })
    }
    last = m.index + m[0].length
  }
  push({ text: markup.slice(last) })
  return out.map((s, i) => ({ ...s, _id: previous[i]?._id ?? newId() }))
}

function summary(item: Json): string {
  if (typeof item === "string") return item
  if (!isObj(item)) return ""
  for (const k of ["title", "label", "heading", "name", "q", "text", "event", "value", "alt"]) {
    const v = item[k]
    if (typeof v === "string" && v.trim()) return v
  }
  for (const [k, v] of Object.entries(item)) {
    if (k !== "_id" && typeof v === "string" && v.trim() && !/^(\/|https?:)/.test(v)) return v
  }
  // An image-only item (a gallery photo): its file name.
  for (const k of ["src", "image", "photo", "logo"]) {
    const v = item[k]
    if (typeof v === "string" && v) return decodeURIComponent(v.split("/").pop() ?? v)
  }
  return ""
}

function Leaf({ page, lang, value, greek, path, onSet, k }: FormProps & { k: string }) {
  const shared = isSharedLeaf(k, greek ?? value, page)
  const locked = lang === "en" && shared
  const shown = locked ? greek : value
  const label = labelFor(k, page)
  const set = (v: Json) => onSet(path, v)

  if (typeof shown === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={shown} disabled={locked} onChange={(e) => set(e.target.checked)} />
        {label}
      </label>
    )
  }
  const text = shown == null ? "" : String(shown)
  const head = (
    <Label size="xsmall" weight="plus" className="text-ui-fg-subtle">
      {label}
      {locked ? <span className="font-normal text-ui-fg-muted"> · κοινό σε όλες τις γλώσσες</span> : null}
    </Label>
  )
  if (looksLikeImage(k, shown)) {
    return (
      <div className="flex flex-col gap-1">
        {head}
        <ImagePicker value={text} onChange={set} disabled={locked} />
      </div>
    )
  }
  if (typeof shown === "number") {
    return (
      <div className="flex flex-col gap-1">
        {head}
        <Input type="number" value={text} disabled={locked} onChange={(e) => set(e.target.value === "" ? 0 : Number(e.target.value))} />
      </div>
    )
  }
  const long = text.length > 70 || text.includes("\n")
  return (
    <div className="flex flex-col gap-1">
      {head}
      {long ? (
        <Textarea
          rows={Math.min(10, Math.max(2, Math.ceil(text.length / 70)))}
          value={text}
          disabled={locked}
          onChange={(e) => set(e.target.value)}
        />
      ) : (
        <Input value={text} disabled={locked} onChange={(e) => set(e.target.value)} className={/href|Href/.test(k) ? "font-mono text-xs" : undefined} />
      )}
    </div>
  )
}

function RichLineField({ page, value, path, onSet, k, label }: FormProps & { k: string; label?: string }) {
  const spans = (Array.isArray(value) ? value : []) as Span[]
  return (
    <div className="flex flex-col gap-1">
      <Label size="xsmall" weight="plus" className="text-ui-fg-subtle">
        {label ?? labelFor(k, page)}
        <span className="font-normal text-ui-fg-muted"> · **έντονα**, [κείμενο](σύνδεσμος)</span>
      </Label>
      <Textarea
        rows={Math.min(8, Math.max(2, Math.ceil(spansToMarkup(spans).length / 70)))}
        value={spansToMarkup(spans)}
        onChange={(e) => onSet(path, markupToSpans(e.target.value, spans) as unknown as Json)}
      />
    </div>
  )
}

function StringList({ page, lang, value, path, onSet, k }: FormProps & { k: string }) {
  const items = (Array.isArray(value) ? value : []) as string[]
  const structural = lang === "el"
  return (
    <div className="flex flex-col gap-1.5">
      <Label size="xsmall" weight="plus" className="text-ui-fg-subtle">
        {labelFor(k, page)}
      </Label>
      {items.map((s, i) => (
        <div key={i} className="flex items-start gap-1">
          {s.length > 70 || s.includes("\n") ? (
            <Textarea
              rows={Math.min(8, Math.max(2, Math.ceil(s.length / 70)))}
              value={s}
              onChange={(e) => onSet([...path, i], e.target.value)}
            />
          ) : (
            <Input value={s} onChange={(e) => onSet([...path, i], e.target.value)} />
          )}
          {structural ? (
            <IconButton size="small" variant="transparent" type="button" title="Αφαίρεση" onClick={() => onSet(path, items.filter((_, j) => j !== i))}>
              <Trash />
            </IconButton>
          ) : null}
        </div>
      ))}
      {structural ? (
        <div>
          <Button size="small" variant="secondary" type="button" onClick={() => onSet(path, [...items, ""])}>
            <Plus />
            Προσθήκη
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function ObjectList({ page, lang, value, greek, path, onSet, k }: FormProps & { k: string }) {
  const items = (Array.isArray(value) ? value : []) as Json[]
  const greekItems = (Array.isArray(greek) ? greek : []) as Json[]
  const structural = lang === "el"
  const [open, setOpen] = useState<number | null>(items.length === 1 ? 0 : null)

  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onSet(path, next)
    setOpen(j)
  }
  const greekFor = (item: Json, i: number) =>
    isObj(item) && item._id ? greekItems.find((g) => isObj(g) && g._id === item._id) ?? greekItems[i] : greekItems[i]

  return (
    <div className="flex flex-col gap-2">
      <Label size="xsmall" weight="plus" className="text-ui-fg-subtle">
        {labelFor(k, page, false, true)} <span className="font-normal text-ui-fg-muted">({items.length})</span>
      </Label>
      {items.map((item, i) => (
        <div key={isObj(item) && item._id ? String(item._id) : i} className="rounded-lg border border-ui-border-base bg-ui-bg-base">
          <div className="flex items-center gap-1 px-2 py-1.5">
            <button type="button" className="flex-1 truncate text-left text-sm text-ui-fg-base" onClick={() => setOpen(open === i ? null : i)}>
              <span className="text-ui-fg-muted">{i + 1}.</span> {summary(item) || "—"}
            </button>
            {structural ? (
              <>
                <IconButton size="small" variant="transparent" type="button" title="Πάνω" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUpMini />
                </IconButton>
                <IconButton size="small" variant="transparent" type="button" title="Κάτω" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDownMini />
                </IconButton>
                <IconButton
                  size="small"
                  variant="transparent"
                  type="button"
                  title="Αφαίρεση"
                  onClick={() => {
                    if (!window.confirm("Να αφαιρεθεί αυτό το στοιχείο;")) return
                    onSet(path, items.filter((_, j) => j !== i))
                    setOpen(null)
                  }}
                >
                  <Trash />
                </IconButton>
              </>
            ) : null}
          </div>
          {open === i ? (
            <div className="flex flex-col gap-3 border-t border-ui-border-base p-3">
              <Node page={page} lang={lang} value={item} greek={greekFor(item, i) ?? item} path={[...path, i]} onSet={onSet} k={k} inList />
            </div>
          ) : null}
        </div>
      ))}
      {structural && items.length ? (
        <div>
          <Button
            size="small"
            variant="secondary"
            type="button"
            onClick={() => {
              onSet(path, [...items, blankLike(items[items.length - 1])])
              setOpen(items.length)
            }}
          >
            <Plus />
            Προσθήκη
          </Button>
        </div>
      ) : null}
    </div>
  )
}

/** Render any node: dispatches on the shape of the value. */
export function Node(props: FormProps & { k: string; inList?: boolean; depth?: number }) {
  const { page, lang, value, greek, path, onSet, k, inList, depth = 0 } = props

  if (isRichLine(k, value)) return <RichLineField {...props} />
  if (isRichParagraphs(k, value)) {
    return (
      <div className="flex flex-col gap-2">
        {(value as Json[]).map((p, i) => (
          <RichLineField key={i} {...props} value={p} greek={(greek as Json[])?.[i] ?? p} path={[...path, i]} label={`${labelFor(k, page)} ${i + 1}`} />
        ))}
      </div>
    )
  }
  if (Array.isArray(value)) {
    if (value.every((x) => typeof x === "string")) return <StringList {...props} />
    return <ObjectList {...props} />
  }
  if (isObj(value)) {
    const entries = orderKeys(Object.keys(value))
      .filter((key) => key !== "_id")
      .map((key) => [key, value[key]] as [string, Json])
    const isAdvanced = ([key, v]: [string, Json]) => ADVANCED_KEYS.has(key) && (v === null || typeof v !== "object")
    const main = entries.filter((e) => !isAdvanced(e))
    const advanced = entries.filter(isAdvanced)
    const g = isObj(greek) ? (greek as Obj) : {}
    const children = (list: [string, Json][]) =>
      list.map(([key, v]) => (
        <Node key={key} page={page} lang={lang} value={v} greek={g[key] ?? v} path={[...path, key]} onSet={onSet} k={key} depth={depth + 1} />
      ))
    const body = (
      <>
        {children(main)}
        {advanced.length ? (
          <details className="rounded-md border border-dashed border-ui-border-base px-3 py-2">
            <summary className="cursor-pointer text-xs text-ui-fg-muted">Για προχωρημένους (διάταξη)</summary>
            <div className="mt-3 flex flex-col gap-3">{children(advanced)}</div>
          </details>
        ) : null}
      </>
    )
    if (inList || depth === 0) return <div className="flex flex-col gap-3">{body}</div>
    return (
      <fieldset className="flex flex-col gap-3 rounded-lg border border-ui-border-base p-3">
        <legend className="px-1">
          <Text size="xsmall" weight="plus" className="text-ui-fg-base">
            {labelFor(k, page, false, true)}
          </Text>
        </legend>
        {body}
      </fieldset>
    )
  }
  return <Leaf {...props} />
}
