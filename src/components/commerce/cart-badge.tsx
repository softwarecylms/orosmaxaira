'use client'

import { ShoppingBag } from 'lucide-react'
import { useCart, formatCents } from './cart-store'

/** Header cart pill, reading the client cart. `desktop` shows icon + count +
 *  total; `mobile` shows just the icon + count. Opens the slide-out cart drawer. */
export function CartBadge({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { count, subtotal, openDrawer } = useCart()

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={openDrawer}
        data-testid="header-cart"
        aria-label="Καλάθι"
        className="relative text-foreground"
      >
        <ShoppingBag className="size-6" aria-hidden="true" />
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1 flex size-[15px] items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
            {count}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={openDrawer}
      data-testid="header-cart"
      className="flex items-center gap-3 text-foreground hover:text-accent"
    >
      <span className="relative">
        <ShoppingBag className="size-6" aria-hidden="true" />
        <span className="absolute -right-1.5 -top-1 flex size-[15px] items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
          {count}
        </span>
      </span>
      <span className="text-[17px]">{formatCents(subtotal)}</span>
    </button>
  )
}
