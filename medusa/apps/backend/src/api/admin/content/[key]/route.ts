import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../../modules/content"
import type ContentModuleService from "../../../../modules/content/service"
import { revalidateStorefront } from "../../../../lib/storefront"
import type { ContentBody } from "../../../middlewares"

/** GET /admin/content/:key — one entry: live content plus any draft (null if new). */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const content = req.scope.resolve<ContentModuleService>(CONTENT_MODULE)
  const [entry] = await content.listContentEntries({ key: req.params.key }, { take: 1 })
  res.json({ entry: entry ?? null })
}

/**
 * POST /admin/content/:key — publish: replaces the live content, clears the
 * draft, snapshots a revision, and tells the storefront to drop its cache.
 * `revalidated` says whether the storefront confirmed (if not, the edit shows
 * once its cache expires).
 */
export async function POST(req: AuthenticatedMedusaRequest<ContentBody>, res: MedusaResponse) {
  const content = req.scope.resolve<ContentModuleService>(CONTENT_MODULE)
  const key = req.params.key
  const entry = await content.publishEntry(key, req.validatedBody, req.auth_context?.actor_id)
  const revalidated = await revalidateStorefront([`content:${key}`])
  res.json({ entry, revalidated })
}
