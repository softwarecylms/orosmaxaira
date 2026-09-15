import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { CONTENT_MODULE } from "../../../../modules/content"
import type ContentModuleService from "../../../../modules/content/service"

/** DELETE /admin/media-assets/:id — remove the record and its stored file. */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const content = req.scope.resolve<ContentModuleService>(CONTENT_MODULE)
  const [asset] = await content.listMediaAssets({ id: req.params.id }, { take: 1 })
  if (!asset) return res.status(404).json({ message: "Media asset not found" })

  if (asset.file_key) {
    // A file already gone from storage must not block removing the record.
    await req.scope.resolve(Modules.FILE).deleteFiles([asset.file_key]).catch(() => {})
  }
  await content.deleteMediaAssets([asset.id])
  res.json({ id: asset.id, deleted: true })
}
