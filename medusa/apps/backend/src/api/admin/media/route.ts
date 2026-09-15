import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { storefrontUrl } from "../../../lib/storefront"

/**
 * GET /admin/media — the image library the admin's picker browses.
 *
 * The site's media lives in the storefront's `public/images/` folder (every
 * activity and workshop image is stored as a `/images/...` path), and the
 * storefront publishes an index of it at `/media-manifest.json`. Medusa proxies
 * that here rather than having the admin fetch it directly, so the browser only
 * ever talks to this origin — no CORS setup, and the picker keeps working if the
 * storefront URL changes.
 *
 * The origin comes from `storefrontUrl()` (src/lib/storefront.ts).
 */

type MediaItem = { path: string; name: string; folder: string; bytes: number }
type Manifest = { generatedAt?: string; folders: string[]; items: MediaItem[] }

/** Small in-process cache — the manifest only changes on a storefront deploy. */
let cache: { at: number; origin: string; data: Manifest } | null = null
const TTL_MS = 60_000

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const origin = storefrontUrl()

  if (cache && cache.origin === origin && Date.now() - cache.at < TTL_MS) {
    res.json({ origin, ...cache.data, cached: true })
    return
  }

  try {
    const r = await fetch(`${origin}/media-manifest.json`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    })
    if (!r.ok) throw new Error(`storefront responded ${r.status}`)

    const data = (await r.json()) as Manifest
    if (!Array.isArray(data?.items)) throw new Error("manifest has no items array")

    cache = { at: Date.now(), origin, data }
    res.json({ origin, ...data, cached: false })
  } catch (e) {
    // Never fail the editor over this — the picker falls back to a URL input.
    res.json({
      origin,
      folders: [],
      items: [],
      error: `Could not read the media library from ${origin}: ${(e as Error).message}`,
    })
  }
}
