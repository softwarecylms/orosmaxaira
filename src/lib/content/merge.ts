/**
 * Pure helpers for content trees (the plain-data page objects the admin edits).
 * Shared by the storefront loader and scripts/export-content.ts.
 *
 * Conventions:
 * - A list whose items are objects carries an `_id` on every item (added when
 *   the content is first exported). That is what lets an English overlay name
 *   "the item with this id" instead of an index that shifts when the Greek list
 *   is reordered. `_id` never reaches components — `stripIds` removes it.
 * - An overlay holds only what differs from the base: changed leaves, and for
 *   id'd lists just the items with changes (`{ _id, …changed }`). Any other
 *   array (strings, rich-text spans, lists of different length) is replaced
 *   whole.
 */

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json }
type Obj = { [k: string]: Json }

export const isObj = (v: unknown): v is Obj =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const hasIds = (a: Json[]): a is Obj[] => a.length > 0 && a.every((x) => isObj(x) && typeof x._id === 'string')

/**
 * Lay `over` on top of `base`. Objects merge key by key; an id'd list in the
 * overlay patches the base items it names; anything else in the overlay wins.
 * `undefined`/`null` in the overlay keep the base value.
 */
export function overlay(base: Json | undefined, over: Json | undefined): Json | undefined {
  if (over === undefined || over === null) return base
  if (isObj(base) && isObj(over)) {
    const out: Obj = { ...base }
    for (const [k, v] of Object.entries(over)) out[k] = overlay(base[k], v) as Json
    return out
  }
  if (
    Array.isArray(base) &&
    Array.isArray(over) &&
    hasIds(base) &&
    hasIds(over) &&
    // A patch names only existing items; a list with other ids replaces the base.
    over.every((x) => base.some((b) => b._id === x._id))
  ) {
    const byId = new Map(over.map((x) => [x._id as string, x]))
    return base.map((item) => {
      const patch = byId.get(item._id as string)
      return patch ? (overlay(item, patch) as Json) : item
    })
  }
  return over
}

/**
 * Fill gaps in content from Medusa with the code's built-in copy: every object
 * key the built-in copy has but the stored copy lacks (a field added to the
 * site after the content was last saved) comes from `fallback`. Lists are taken
 * whole from `stored` — an editor may have added, removed or reordered items.
 */
export function fillFrom(fallback: Json | undefined, stored: Json | undefined): Json | undefined {
  if (stored === undefined || stored === null) return fallback
  if (isObj(fallback) && isObj(stored)) {
    const out: Obj = { ...fallback }
    for (const [k, v] of Object.entries(stored)) out[k] = fillFrom(fallback[k], v) as Json
    return out
  }
  return stored
}

/** Remove every `_id` (deeply) before content reaches components. */
export function stripIds<T extends Json | undefined>(v: T): T {
  if (Array.isArray(v)) return v.map((x) => stripIds(x)) as T
  if (isObj(v)) {
    const out: Obj = {}
    for (const [k, x] of Object.entries(v)) if (k !== '_id') out[k] = stripIds(x)
    return out as T
  }
  return v
}

/** JSON with object keys sorted, so key order never makes two trees differ. */
const canonical = (v: Json | undefined): string =>
  JSON.stringify(v, (_k, x) =>
    isObj(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]])) : x,
  )

/** Same content, regardless of object key order. */
export const sameContent = (a: Json | undefined, b: Json | undefined) => canonical(a) === canonical(b)

/**
 * The overlay that turns `base` into `target` (both id'd the same way): only
 * the differences. Returns `undefined` when they are equal.
 */
export function diff(base: Json | undefined, target: Json | undefined): Json | undefined {
  if (sameContent(base, target)) return undefined
  if (isObj(base) && isObj(target)) {
    const out: Obj = {}
    for (const k of Object.keys(target)) {
      const d = diff(base[k], target[k])
      if (d !== undefined) out[k] = d
    }
    return Object.keys(out).length ? out : undefined
  }
  if (Array.isArray(base) && Array.isArray(target) && hasIds(base) && hasIds(target)) {
    const sameIds = base.length === target.length && base.every((x, i) => x._id === target[i]._id)
    if (sameIds) {
      const items = target
        .map((t, i) => {
          const d = diff(base[i], t)
          return d === undefined ? undefined : ({ ...(d as Obj), _id: t._id } as Json)
        })
        .filter((x): x is Json => x !== undefined)
      return items.length ? items : undefined
    }
  }
  return target
}
