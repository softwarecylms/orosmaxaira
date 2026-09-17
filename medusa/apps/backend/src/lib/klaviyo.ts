/**
 * Klaviyo's REST API, for the order events and newsletter opt-ins Medusa sends.
 *
 * With no KLAVIYO_PRIVATE_KEY (local dev) every call does nothing, so local
 * orders never reach the real Klaviyo account. Nothing here throws: a Klaviyo
 * outage must never affect an order.
 */

const API = "https://a.klaviyo.com/api"
const REVISION = "2026-07-15"

export type KlaviyoProfile = {
  email: string
  phone_number?: string
  first_name?: string
  last_name?: string
  properties?: Record<string, unknown>
}

export const klaviyoEnabled = () => Boolean(process.env.KLAVIYO_PRIVATE_KEY)

async function post(path: string, body: unknown): Promise<boolean> {
  const key = process.env.KLAVIYO_PRIVATE_KEY
  if (!key) return false
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        accept: "application/vnd.api+json",
        "content-type": "application/vnd.api+json",
        revision: REVISION,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error(`[klaviyo] ${path} ${res.status}`, (await res.text()).slice(0, 500))
      return false
    }
    return true
  } catch (e) {
    console.error(`[klaviyo] ${path} failed`, e)
    return false
  }
}

/**
 * Record one event. `uniqueId` makes retries and re-runs safe: Klaviyo keeps
 * only the first event per profile, metric and id.
 */
export function trackEvent(
  metric: string,
  profile: KlaviyoProfile,
  properties: Record<string, unknown>,
  opts: { uniqueId: string; value?: number; time?: string },
): Promise<boolean> {
  return post("/events", {
    data: {
      type: "event",
      attributes: {
        metric: { data: { type: "metric", attributes: { name: metric } } },
        profile: { data: { type: "profile", attributes: profile } },
        properties,
        ...(opts.value === undefined ? {} : { value: opts.value, value_currency: "EUR" }),
        unique_id: opts.uniqueId,
        ...(opts.time ? { time: opts.time } : {}),
      },
    },
  })
}

/** The newsletter list for a language (Newsletter EL / Newsletter EN). */
export function newsletterList(locale?: string | null): string | undefined {
  return locale === "en" ? process.env.KLAVIYO_LIST_EN : process.env.KLAVIYO_LIST_EL
}

/**
 * Subscribe someone who ticked the box. The lists use double opt-in, so Klaviyo
 * emails them a confirmation first; nobody is subscribed without clicking it.
 */
export function subscribeToNewsletter(email: string, locale: string | null | undefined, source: string) {
  const list = newsletterList(locale)
  if (!list) return Promise.resolve(false)
  return post("/profile-subscription-bulk-create-jobs", {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        custom_source: source,
        historical_import: false,
        profiles: {
          data: [
            {
              type: "profile",
              attributes: {
                email,
                subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
              },
            },
          ],
        },
      },
      relationships: { list: { data: { type: "list", id: list } } },
    },
  })
}
