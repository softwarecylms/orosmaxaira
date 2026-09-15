import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /robots.txt — this host is the shop backend and its admin, never a page
 * for search engines. (Every response also carries `X-Robots-Tag: noindex`,
 * see middlewares.ts, and the admin HTML a robots meta, see medusa-config.ts.)
 */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.type("text/plain").send("User-agent: *\nDisallow: /\n")
}
