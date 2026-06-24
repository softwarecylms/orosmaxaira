'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

/**
 * Client-side cart for the static honey catalogue. Static products aren't in
 * Medusa, so the cart lives entirely in the browser (React state + localStorage)
 * — `<CartProvider>` is mounted once in the (frontend) layout and read via
 * `useCart()` from the header badge, product page, cart and checkout.
 */

export type CartItem = {
  /** dedupe key: handle + '|' + size */
  key: string
  handle: string
  title: string
  image: string
  size?: string
  container?: string
  /** display price of the chosen variant, e.g. '€5,70' */
  priceLabel: string
  /** unit price in cents — used for totals */
  unitPrice: number
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  ready: boolean
  addItem: (item: Omit<CartItem, 'key' | 'quantity'>, quantity?: number) => void
  setQty: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clear: () => void
  /** Slide-out cart drawer visibility (opened from the header cart). */
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  /** Open the drawer and auto-dismiss after a few seconds (used on add-to-cart). */
  flashDrawer: () => void
  /** Cancel a pending auto-dismiss (e.g. when the user hovers the drawer). */
  cancelAutoClose: () => void
}

/** How long the drawer stays open after an add-to-cart before auto-closing. */
const FLASH_MS = 3500

const STORAGE_KEY = 'oros_cart'
const CartContext = createContext<CartContextValue | null>(null)

/** '€5,70' / '€31,00' → 570 / 3100 (cents). Returns 0 if unparseable. */
export function parsePrice(label: string): number {
  const m = label.replace(/\./g, '').match(/(\d+)(?:[.,](\d{1,2}))?/)
  if (!m) return 0
  const whole = Number(m[1])
  const frac = m[2] ? Number(m[2].padEnd(2, '0')) : 0
  return whole * 100 + frac
}

/** 570 → '€5,70' (Greek comma decimal). */
export function formatCents(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace('.', ',')}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const openDrawer = useCallback(() => {
    clearCloseTimer()
    setDrawerOpen(true)
  }, [clearCloseTimer])

  const closeDrawer = useCallback(() => {
    clearCloseTimer()
    setDrawerOpen(false)
  }, [clearCloseTimer])

  // Open the drawer, then auto-dismiss unless the user engages with it.
  const flashDrawer = useCallback(() => {
    clearCloseTimer()
    setDrawerOpen(true)
    closeTimer.current = setTimeout(() => setDrawerOpen(false), FLASH_MS)
  }, [clearCloseTimer])

  const cancelAutoClose = useCallback(() => clearCloseTimer(), [clearCloseTimer])

  // Clean up a pending timer on unmount.
  useEffect(() => clearCloseTimer, [clearCloseTimer])

  // Hydrate from localStorage after mount (avoids SSR/client mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw) as CartItem[])
    } catch {
      // ignore corrupt storage
    }
    setReady(true)
  }, [])

  // Persist on change (only after initial hydration).
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore quota errors
    }
  }, [items, ready])

  const addItem = useCallback(
    (item: Omit<CartItem, 'key' | 'quantity'>, quantity = 1) => {
      const key = `${item.handle}|${item.size ?? ''}`
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key)
        if (existing) {
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
          )
        }
        return [...prev, { ...item, key, quantity }]
      })
    },
    [],
  )

  const setQty = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity < 1
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity } : i)),
    )
  }, [])

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const { count, subtotal } = useMemo(() => {
    let count = 0
    let subtotal = 0
    for (const i of items) {
      count += i.quantity
      subtotal += i.unitPrice * i.quantity
    }
    return { count, subtotal }
  }, [items])

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      ready,
      addItem,
      setQty,
      removeItem,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
      flashDrawer,
      cancelAutoClose,
    }),
    [
      items,
      count,
      subtotal,
      ready,
      addItem,
      setQty,
      removeItem,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
      flashDrawer,
      cancelAutoClose,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within <CartProvider>')
  return ctx
}
