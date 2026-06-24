'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus, X, ArrowRight, ShoppingBag, Check, Truck } from 'lucide-react'
import { useCart, formatCents } from './cart-store'
import { EASE, DURATION } from '@/lib/motion'

const FREE_SHIPPING_THRESHOLD = 7000 // €70,00 in cents

/**
 * Slide-out cart drawer — opens from the right when the header cart is clicked
 * (state lives in the cart store). Backdrop fade + panel slide; closes on
 * backdrop click, the × button, or Escape. Body scroll locks while open.
 */
export function CartDrawer() {
  const { items, subtotal, count, ready, setQty, removeItem, drawerOpen, closeDrawer, cancelAutoClose } =
    useCart()
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLElement>(null)

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [drawerOpen, closeDrawer])

  // Pause the add-to-cart auto-dismiss once the user actually engages with the
  // panel (moves over it, presses, or focuses inside) — native listeners so the
  // handlers fire reliably regardless of framer-motion event forwarding.
  useEffect(() => {
    if (!drawerOpen) return
    const el = panelRef.current
    if (!el) return
    const pause = () => cancelAutoClose()
    el.addEventListener('mousemove', pause)
    el.addEventListener('pointerdown', pause)
    el.addEventListener('focusin', pause)
    return () => {
      el.removeEventListener('mousemove', pause)
      el.removeEventListener('pointerdown', pause)
      el.removeEventListener('focusin', pause)
    }
  }, [drawerOpen, cancelAutoClose])

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const progressPct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  return (
    <AnimatePresence>
      {drawerOpen ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial="hidden"
          animate="visible"
          exit="hidden"
          aria-hidden={false}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Κλείσιμο καλαθιού"
            onClick={closeDrawer}
            className="absolute inset-0 bg-foreground/40"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: DURATION.ui, ease: EASE.snap }}
          />

          {/* Panel */}
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Καλάθι αγορών"
            data-testid="cart-drawer"
            className="absolute right-0 top-0 flex h-full w-[88vw] max-w-[360px] flex-col bg-white shadow-[0_0_60px_-15px_rgba(35,31,32,0.4)]"
            variants={{
              hidden: { x: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 },
              visible: { x: 0, opacity: 1 },
            }}
            transition={{ duration: DURATION.ui, ease: EASE.snap }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-[18px] font-semibold text-foreground">
                Το καλάθι σας
                <span className="text-[15px] font-normal text-muted">({count})</span>
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Κλείσιμο"
                className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-offwhite hover:text-accent"
              >
                <X className="size-5" />
              </button>
            </div>

            {!ready ? (
              <div className="flex-1" aria-hidden="true" />
            ) : items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="size-10 text-muted/40" strokeWidth={1.4} aria-hidden="true" />
                <p className="text-[16px] text-muted">Το καλάθι σας είναι άδειο.</p>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex items-center gap-2 rounded-[4px] bg-accent px-5 py-3 text-[15px] text-white transition-colors hover:bg-foreground"
                >
                  Συνεχίστε τις αγορές
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <>
                {/* Line items */}
                <div className="flex-1 divide-y divide-border overflow-y-auto px-5">
                  {items.map((item) => (
                    <div key={item.key} className="flex gap-3 py-4">
                      <Link
                        href={`/shop/${item.handle}`}
                        onClick={closeDrawer}
                        className="relative size-[72px] shrink-0 overflow-hidden rounded-[4px] bg-offwhite"
                      >
                        <Image src={item.image} alt={item.title} fill sizes="72px" className="object-cover" />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <Link
                          href={`/shop/${item.handle}`}
                          onClick={closeDrawer}
                          className="line-clamp-2 text-[14px] font-medium leading-[19px] text-foreground transition-colors hover:text-accent"
                        >
                          {item.title}
                        </Link>
                        {item.size ? (
                          <p className="text-[12px] text-muted">
                            {item.container ? `${item.container} · ` : ''}
                            {item.size}
                          </p>
                        ) : null}

                        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center rounded-[5px] border border-border">
                            <button
                              type="button"
                              onClick={() => setQty(item.key, item.quantity - 1)}
                              aria-label="Μείωση ποσότητας"
                              className="flex size-7 items-center justify-center text-foreground transition-colors hover:text-accent"
                            >
                              <Minus className="size-3" strokeWidth={2} />
                            </button>
                            <span className="w-7 text-center text-[14px] font-semibold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(item.key, item.quantity + 1)}
                              aria-label="Αύξηση ποσότητας"
                              className="flex size-7 items-center justify-center text-foreground transition-colors hover:text-accent"
                            >
                              <Plus className="size-3" strokeWidth={2} />
                            </button>
                          </div>
                          <span className="text-[14px] font-medium text-foreground">
                            {formatCents(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Αφαίρεση ${item.title}`}
                        className="-mr-1 flex size-7 shrink-0 items-center justify-center self-start text-muted transition-colors hover:text-accent"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 border-t border-border px-5 py-4">
                  {/* Free-shipping progress */}
                  <div className="flex flex-col gap-2">
                    {remaining > 0 ? (
                      <p className="flex items-center gap-1.5 text-[12px] leading-[16px] text-foreground">
                        <Truck className="size-4 shrink-0 text-accent" strokeWidth={2} aria-hidden="true" />
                        <span>
                          Προσθέστε <span className="font-semibold">{formatCents(remaining)}</span> ακόμη
                          για δωρεάν μεταφορικά.
                        </span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5 text-[12px] font-medium leading-[16px] text-success">
                        <Check className="size-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                        Κερδίσατε δωρεάν μεταφορικά!
                      </p>
                    )}
                    <div
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progressPct}
                      aria-label="Πρόοδος για δωρεάν μεταφορικά"
                      className="h-2 w-full overflow-hidden rounded-full bg-cream"
                    >
                      <div
                        className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                          remaining > 0 ? 'bg-accent' : 'bg-success'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[16px] font-semibold text-foreground">
                    <span>Υποσύνολο</span>
                    <span>{formatCents(subtotal)}</span>
                  </div>
                  <p className="text-[12px] text-muted">Τα μεταφορικά υπολογίζονται στο ταμείο.</p>
                  <Link
                    href="/checkout"
                    onClick={closeDrawer}
                    className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-accent p-[14px] text-[16px] text-white transition-colors hover:bg-foreground"
                  >
                    Ταμείο
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeDrawer}
                    className="text-center text-[14px] text-muted underline-offset-2 transition-colors hover:text-accent hover:underline"
                  >
                    Προβολή καλαθιού
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
