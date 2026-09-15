import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../../../modules/content"
import type ContentModuleService from "../../../../../modules/content/service"

/** GET /admin/content/:key/revisions — publish history, newest first (no content). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const content = req.scope.resolve<ContentModuleService>(CONTENT_MODULE)
  const revisions = await content.listContentRevisions(
    { entry_key: req.params.key },
    { select: ["id", "created_at", "created_by"], order: { created_at: "DESC" } }
  )
  res.json({ revisions })
}
