'use client'

import * as React from 'react'

/**
 * True inside the Puck visual editor. Entrance animations wait for a section to
 * scroll into view, which the editor's preview frame does not reliably report —
 * so inside the editor every reveal renders its final, visible state at once,
 * and counters show their number.
 */
const EditorModeContext = React.createContext(false)

export function EditorModeProvider({ children }: { children: React.ReactNode }) {
  return <EditorModeContext.Provider value>{children}</EditorModeContext.Provider>
}

export function useEditorMode() {
  return React.useContext(EditorModeContext)
}
