'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { Puck, type Data } from '@measured/puck'
import { useField } from '@payloadcms/ui'

import { puckConfig } from '@/puck/config'

import '@measured/puck/puck.css'
import './puck-field.css'

const EMPTY_DATA: Data = { root: { props: {} }, content: [], zones: {} }

function isPuckData(v: unknown): v is Data {
  return Boolean(v && typeof v === 'object' && Array.isArray((v as Data).content))
}

function countBlocks(data: Data | null | undefined): number {
  if (!data) return 0
  let total = Array.isArray(data.content) ? data.content.length : 0
  if (data.zones && typeof data.zones === 'object') {
    for (const arr of Object.values(data.zones)) {
      if (Array.isArray(arr)) total += arr.length
    }
  }
  return total
}

/**
 * Pull the stylesheet hrefs the frontend uses (Tailwind + globals) so we can
 * inject them into Puck's iframe and the editor preview looks like the real
 * site, not naked HTML.
 */
async function fetchFrontendStyleHrefs(): Promise<string[]> {
  try {
    const res = await fetch('/?puckPreview=1', { credentials: 'include' })
    if (!res.ok) return []
    const html = await res.text()
    const hrefs = new Set<string>()
    const linkRe = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi
    const hrefRe = /href=["']([^"']+)["']/i
    for (const tag of html.match(linkRe) ?? []) {
      const m = tag.match(hrefRe)
      if (m && m[1]) hrefs.add(m[1])
    }
    return Array.from(hrefs)
  } catch {
    return []
  }
}

/**
 * Render override that runs INSIDE the Puck iframe. We use it to imperatively
 * style html/body so the preview matches the live site (peach background, no
 * default white margins, correct font), since `root.render` only wraps the
 * page body — not html/body themselves.
 */
type IframeOverrideProps = {
  children: React.ReactNode
  document?: Document
}

function PuckIframeStyles({ children, document: iframeDoc }: IframeOverrideProps) {
  React.useEffect(() => {
    if (!iframeDoc) return
    const html = iframeDoc.documentElement
    const body = iframeDoc.body
    const styleEl = iframeDoc.createElement('style')
    styleEl.setAttribute('data-puck-preview-reset', 'true')
    styleEl.textContent = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: #fcf2f0 !important;
        color: #1d1d1f !important;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
      }
      body { min-height: 100vh; }
    `
    iframeDoc.head.appendChild(styleEl)
    html.style.backgroundColor = '#fcf2f0'
    body.style.backgroundColor = '#fcf2f0'
    return () => {
      styleEl.remove()
    }
  }, [iframeDoc])

  return <>{children}</>
}

type EditorOverlayProps = {
  initialData: Data
  onChange: (next: Data) => void
  onClose: () => void
}

function EditorOverlay({ initialData, onChange, onClose }: EditorOverlayProps) {
  const [mounted, setMounted] = React.useState(false)
  const [styleHrefs, setStyleHrefs] = React.useState<string[]>([])

  React.useEffect(() => {
    setMounted(true)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Pull the frontend stylesheets so we can inject them into the Puck iframe.
  React.useEffect(() => {
    let cancelled = false
    fetchFrontendStyleHrefs().then((hrefs) => {
      if (!cancelled) setStyleHrefs(hrefs)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Mount the frontend stylesheets into the admin DOM. Puck's iframe will copy
  // them into its document via waitForStyles.
  React.useEffect(() => {
    if (styleHrefs.length === 0) return
    const created: HTMLLinkElement[] = []
    for (const href of styleHrefs) {
      const existing = document.querySelector(
        `link[data-puck-preview-style][href="${href}"]`,
      )
      if (existing) continue
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.setAttribute('data-puck-preview-style', 'true')
      document.head.appendChild(link)
      created.push(link)
    }
    return () => {
      for (const link of created) link.remove()
    }
  }, [styleHrefs])

  if (!mounted) return null

  return createPortal(
    <div className="puck-overlay" role="dialog" aria-modal="true" aria-label="Visual page editor">
      <header className="puck-overlay__header">
        <div className="puck-overlay__title">Visual editor</div>
        <div className="puck-overlay__actions">
          <span className="puck-overlay__hint">Changes auto-save as you edit</span>
          <button type="button" onClick={onClose} className="puck-overlay__close">
            Close editor
          </button>
        </div>
      </header>
      <div className="puck-overlay__canvas">
        <Puck
          config={puckConfig}
          data={initialData}
          onChange={onChange}
          iframe={{ enabled: false }}
        />
      </div>
    </div>,
    document.body,
  )
}

const PuckField: React.FC = () => {
  const { value, setValue, formInitializing } = useField<Data>({})
  const [isOpen, setIsOpen] = React.useState(false)
  const editorKeyRef = React.useRef(0)

  const safeValue = React.useMemo<Data>(() => {
    if (isPuckData(value)) return value
    return EMPTY_DATA
  }, [value])

  const ready = !formInitializing

  const handleChange = React.useCallback(
    (next: Data) => {
      setValue(next)
    },
    [setValue],
  )

  const open = React.useCallback(() => {
    editorKeyRef.current += 1
    setIsOpen(true)
  }, [])

  const close = React.useCallback(() => setIsOpen(false), [])

  const blockCount = countBlocks(safeValue)
  const blockNames = React.useMemo(() => {
    const list: string[] = []
    if (Array.isArray(safeValue.content)) {
      for (const item of safeValue.content) {
        if (item && typeof item === 'object' && typeof item.type === 'string') {
          list.push(item.type)
        }
      }
    }
    return list
  }, [safeValue])

  return (
    <div className="puck-field">
      <div className="puck-field__label">Visual editor</div>
      <p className="puck-field__hint">
        Click the button below to open the full-screen drag-and-drop editor.
      </p>

      <div className="puck-field__summary">
        <div className="puck-field__summary-meta">
          <span className="puck-field__summary-count">{blockCount}</span>
          <span className="puck-field__summary-label">
            {blockCount === 1 ? 'block on this page' : 'blocks on this page'}
          </span>
        </div>
        {blockNames.length > 0 ? (
          <ul className="puck-field__summary-list">
            {blockNames.slice(0, 12).map((name, i) => (
              <li key={`${name}-${i}`} className="puck-field__chip">
                {name}
              </li>
            ))}
            {blockNames.length > 12 ? (
              <li className="puck-field__chip puck-field__chip--more">
                +{blockNames.length - 12}
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="puck-field__empty">No blocks yet. Open the editor to add some.</p>
        )}
        <button
          type="button"
          onClick={open}
          disabled={!ready}
          className="puck-field__open"
        >
          {ready ? 'Open visual editor' : 'Loading editor…'}
        </button>
      </div>

      {isOpen ? (
        <EditorOverlay
          key={editorKeyRef.current}
          initialData={safeValue}
          onChange={handleChange}
          onClose={close}
        />
      ) : null}
    </div>
  )
}

export default PuckField
