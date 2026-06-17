import 'server-only'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Data } from '@measured/puck'
import type { RelationshipCollection } from './types'

/**
 * Map: component type → which props are relationship arrays and which
 * collection they reference. The stored shape is
 * `Array<{ ref: number | null }>`. We replace it with the populated
 * `Array<Doc>` so the existing `*Render` components can read it.
 */
const componentRelMap: Record<string, Partial<Record<string, RelationshipCollection>>> = {
  HeroHome: { logos: 'client-logos' },
  HeroContact: { logos: 'client-logos' },
  HeroAbout: { logos: 'client-logos' },
  TestimonialsRow: { testimonials: 'testimonials' },
  PortfolioStrip: { items: 'case-studies' },
  PortfolioArchiveBlock: { items: 'case-studies' },
  BlogTeaser: { posts: 'posts' },
  BlogIndexBlock: { posts: 'posts' },
  TeamGrid: { members: 'team-members' },
  FaqSection: { faqs: 'faqs' },
}

/**
 * Map: component type → which props are media IDs (single). We replace
 * the stored ID with the full media doc so the `*Render` components
 * receive `{ url, alt, width, height, ... }` and `mediaSrc()` works.
 */
const componentMediaMap: Record<string, string[]> = {
  HeroVideo: ['poster'],
  HeroInner: ['image'],
  HeroContact: ['heroImage'],
  HeroAbout: ['heroImage'],
  StatsCards: [], // handled at array-item level
  DarkFeatureBand: ['image'],
  FeatureListChart: ['image'],
  ContactFormMap: ['mapImage'],
  FaqSection: ['image'],
}

function isRefArray(value: unknown): value is Array<{ ref?: unknown } | number> {
  return Array.isArray(value)
}

function flattenRefs(value: unknown): number[] {
  if (!isRefArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'number') return item
      if (item && typeof item === 'object' && 'ref' in item) {
        const ref = (item as { ref?: unknown }).ref
        return typeof ref === 'number' ? ref : null
      }
      return null
    })
    .filter((v): v is number => typeof v === 'number')
}

type AnyComponent = { type: string; props: Record<string, unknown> }

/**
 * Walk the Puck data tree and replace stored relationship/media IDs
 * with fully-populated Payload docs (depth: 3) so the existing
 * `*Render` components get the same shape they had under the old
 * `blocks` field.
 *
 * Server-only — uses Payload's local API.
 */
