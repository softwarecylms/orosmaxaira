/**
 * The storefront's origin, for server-side calls from Medusa to the Next.js
 * site (media manifest, cache revalidation).
 *
 * `STOREFRONT_URL` sets it. It falls back to the first entry in `STORE_CORS`
 * (the storefront is by definition an allowed origin) and then to the local dev
 * port, so this works with no extra configuration in development.
 */
export function storefrontUrl(): string {
  const explicit = process.env.STOREFRONT_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")
  const firstCors = process.env.STORE_CORS?.split(",")[0]?.trim()
  if (firstCors) return firstCors.replace(/\/$/, "")
  return "http://localhost:3002"
}

/**
 * Ask the storefront to drop its cached copy of some content, so an edit shows
 * on the next page view instead of after the cache TTL.
 *
 * Posts `{ tags }` to the storefront's `/api/revalidate/` (with the trailing
 * slash — the site 308s without it), authenticated with the
 * `REVALIDATION_SECRET` both apps share. Waits at most 3 s and never throws: the
 * save has already succeeded, and the storefront's TTL is the safety net.
 * Returns whether the storefront confirmed.
 */
export async function revalidateStorefront(tags: string[]): Promise<boolean> {
  const secret = process.env.REVALIDATION_SECRET
  if (!secret || !tags.length) return false
  try {
    const r = await fetch(`${storefrontUrl()}/api/revalidate/`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(3000),
    })
    return r.ok
  } catch {
    return false
  }
}
