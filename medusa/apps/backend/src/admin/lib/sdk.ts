import Medusa from "@medusajs/js-sdk"

/**
 * Admin-side Medusa SDK. The admin dashboard is served from the backend origin
 * and authenticates via session, so `baseUrl` is the current origin and auth is
 * session-based (cookies sent automatically on every request).
 */
export const sdk = new Medusa({
  baseUrl: typeof window !== "undefined" ? window.location.origin : "/",
  auth: { type: "session" },
})
