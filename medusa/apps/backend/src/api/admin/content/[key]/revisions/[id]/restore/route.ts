import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../../../../../modules/content"
import type ContentModuleService from "../../../../../../../modules/content/service"
import { revalidateStorefront } from "../../../../../../../lib/storefront"

/**
 * POST /admin/content/:key/revisions/:id/restore — publish an old snapshot
 * again. That is itself a publish, so it adds a revision and the current
 * content stays restorable.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const content = req.scope.resolve<ContentModuleService>(CONTENT_MODULE)
  const { key, id } = req.params
  const [revision] = await content.listContentRevisions({ id, entry_key: key }, { take: 1 })
  if (!revision) return res.status(404).json({ message: "Revision not found" })

  const entry = await content.publishEntry(
    key,
    {
      data: (revision.data ?? {}) as Record<string, unknown>,
      translations: revision.translations as Record<string, unknown> | null,
    },
    req.auth_context?.actor_id
  )
  const revalidated = await revalidateStorefront([`content:${key}`])
  res.json({ entry, revalidated })
}
