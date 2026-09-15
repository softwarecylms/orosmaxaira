import { MedusaService } from "@medusajs/framework/utils"
import {
  BlogCategory,
  BlogPost,
  ContentEntry,
  ContentRevision,
  MediaAsset,
} from "./models/definitions"

/** How many publish snapshots are kept per content entry. */
export const REVISIONS_KEPT = 30

export type ContentPayload = {
  data: Record<string, unknown>
  translations?: Record<string, unknown> | null
}

/**
 * Content module service. Extends the auto-generated CRUD with:
 *  - `publishEntry` — upsert a page's content, clear its draft, snapshot a
 *    revision and prune old ones, in one call.
 *  - `saveDraft` — store an unpublished edit next to the live content.
 */
class ContentModuleService extends MedusaService({
  ContentEntry,
  ContentRevision,
  BlogPost,
  BlogCategory,
  MediaAsset,
}) {
  async publishEntry(key: string, payload: ContentPayload, actorId?: string | null) {
    const fields = {
      data: payload.data,
      translations: payload.translations ?? null,
      draft_data: null,
      draft_translations: null,
      updated_by: actorId ?? null,
    }
    const [existing] = await this.listContentEntries({ key }, { take: 1 })
    if (existing) {
      await this.updateContentEntries({ id: existing.id, ...fields })
    } else {
      await this.createContentEntries({ key, ...fields })
    }

    await this.createContentRevisions({
      entry_key: key,
      data: payload.data,
      translations: payload.translations ?? null,
      created_by: actorId ?? null,
    })
    const stale = await this.listContentRevisions(
      { entry_key: key },
      { order: { created_at: "DESC" }, skip: REVISIONS_KEPT, take: 1000, select: ["id"] }
    )
    if (stale.length) await this.deleteContentRevisions(stale.map((r) => r.id))

    const [entry] = await this.listContentEntries({ key }, { take: 1 })
    return entry
  }

  async saveDraft(key: string, payload: ContentPayload, actorId?: string | null) {
    const fields = {
      draft_data: payload.data,
      draft_translations: payload.translations ?? null,
      updated_by: actorId ?? null,
    }
    const [existing] = await this.listContentEntries({ key }, { take: 1 })
    if (existing) {
      await this.updateContentEntries({ id: existing.id, ...fields })
    } else {
      await this.createContentEntries({ key, ...fields })
    }
    const [entry] = await this.listContentEntries({ key }, { take: 1 })
    return entry
  }
}

export default ContentModuleService
