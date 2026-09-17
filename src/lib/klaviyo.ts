import 'server-only'

/**
 * Klaviyo's REST API from the storefront: newsletter signups from the footer.
 * (Order events and the checkout opt-in are sent by Medusa, see
 * medusa/apps/backend/src/lib/klaviyo.ts.)
 *
 * Without KLAVIYO_PRIVATE_KEY nothing is sent. Nothing here throws.
 */

const API = 'https://a.klaviyo.com/api'
const REVISION = '2026-07-15'

/** The newsletter list for a language: Newsletter EL or Newsletter EN. */
function newsletterList(locale: string): string | undefined {
  return locale === 'en' ? process.env.KLAVIYO_LIST_EN : process.env.KLAVIYO_LIST_EL
}

/**
 * Subscribe an address to the list for its language. The lists use double
 * opt-in: Klaviyo emails a confirmation link, and only a click subscribes.
 * Returns false when Klaviyo is not configured or refused the request.
 */
export async function subscribeToNewsletter(email: string, locale: string, source: string): Promise<boolean> {
  const key = process.env.KLAVIYO_PRIVATE_KEY
  const list = newsletterList(locale)
  if (!key || !list) {
    console.warn('[klaviyo] not configured; newsletter signup not sent', { source })
    return false
  }
  try {
    const res = await fetch(`${API}/profile-subscription-bulk-create-jobs`, {
      method: 'POST',
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        accept: 'application/vnd.api+json',
        'content-type': 'application/vnd.api+json',
        revision: REVISION,
      },
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            custom_source: source,
            historical_import: false,
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email,
                    properties: { language: locale === 'en' ? 'en' : 'el' },
                    subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
                  },
                },
              ],
            },
          },
          relationships: { list: { data: { type: 'list', id: list } } },
        },
      }),
      cache: 'no-store',
    })
    if (!res.ok) {
      console.error('[klaviyo] newsletter signup failed', res.status, (await res.text()).slice(0, 300))
      return false
    }
    return true
  } catch (e) {
    console.error('[klaviyo] newsletter signup failed', e)
    return false
  }
}
