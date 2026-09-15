/**
 * Content-tree helpers for the page editor. Mirrors the storefront's
 * src/lib/content/merge.ts (the admin bundle cannot import storefront code) —
 * keep the two in step.
 *
 * - List items that are objects carry an `_id`; an English overlay names items
 *   by it. Only what differs from the Greek is stored in the overlay.
 * - The editor holds two full trees — Greek and English — and derives the
 *   overlay with `diff` when saving.
 */

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json }
export type Obj = { [k: string]: Json }
export type Path = (string | number)[]

export const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v)

const hasIds = (a: Json[]): a is Obj[] =>
  a.length > 0 && a.every((x) => isObj(x) && typeof x._id === "string")

const canonical = (v: Json | undefined): string =>
  JSON.stringify(v, (_k, x) =>
    isObj(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]])) : x
  )

export const sameContent = (a: Json | undefined, b: Json | undefined) => canonical(a) === canonical(b)

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

export function getAt(tree: Json | undefined, path: Path): Json | undefined {
  let cur: Json | undefined = tree
  for (const p of path) {
    if (cur == null) return undefined
    cur = (cur as any)[p]
  }
  return cur
}

/** Immutable set: returns a new tree with `value` at `path`. */
export function setAt(tree: Json | undefined, path: Path, value: Json): Json {
  if (!path.length) return value
  const [head, ...rest] = path
  if (Array.isArray(tree)) {
    const next = [...tree]
    next[head as number] = setAt(tree[head as number], rest, value)
    return next
  }
  const obj = isObj(tree) ? tree : {}
  return { ...obj, [head]: setAt(obj[head as string], rest, value) }
}

/** A short random id for a new list item. */
export const newId = () => Math.random().toString(16).slice(2, 12)

/** Deep copy of a list item as a template for a new one: same shape, text
 *  emptied, fresh ids. */
export function blankLike(v: Json): Json {
  if (Array.isArray(v)) return v.length && isObj(v[0]) ? [blankLike(v[0])] : []
  if (isObj(v)) {
    const out: Obj = {}
    for (const [k, x] of Object.entries(v)) out[k] = k === "_id" ? newId() : blankLike(x)
    return out
  }
  if (typeof v === "string") return ""
  if (typeof v === "number") return 0
  if (typeof v === "boolean") return false
  return null
}

/**
 * Keep the English tree in step with a structural change to the Greek one
 * (item added, removed or moved). The result has exactly the Greek structure;
 * for each text leaf it keeps the English value when it was translated, and
 * otherwise follows the new Greek text. Leaves the editor treats as shared
 * across languages (`isShared`) always take the Greek value.
 */
export function rebaseEnglish(
  elNew: Json | undefined,
  elOld: Json | undefined,
  enOld: Json | undefined,
  isShared: (key: string) => boolean,
  key = ""
): Json | undefined {
  if (Array.isArray(elNew)) {
    if (hasIds(elNew)) {
      const oldEl = Array.isArray(elOld) ? (elOld as Obj[]) : []
      const oldEn = Array.isArray(enOld) ? (enOld as Obj[]) : []
      return elNew.map((item) =>
        rebaseEnglish(
          item,
          oldEl.find((x) => isObj(x) && x._id === item._id),
          oldEn.find((x) => isObj(x) && x._id === item._id),
          isShared,
          key
        ) as Json
      )
    }
    // A plain list (strings, rich-text spans): English keeps its own unless it
    // was simply the Greek one.
    return enOld !== undefined && !sameContent(enOld, elOld) ? enOld : elNew
  }
  if (isObj(elNew)) {
    const out: Obj = {}
    for (const [k, v] of Object.entries(elNew)) {
      out[k] = rebaseEnglish(
        v,
        isObj(elOld) ? elOld[k] : undefined,
        isObj(enOld) ? enOld[k] : undefined,
        isShared,
        k
      ) as Json
    }
    // English-only keys (e.g. a separate English PDF) survive.
    if (isObj(enOld)) for (const k of Object.keys(enOld)) if (!(k in elNew)) out[k] = enOld[k]
    return out
  }
  if (isShared(key)) return elNew
  return enOld !== undefined && enOld !== elOld ? enOld : elNew
}
