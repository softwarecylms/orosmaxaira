import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../../../modules/content"
import type ContentModuleService from "../../../../../modules/content/service"
import type { ContentBody } from "../../../../middlewares"

/** POST /admin/content/:key/draft — save an unpublished edit (the live page is untouched). */
export async function POST(req: AuthenticatedMedusaRequest<ContentBody>, res: MedusaResponse) {
  const content = req.scope.resolve<ContentModuleService>(CONTENT_MODULE)
  const entry = await content.saveDraft(req.params.key, req.validatedBody, req.auth_context?.actor_id)
  res.json({ entry })
}

/** DELETE /admin/content/:key/draft — discard the draft. */
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const content = req.scope.resolve<ContentModuleService>(CONTENT_MODULE)
  const [existing] = await content.listContentEntries({ key: req.params.key }, { take: 1 })
  if (existing) {
    await content.updateContentEntries({ id: existing.id, draft_data: null, draft_translations: null })
  }
  res.json({ discarded: Boolean(existing) })
}
