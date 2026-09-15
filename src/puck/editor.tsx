'use client'

import * as React from 'react'
import { Puck, type Data } from '@measured/puck'
import { EditorModeProvider } from '@/components/motion/editor-mode'
import { buildPuckConfig } from './blocks'
import type { LiveData } from './live'

const EMPTY: Data = { root: { props: {} }, content: [], zones: {} }

const asData = (v: unknown): Data =>
  v && typeof v === 'object' && Array.isArray((v as Data).content) ? (v as Data) : EMPTY

/** Carry the site's font variables into Puck's preview frame (it copies the
 *  stylesheets, but not the classes next/font puts on <html>). */
function PreviewFrame({ children, document: frameDoc }: { children: React.ReactNode; document?: Document }) {
  React.useEffect(() => {
    if (!frameDoc) return
    frameDoc.documentElement.className = document.documentElement.className
    frameDoc.body.className = document.body.className
  }, [frameDoc])
  return <>{children}</>
}

/**
 * The Puck editor, running in its own page inside the Payload admin's overlay.
 * The admin sends the page's content for the current language
 * (`puck:init`); every change goes back (`puck:change`) and Payload saves it as
 * a draft, publishes it and keeps its versions.
 */
export function PuckEditor({ locale }: { locale: string }) {
  const config = React.useMemo(() => buildPuckConfig(locale), [locale])
  const [data, setData] = React.useState<Data | null>(null)
  const [live, setLive] = React.useState<LiveData>({})
  const pending = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = React.useRef<Data | null>(null)

  const post = React.useCallback((message: object) => {
    window.parent?.postMessage({ source: 'oros-puck', ...message }, window.location.origin)
  }, [])

  // Receive the page content from the admin.
  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.source !== 'oros-admin') return
      if (e.data.type === 'init') setData(asData(e.data.data))
    }
    window.addEventListener('message', onMessage)
    post({ type: 'ready' })
    return () => window.removeEventListener('message', onMessage)
  }, [post])

  // Live data (prices, newest articles…) for the blocks on the page.
  const blockTypes = React.useMemo(() => [...new Set((data?.content ?? []).map((b) => b.type))].sort().join(','), [data])
  React.useEffect(() => {
    if (!data) return
    fetch('/api/puck/live', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data, locale }),
    })
      .then((r) => (r.ok ? r.json() : { live: {} }))
      .then((j) => setLive(j.live ?? {}))
      .catch(() => {})
    // Only when blocks are added or removed, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockTypes, locale])

  const onChange = React.useCallback(
    (next: Data) => {
      latest.current = next
      if (pending.current) clearTimeout(pending.current)
      pending.current = setTimeout(() => {
        pending.current = null
        post({ type: 'change', data: next })
      }, 400)
    },
    [post],
  )

  if (!data) {
    return <p style={{ padding: 32, fontFamily: 'system-ui' }}>Φόρτωση επεξεργαστή…</p>
  }

  return (
    <EditorModeProvider>
      <Puck
        config={config}
        data={data}
        metadata={{ locale, live }}
        onChange={onChange}
        iframe={{ enabled: true }}
        viewports={[
          { width: 390, height: 'auto', label: 'Κινητό', icon: 'Smartphone' },
          { width: 820, height: 'auto', label: 'Tablet', icon: 'Tablet' },
          { width: 1440, height: 'auto', label: 'Υπολογιστής', icon: 'Monitor' },
        ]}
        headerTitle={locale === 'en' ? 'English' : 'Ελληνικά'}
        overrides={{
          iframe: PreviewFrame,
          headerActions: () => (
            <button
              type="button"
              onClick={() => {
                // Send the last edit now rather than dropping it.
                if (pending.current) {
                  clearTimeout(pending.current)
                  pending.current = null
                  if (latest.current) post({ type: 'change', data: latest.current })
                }
                post({ type: 'close' })
              }}
              style={{
                background: '#F1AC10',
                color: '#fff',
                border: 0,
                borderRadius: 6,
                padding: '8px 14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Τέλος — πίσω στη σελίδα
            </button>
          ),
        }}
      />
    </EditorModeProvider>
  )
}
