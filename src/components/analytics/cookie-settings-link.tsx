'use client'

import { COOKIE_SETTINGS_EVENT } from './cookie-banner'

/** Footer link that reopens the cookie choices — consent has to be as easy to
 *  withdraw as it was to give. */
export function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
      className="transition-colors hover:text-accent"
    >
      {label}
    </button>
  )
}
