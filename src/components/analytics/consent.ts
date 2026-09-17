/**
 * Cookie consent, shared by the server (which sets Google's Consent Mode
 * defaults before Tag Manager loads) and the banner the visitor answers.
 * Necessary cookies — the cart, the checkout, this choice itself — always run;
 * the two optional groups map to Google's consent signals.
 */

export type ConsentState = { analytics: boolean; marketing: boolean }

export const CONSENT_COOKIE = 'om_consent'
/** Six months, then we ask again. */
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180

export const NO_CONSENT: ConsentState = { analytics: false, marketing: false }

/** Fired on `window` with the new ConsentState whenever the visitor answers or
 *  changes the banner, so tools loaded in code (Klaviyo) can react at once. */
export const CONSENT_CHANGE_EVENT = 'oros:consent-change'

/** The stored answer, read in the browser. */
export function readConsent(): ConsentState | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  return parseConsent(m?.[1])
}

/** "a1m0" → analytics yes, marketing no. Anything else means "not asked yet". */
export function parseConsent(value: string | undefined): ConsentState | null {
  const m = /^a([01])m([01])$/.exec(value ?? '')
  return m ? { analytics: m[1] === '1', marketing: m[2] === '1' } : null
}

export function serializeConsent(state: ConsentState): string {
  return `a${state.analytics ? 1 : 0}m${state.marketing ? 1 : 0}`
}

/** Google Consent Mode v2 signals. Ads and personalisation travel together. */
export function consentSignals(state: ConsentState): Record<string, string> {
  const analytics = state.analytics ? 'granted' : 'denied'
  const marketing = state.marketing ? 'granted' : 'denied'
  return {
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    personalization_storage: marketing,
    analytics_storage: analytics,
    functionality_storage: 'granted',
    security_storage: 'granted',
  }
}
