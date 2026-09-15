
/**
 * How many shop orders are waiting to be handled (placed, not canceled, not yet
 * fulfilled) — the badge on the Payload sidebar's «Orders» link. Read from
 * Medusa's GET /admin/order-counts with a secret API key; null when the key is
 * missing or Medusa is unreachable, so the sidebar simply shows no badge.
 */
export async function countNewOrders(): Promise<number | null> {
  const key = process.env.MEDUSA_SECRET_API_KEY
  const base = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, '')
  if (!key || !base) return null
  try {
    const res = await fetch(`${base}/admin/order-counts`, {
      headers: { authorization: `Basic ${Buffer.from(`${key}:`).toString('base64')}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    const body = (await res.json()) as { new_orders?: number }
    return typeof body.new_orders === 'number' ? body.new_orders : null
  } catch {
    return null
  }
}
