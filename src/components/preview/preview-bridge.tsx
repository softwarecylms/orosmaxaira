'use client'

import { useEffect } from 'react'

/**
 * Click-to-edit bridge for the Medusa admin's live preview.
 *
 * Renders nothing and does nothing unless the page is loaded with `?preview=1`
 * inside an iframe — so a normal visitor is completely unaffected, and the page
 * stays statically rendered (this reads `location`, not `searchParams`, which
 * would force the route dynamic).
 *
 * When active it outlines any element carrying `data-edit="<key>"` on hover and
 * posts `{ source: 'oros-preview', type: 'select', key }` to the parent when one
 * is clicked. It also accepts `{ type: 'highlight', key }` back from the admin to
 * scroll that section into view — so selecting in the panel moves the preview,
 * and clicking the preview moves the panel.
 */
export function PreviewBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('preview') !== '1') return
    if (window.parent === window) return

    const style = document.createElement('style')
    style.textContent = `
      [data-edit] { cursor: pointer; }
      [data-edit]:hover { outline: 2px dashed rgba(241,172,16,.9); outline-offset: 3px; }
      [data-edit].oros-selected { outline: 2px solid rgba(241,172,16,1); outline-offset: 3px; }
      .oros-preview-badge {
        position: fixed; inset-block-start: 8px; inset-inline-start: 8px; z-index: 2147483647;
        background: rgba(35,31,32,.85); color: #fff; font: 500 12px/1.4 system-ui, sans-serif;
        padding: 4px 9px; border-radius: 999px; pointer-events: none;
      }
    `
    document.head.appendChild(style)

    const badge = document.createElement('div')
    badge.className = 'oros-preview-badge'
    badge.textContent = 'Λειτουργία επεξεργασίας — κάντε κλικ σε μια ενότητα'
    document.body.appendChild(badge)

    const select = (key: string) => {
      document.querySelectorAll('[data-edit].oros-selected').forEach((el) => {
        el.classList.remove('oros-selected')
      })
      const el = document.querySelector(`[data-edit="${CSS.escape(key)}"]`)
      el?.classList.add('oros-selected')
      return el
    }

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-edit]')
      if (!target) return
      // Editing the page, not browsing it — don't follow links or submit forms.
      e.preventDefault()
      e.stopPropagation()
      const key = target.dataset.edit!
      select(key)
      window.parent.postMessage({ source: 'oros-preview', type: 'select', key }, '*')
    }

    const onMessage = (e: MessageEvent) => {
      if (e.data?.source !== 'oros-admin') return
      if (e.data.type !== 'highlight' || typeof e.data.key !== 'string') return
      const el = select(e.data.key)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('message', onMessage)
    // Tell the admin which sections this page actually offers.
    window.parent.postMessage(
      {
        source: 'oros-preview',
        type: 'ready',
        keys: [...document.querySelectorAll('[data-edit]')].map(
          (el) => (el as HTMLElement).dataset.edit,
        ),
      },
      '*',
    )

    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('message', onMessage)
      style.remove()
      badge.remove()
    }
  }, [])

  return null
}
