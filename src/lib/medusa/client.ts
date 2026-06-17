import Medusa from '@medusajs/js-sdk'

/**
 * Medusa Store API base URL. The backend lives in `medusa/` and runs on :9009
 * for this project (9000 is taken by another local project + php-fpm).
 */
export const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'http://localhost:9009'

/**
 * Shared Medusa JS SDK instance. The publishable key scopes Store API requests
 * to the project's sales channel; it is safe to expose to the client.
 * All calls in this app run server-side (server components + server actions),
 * so the SDK is effectively server-only here.
 */
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === 'development',
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
