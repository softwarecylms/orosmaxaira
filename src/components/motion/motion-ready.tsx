'use client'

import * as React from 'react'
import { MotionConfig } from 'framer-motion'

const MotionReadyContext = React.createContext(false)

export function MotionReady({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setReady(true)
  }, [])

  // reducedMotion="user" drops transform/layout motion for users who ask for
  // it, keeping only soft opacity fades — applies to every framer animation.
  return (
    <MotionConfig reducedMotion="user">
      <MotionReadyContext.Provider value={ready}>{children}</MotionReadyContext.Provider>
    </MotionConfig>
  )
}

export function useMotionReady() {
  return React.useContext(MotionReadyContext)
}
