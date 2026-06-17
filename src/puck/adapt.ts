/**
 * Adapter helpers used inside each Puck component's `render()` callback
 * to translate the storage-shape props (what Puck saves to JSON) into
 * the populated-shape that the existing `*Render` components expect.
 *
 * - In the editor, props are in storage shape (e.g. `[{ ref: 1 }]`).
 *   These adapters strip them so renderers gracefully show empty/fallback.
 * - On the server (after `populatePuckData`), props are populated docs.
 *   These adapters pass them through.
 */

export function adaptRefArray<T>(value: unknown): (number | T)[] {
  if (!Array.isArray(value)) return []
  const out: (number | T)[] = []
  for (const item of value) {
    if (typeof item === 'number') {
      out.push(item)
      continue
    }
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>
      const keys = Object.keys(obj)
      const isStorageShape = keys.length === 1 && keys[0] === 'ref'
      if (!isStorageShape) {
        out.push(item as T)
      }
    }
  }
  return out
}

export function adaptMedia<T>(value: unknown): T | undefined {
  if (value && typeof value === 'object') return value as T
  return undefined
}

export function adaptCard<T extends { image?: unknown }>(card: T): T {
  if (!card) return card
  if (typeof card.image === 'number') {
    return { ...card, image: undefined }
  }
  return card
}
