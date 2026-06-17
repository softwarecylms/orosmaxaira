'use client'

import * as React from 'react'

const MotionReadyContext = React.createContext(false)

export function MotionReady({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setReady(true)
  }, [])

  return <MotionReadyContext.Provider value={ready}>{children}</MotionReadyContext.Provider>
}

export function useMotionReady() {
  return React.useContext(MotionReadyContext)
}
