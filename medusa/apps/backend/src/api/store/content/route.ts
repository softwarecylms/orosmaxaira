import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../modules/content"
import type ContentModuleService from "../../../modules/content/service"

/**
 * GET /store/content?keys=site,home — published content for several entries
 * in one round trip (the storefront needs the site chrome and the page).
 * Returns `{ entries: { [key]: { data, translations, updated_at } } }`; a key
 * with no entry is simply absent, and the storefront keeps its built-in copy.
 *
 * Draft preview: with `draft=1` AND the `x-revalidate-secret` header (only the
 * storefront server knows it), an entry's draft is returned where it has one.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const keys = String(req.query.keys ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 20)
  if (!keys.length) return res.status(400).json({ message: "keys is required" })

  const secret = process.env.REVALIDATION_SECRET
  const draft =
    req.query.draft === "1" && Boolean(secret) && req.headers["x-revalidate-secret"] === secret

  const content = req.scope.resolve<ContentModuleService>(CONTENT_MODULE)
  const rows = await content.listContentEntries({ key: keys })

  const entries: Record<string, { data: unknown; translations: unknown; updated_at: unknown }> = {}
  for (const r of rows) {
    const useDraft = draft && r.draft_data != null
    const data = useDraft ? r.draft_data : r.data
    if (data == null) continue // created as a draft, never published
    entries[r.key] = {
      data,
      translations: useDraft ? r.draft_translations : r.translations,
      updated_at: r.updated_at,
    }
  }
  res.json({ entries })
}
