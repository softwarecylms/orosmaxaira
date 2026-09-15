import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../modules/content"
import type ContentModuleService from "../../../modules/content/service"
import type { MediaAssetBody } from "../../middlewares"

/** GET /admin/media-assets — images uploaded from the admin, newest first. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const content = req.scope.resolve<ContentModuleService>(CONTENT_MODULE)
  const assets = await content.listMediaAssets({}, { order: { created_at: "DESC" } })
  res.json({ assets })
}

/**
 * POST /admin/media-assets — record an image already stored through Medusa's
 * `POST /admin/uploads` (the admin measures width/height in the browser).
 */
export async function POST(req: MedusaRequest<MediaAssetBody>, res: MedusaResponse) {
  const content = req.scope.resolve<ContentModuleService>(CONTENT_MODULE)
  const asset = await content.createMediaAssets(req.validatedBody)
  res.status(201).json({ asset })
}
