import { cookies } from 'next/headers'
import { CONSENT_COOKIE, NO_CONSENT, consentSignals, parseConsent } from './consent'

/**
 * Google Consent Mode v2 defaults, set before Tag Manager loads: until the
 * visitor agrees, no tag may store anything on their device. A visitor who has
 * already answered gets their own answer as the default, so their tags start
 * right away instead of waiting for the banner.
 */
export async function ConsentInit() {
  const stored = parseConsent((await cookies()).get(CONSENT_COOKIE)?.value)
  const state = stored ?? NO_CONSENT
  // Unanswered: hold tags for half a second so the banner's answer can overtake
  // the defaults before anything fires.
  const defaults = stored ? consentSignals(state) : { ...consentSignals(state), wait_for_update: 500 }
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',${JSON.stringify(defaults)});
gtag('set','ads_data_redaction',${!state.marketing});
gtag('set','url_passthrough',true);`,
      }}
    />
  )
}
