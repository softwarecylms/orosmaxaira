import type { Field, Fields } from '@measured/puck'
import {
  ImageControl,
  ParagraphsControl,
  RichLineControl,
  RichParagraphsControl,
  StringListControl,
} from './controls'
import { labelFor, orderKeys } from './labels'

/**
 * Puck fields generated from a section's content. Rather than hand-writing a
 * schema per section, the default copy is the schema: every key becomes a
 * field of the right kind, labelled in Greek (labels.ts).
 *
 * - text → text input, long text → text area, number → number, yes/no → radio
 * - an image path (key `image`, `src`, `photo`…) → image picker
 * - `icon` → a choice of the icons the section already uses
 * - a list of strings → one item per line
 * - rich text (spans with bold/links) → **bold** and [link](url) markup
 * - a list of objects → Puck's repeatable list, fields from all items together
 * - an object → a group
 *
 * All values seen for a key are considered at once (every item of a list), so
 * optional keys that only some items have still get a field.
 */

const IMAGE_KEYS = /^(image|src|photo|avatar|logo|wordmark|poster)$/i
const RICH_KEYS = new Set(['lead', 'paragraphs', 'body'])

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const isSpan = (v: unknown) =>
  isObj(v) &&
  typeof v.text === 'string' &&
  Object.keys(v).every((k) => ['text', 'bold', 'href', 'accent'].includes(k))

const isSpanList = (v: unknown): v is Record<string, unknown>[] =>
  Array.isArray(v) && v.length > 0 && v.every(isSpan)

/** A span list reads as one line of rich text (not a list of `{ text }` items). */
const isRichLine = (key: string, v: unknown) =>
  isSpanList(v) && (RICH_KEYS.has(key) || v.some((s) => s.bold || s.href || s.accent))

const custom = (label: string, render: unknown): Field =>
  ({ type: 'custom', label, render }) as unknown as Field

const summaryKeys = ['title', 'label', 'heading', 'name', 'q', 'text', 'event', 'value', 'code', 'alt', 'src']

function itemSummary(item: unknown, index?: number): string {
  if (isObj(item)) {
    for (const k of summaryKeys) {
      const v = item[k]
      if (typeof v === 'string' && v.trim()) return v.length > 48 ? `${v.slice(0, 48)}…` : v
    }
  }
  return `#${(index ?? 0) + 1}`
}

/** An empty copy of a list item, to start a new one from. */
export function blankLike(v: unknown): unknown {
  if (Array.isArray(v)) return []
  if (isObj(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x)]))
  if (typeof v === 'number') return 0
  if (typeof v === 'boolean') return false
  return ''
}

/** The field for one key, given every value seen for it. */
function fieldFor(key: string, values: unknown[], group = false): Field {
  const label = labelFor(key, group)
  const present = values.filter((v) => v !== undefined && v !== null)

  // Rich text: a span list, or a key whose values are sometimes plain strings
  // and sometimes span lists (an award's lead).
  if (present.some((v) => isRichLine(key, v))) return custom(label, RichLineControl)
  // Several rich paragraphs.
  if (present.some((v) => Array.isArray(v) && v.length > 0 && v.every((p) => isSpanList(p)))) {
    return custom(label, RichParagraphsControl)
  }
  // A legal document's body: paragraphs and bullet lists.
  if (present.some((v) => Array.isArray(v) && v.some((p) => Array.isArray(p)) && v.some((p) => typeof p === 'string'))) {
    return custom(label, ParagraphsControl)
  }

  if (present.length && present.every((v) => typeof v === 'string')) {
    if (IMAGE_KEYS.test(key)) return custom(label, ImageControl)
    if (key === 'icon') {
      const options = [...new Set(present as string[])].map((v) => ({ label: v, value: v }))
      return { type: 'select', label, options }
    }
    const long = (present as string[]).some((s) => s.length > 80 || s.includes('\n'))
    return { type: long ? 'textarea' : 'text', label }
  }
  if (present.length && present.every((v) => typeof v === 'number')) return { type: 'number', label }
  if (present.length && present.every((v) => typeof v === 'boolean')) {
    return {
      type: 'radio',
      label,
      options: [
        { label: 'Ναι', value: true },
        { label: 'Όχι', value: false },
      ],
    }
  }

  const arrays = present.filter(Array.isArray) as unknown[][]
  if (arrays.length && arrays.length === present.length) {
    const all = arrays.flat()
    if (all.every((x) => typeof x === 'string')) return custom(label, StringListControl)
    if (all.every(isObj)) {
      return {
        type: 'array',
        label,
        arrayFields: deriveFields(all as Record<string, unknown>[]),
        defaultItemProps: blankLike(all[0]) as Record<string, unknown>,
        getItemSummary: itemSummary,
      }
    }
  }

  const objects = present.filter(isObj)
  if (objects.length && objects.length === present.length) {
    return { type: 'object', label: labelFor(key, true), objectFields: deriveFields(objects) }
  }

  // Unknown or empty: a plain text field keeps the value editable.
  return { type: 'text', label }
}

/** Fields for objects of one shape — all samples considered together.
 *  `topLevel`: a block's own props, where `id` belongs to Puck. */
export function deriveFields(samples: Record<string, unknown>[], topLevel = false): Fields {
  const keys = orderKeys([...new Set(samples.flatMap((s) => Object.keys(s)))])
  const fields: Fields = {}
  for (const key of keys) {
    if (key === '_id' || (topLevel && key === 'id')) continue
    fields[key] = fieldFor(
      key,
      samples.map((s) => s[key]),
    )
  }
  return fields
}
