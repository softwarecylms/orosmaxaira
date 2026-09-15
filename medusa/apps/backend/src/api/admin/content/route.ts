import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../modules/content"
import type ContentModuleService from "../../../modules/content/service"

/** GET /admin/content — every content entry, without its (large) content. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const content = req.scope.resolve<ContentModuleService>(CONTENT_MODULE)
  const entries = await content.listContentEntries(
    {},
    { select: ["id", "key", "updated_at", "updated_by", "draft_data"], order: { key: "ASC" } }
  )
  res.json({
    entries: entries.map(({ draft_data, ...e }) => ({ ...e, has_draft: draft_data != null })),
  })
}
