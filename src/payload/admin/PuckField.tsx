'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { useField, useLocale } from '@payloadcms/ui'
import { BLOCK_LABELS } from '@/puck/block-labels'

import './puck-field.css'

type PuckData = { root?: unknown; content?: { type: string }[]; zones?: unknown }

const EMPTY: PuckData = { root: { props: {} }, content: [], zones: {} }

/**
 * The page's content field in the Payload admin: a summary of its sections and
 * a "Visual Editor" button. The editor opens full screen (its own page,
 * /editor/<language>, so the sections render with the site's real styles) and
 * talks to this field over postMessage: it receives the content for the
 * language being edited, and every change comes back into the form — Payload
 * then saves the draft, publishes and keeps versions as for any field.
 */
const PuckField: React.FC = () => {
  const { value, setValue } = useField<PuckData>({})
  const locale = useLocale()
  const [open, setOpen] = React.useState(false)
  const frame = React.useRef<HTMLIFrameElement>(null)
  const valueRef = React.useRef<PuckData>(value ?? EMPTY)
  valueRef.current = value && Array.isArray(value.content) ? value : EMPTY

  React.useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.source !== 'oros-puck') return
      if (e.data.type === 'ready') {
        frame.current?.contentWindow?.postMessage(
          { source: 'oros-admin', type: 'init', data: valueRef.current },
          window.location.origin,
        )
      } else if (e.data.type === 'change') {
        setValue(e.data.data)
      } else if (e.data.type === 'close') {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('message', onMessage)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('message', onMessage)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, setValue])

  const blocks = valueRef.current.content ?? []
  const code = locale?.code ?? 'el'

  return (
    <div className="puck-field">
      <div className="puck-field__label">Page content</div>
      <p className="puck-field__hint">
        Edit what this page shows — texts, images, links, and the order of its sections — in the
        Visual Editor. You are editing the <strong>{locale?.label ? String(locale.label) : code}</strong> version;
        switch language at the top of this page to edit the other one.
      </p>

      <div className="puck-field__summary">
        <div className="puck-field__summary-meta">
          <span className="puck-field__summary-count">{blocks.length}</span>
          <span className="puck-field__summary-label">{blocks.length === 1 ? 'section' : 'sections'}</span>
        </div>
        {blocks.length ? (
          <ul className="puck-field__summary-list">
            {blocks.slice(0, 16).map((b, i) => (
              <li key={`${b.type}-${i}`} className="puck-field__chip">
                {BLOCK_LABELS[b.type] ?? b.type}
              </li>
            ))}
            {blocks.length > 16 ? <li className="puck-field__chip puck-field__chip--more">+{blocks.length - 16}</li> : null}
          </ul>
        ) : (
          <p className="puck-field__empty">No sections yet — open the Visual Editor to add some.</p>
        )}
        <button type="button" onClick={() => setOpen(true)} className="puck-field__open">
          Visual Editor
        </button>
      </div>

      {open
        ? createPortal(
            <div className="puck-overlay" role="dialog" aria-modal="true" aria-label="Visual Editor">
              <iframe ref={frame} src={`/editor/${code}`} title="Visual Editor" className="puck-overlay__frame" />
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

export default PuckField
