'use client'

import { useEffect, useState } from 'react'
import { CONSENT_CHANGE_EVENT, type ConsentState } from './consent'

const SCRIPT_ID = 'klaviyo-onsite'

/**
 * Loads Klaviyo's onsite script (tracking + any Klaviyo signup forms) only for
 * visitors who accepted marketing cookies, and only where
 * NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY is set (production). Events are sent from
 * src/lib/klaviyo-browser.ts.
 *
 * If consent is withdrawn, Klaviyo's cookie is removed and the helpers stop
 * sending straight away; the already-loaded script is gone on the next page load.
 */
export function KlaviyoOnsite({ initialMarketing }: { initialMarketing: boolean }) {
  const publicKey = process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY
  const [granted, setGranted] = useState(initialMarketing)

  useEffect(() => {
    const onChange = (e: Event) => setGranted(Boolean((e as CustomEvent<ConsentState>).detail?.marketing))
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange)
  }, [])

  useEffect(() => {
    if (!publicKey) return
    if (!granted) {
      for (const domain of ['', `; domain=.${location.hostname.replace(/^www\./, '')}`]) {
        document.cookie = `__kla_id=; path=/; max-age=0${domain}`
      }
      return
    }
    if (document.getElementById(SCRIPT_ID)) return

    // Klaviyo's object snippet: calls made before klaviyo.js arrives are queued.
    const w = window as Window & { klaviyo?: unknown; _klOnsite?: unknown[] }
    if (!w.klaviyo) {
      w._klOnsite = w._klOnsite || []
      w.klaviyo = new Proxy(
        {},
        {
          get(_target, method) {
            if (method === 'push') return (...args: unknown[]) => w._klOnsite!.push(...args)
            return (...args: unknown[]) =>
              new Promise((resolve) => {
                const callback = typeof args[args.length - 1] === 'function' ? (args.pop() as (r: unknown) => void) : null
                w._klOnsite!.push([method, ...args, (result: unknown) => {
                  callback?.(result)
                  resolve(result)
                }])
              })
          },
        },
      )
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.src = `https://static.klaviyo.com/onsite/js/${publicKey}/klaviyo.js?company_id=${publicKey}`
    document.head.appendChild(script)
  }, [granted, publicKey])

  return null
}