export async function populatePuckData(data: Data | null | undefined): Promise<Data> {
  const empty: Data = { root: {}, content: [], zones: {} }
  if (!data || !Array.isArray(data.content)) return data ?? empty

  const payload = await getPayload({ config: configPromise })

  const relIdsByCollection = new Map<RelationshipCollection, Set<number>>()
  const mediaIds = new Set<number>()

  for (const block of data.content as unknown as AnyComponent[]) {
    const relMap = componentRelMap[block.type]
    if (relMap) {
      for (const [propKey, collection] of Object.entries(relMap)) {
        if (!collection) continue
        const ids = flattenRefs(block.props?.[propKey])
        if (ids.length) {
          if (!relIdsByCollection.has(collection)) relIdsByCollection.set(collection, new Set())
          ids.forEach((id) => relIdsByCollection.get(collection)!.add(id))
        }
      }
    }

    const mediaKeys = componentMediaMap[block.type] ?? []
    for (const key of mediaKeys) {
      const v = block.props?.[key]
      if (typeof v === 'number') mediaIds.add(v)
    }

    if (block.type === 'StatsCards' && Array.isArray(block.props?.cards)) {
      for (const card of block.props.cards as Array<Record<string, unknown>>) {
        if (typeof card?.image === 'number') mediaIds.add(card.image as number)
      }
    }

    if (block.type === 'HeroContact') {
      const teamMember = block.props?.teamMember as Record<string, unknown> | undefined
      if (typeof teamMember?.photo === 'number') mediaIds.add(teamMember.photo as number)
    }

    if (block.type === 'FaqSection') {
      const sidePanel = block.props?.sidePanel as Record<string, unknown> | undefined
      if (typeof sidePanel?.image === 'number') mediaIds.add(sidePanel.image as number)
    }
  }

  const fetchedDocs = new Map<RelationshipCollection, Map<number, unknown>>()
  await Promise.all(
    Array.from(relIdsByCollection.entries()).map(async ([collection, ids]) => {
      const docs = await payload.find({
        collection: collection as never,
        where: { id: { in: Array.from(ids) } },
        depth: 3,
        limit: ids.size + 10,
      })
      const map = new Map<number, unknown>()
      for (const d of docs.docs as Array<{ id: number }>) map.set(d.id, d)
      fetchedDocs.set(collection, map)
    }),
  )

  const fetchedMedia = new Map<number, unknown>()
  if (mediaIds.size) {
    const docs = await payload.find({
      collection: 'media',
      where: { id: { in: Array.from(mediaIds) } },
      depth: 0,
      limit: mediaIds.size + 10,
    })
    for (const d of docs.docs as Array<{ id: number }>) fetchedMedia.set(d.id, d)
  }

  const newContent = (data.content as unknown as AnyComponent[]).map((block) => {
    const newProps: Record<string, unknown> = { ...block.props }

    const relMap = componentRelMap[block.type]
    if (relMap) {
      for (const [propKey, collection] of Object.entries(relMap)) {
        if (!collection) continue
        const ids = flattenRefs(newProps[propKey])
        const docMap = fetchedDocs.get(collection) ?? new Map()
        newProps[propKey] = ids.map((id) => docMap.get(id)).filter(Boolean)
      }
    }

    const mediaKeys = componentMediaMap[block.type] ?? []
    for (const key of mediaKeys) {
      const v = newProps[key]
      if (typeof v === 'number') newProps[key] = fetchedMedia.get(v) ?? null
    }

    if (block.type === 'StatsCards' && Array.isArray(newProps.cards)) {
      newProps.cards = (newProps.cards as Array<Record<string, unknown>>).map((card) => {
        if (typeof card?.image === 'number') {
          return { ...card, image: fetchedMedia.get(card.image as number) ?? null }
        }
        return card
      })
    }

    if (block.type === 'HeroContact' && newProps.teamMember && typeof newProps.teamMember === 'object') {
      const teamMember = { ...(newProps.teamMember as Record<string, unknown>) }
      if (typeof teamMember.photo === 'number') {
        teamMember.photo = fetchedMedia.get(teamMember.photo as number) ?? null
      }
      newProps.teamMember = teamMember
    }

    if (block.type === 'FaqSection' && newProps.sidePanel && typeof newProps.sidePanel === 'object') {
      const sidePanel = { ...(newProps.sidePanel as Record<string, unknown>) }
      if (typeof sidePanel.image === 'number') {
        sidePanel.image = fetchedMedia.get(sidePanel.image as number) ?? null
      }
      newProps.sidePanel = sidePanel
    }

    return { ...block, props: newProps }
  })

  for (const block of newContent as unknown as AnyComponent[]) {
    if (block.type === 'BlogTeaser') {
      const mode = block.props?.mode
      if (mode !== 'manual') {
        const limit = typeof block.props?.limit === 'number' ? block.props.limit : 3
        const docs = await payload.find({
          collection: 'posts',
          limit,
          depth: 1,
          sort: '-publishedAt',
        })
        block.props.posts = docs.docs
      }
    }

    if (block.type === 'BlogIndexBlock') {
      const posts = block.props?.posts
      if (!Array.isArray(posts) || posts.length === 0) {
        const docs = await payload.find({
          collection: 'posts',
          limit: 500,
          depth: 1,
          sort: '-publishedAt',
        })
        block.props.posts = docs.docs
      }
    }

    if (block.type === 'PortfolioArchiveBlock') {
      const items = block.props?.items
      if (!Array.isArray(items) || items.length === 0) {
        const docs = await payload.find({
          collection: 'case-studies',
          limit: 500,
          depth: 1,
          sort: '-publishedAt',
        })
        block.props.items = docs.docs
      }
    }

  }

  return { ...data, content: newContent as Data['content'] }
}
