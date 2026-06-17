import type { Field } from '@measured/puck'
import type { RelationshipCollection } from './types'

const collectionLabels: Record<RelationshipCollection, string> = {
  'client-logos': 'Client Logo',
  testimonials: 'Testimonial',
  'case-studies': 'Case Study',
  posts: 'Post',
  jobs: 'Job',
  faqs: 'FAQ',
  'team-members': 'Team Member',
}

const summaryFor: Record<RelationshipCollection, (row: Record<string, unknown>) => string> = {
  'client-logos': (r) => String(r.name ?? `#${r.id}`),
  testimonials: (r) => `${r.author ?? 'Anonymous'} — "${String(r.quote ?? '').slice(0, 40)}…"`,
  'case-studies': (r) => `${r.title ?? `#${r.id}`} (${r.client ?? '-'})`,
  posts: (r) => String(r.title ?? `#${r.id}`),
  jobs: (r) => String(r.title ?? `#${r.id}`),
  faqs: (r) => String(r.question ?? `#${r.id}`),
  'team-members': (r) => `${r.name ?? `#${r.id}`} (${r.role ?? '-'})`,
}

function baseUrl(): string {
  if (typeof window !== 'undefined') return ''
  return process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001'
}

async function fetchList(
  collection: RelationshipCollection,
  query: string,
): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await fetch(
      `${baseUrl()}/api/puck/rel/${collection}?q=${encodeURIComponent(query ?? '')}`,
      { credentials: 'include' },
    )
    if (!res.ok) return []
    const data = (await res.json()) as { docs?: Array<Record<string, unknown>> }
    return data.docs ?? []
  } catch {
    return []
  }
}

async function fetchMediaList(
  query: string,
): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await fetch(
      `${baseUrl()}/api/puck/media?q=${encodeURIComponent(query ?? '')}`,
      { credentials: 'include' },
    )
    if (!res.ok) return []
    const data = (await res.json()) as { docs?: Array<Record<string, unknown>> }
    return data.docs ?? []
  } catch {
    return []
  }
}

/**
 * Group field representing a CTA link. Mirrors the shape of the Payload
 * `linkField()` helper at src/payload/fields/link.ts so that existing
 * `*Render` components keep working unchanged.
 *
 * Returned as a generic `Field` to defer Puck's strict generic inference
 * until the field is placed inside a typed Config.
 */
export function linkField(label = 'Link'): Field {
  return {
    type: 'object',
    label,
    objectFields: {
      label: { type: 'text', label: 'Label' },
      href: { type: 'text', label: 'URL' },
      newTab: {
        type: 'radio',
        label: 'Open in new tab',
        options: [
          { label: 'Same tab', value: false },
          { label: 'New tab', value: true },
        ],
      },
    },
  } as unknown as Field
}

/**
 * External picker for a single Media doc. Stores the Payload media ID only.
 */
export function mediaField(label = 'Image'): Field {
  return {
    type: 'external',
    label,
    placeholder: 'Pick an image',
    fetchList: async ({ query }: { query: string }) => fetchMediaList(query ?? ''),
    mapProp: (item: unknown) => (item ? (item as { id: number }).id : null),
    mapRow: (item: unknown) => ({
      id: (item as { id: number }).id,
      filename: String((item as { filename?: string }).filename ?? ''),
      alt: String((item as { alt?: string }).alt ?? ''),
    }),
    getItemSummary: (id: unknown) =>
      typeof id === 'number' ? `Media #${id}` : 'No image',
    showSearch: true,
  } as unknown as Field
}

/**
 * External picker for a single relationship document. Stores the Payload
 * doc ID only. Used inside an array for hasMany relationships.
 */
function singleRelExternal(collection: RelationshipCollection): Field {
  const label = collectionLabels[collection]
  return {
    type: 'external',
    label,
    placeholder: `Pick a ${label.toLowerCase()}`,
    fetchList: async ({ query }: { query: string }) => fetchList(collection, query ?? ''),
    mapProp: (item: unknown) => (item ? (item as { id: number }).id : null),
    mapRow: (item: unknown) => {
      const row = item as Record<string, unknown>
      return {
        id: (row.id as number) ?? 0,
        summary: summaryFor[collection](row),
      }
    },
    getItemSummary: (id: unknown) =>
      typeof id === 'number' ? `${label} #${id}` : `Pick a ${label.toLowerCase()}`,
    showSearch: true,
  } as unknown as Field
}

/**
 * Array field of relationship picks. The stored shape is
 * `Array<{ ref: number | null }>`. The page route's
 * `populatePuckData` walker swaps these for full populated docs at
 * `depth: 3` before passing to <Render> on the server.
 */
export function relField(
  collection: RelationshipCollection,
  options?: { label?: string; min?: number; max?: number },
): Field {
  const label = options?.label ?? collectionLabels[collection] + 's'
  return {
    type: 'array',
    label,
    min: options?.min,
    max: options?.max,
    defaultItemProps: { ref: null },
    arrayFields: {
      ref: singleRelExternal(collection),
    },
    getItemSummary: (item: unknown) => {
      const ref = (item as { ref?: unknown }).ref
      return typeof ref === 'number' ? `${collectionLabels[collection]} #${ref}` : 'Empty'
    },
  } as unknown as Field
}

/**
 * Single relationship field — stores `number | null` directly. Use this
 * for to-one relationships (rare in this app; mostly hasMany).
 */
export function relFieldSingle(collection: RelationshipCollection, label?: string): Field {
  const base = singleRelExternal(collection) as unknown as { label?: string }
  return { ...base, label: label ?? collectionLabels[collection] } as unknown as Field
}

/**
 * Helper used inside the page route to flatten an `Array<{ ref: number }>`
 * back into a flat list of IDs that can then be batch-fetched.
 */
export function flattenRefs(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => {
      if (typeof v === 'number') return v
      if (v && typeof v === 'object' && 'ref' in v) {
        const ref = (v as { ref?: unknown }).ref
        return typeof ref === 'number' ? ref : null
      }
      return null
    })
    .filter((v): v is number => typeof v === 'number')
}
