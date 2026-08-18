'use client'

import Image from 'next/image'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Minus, Plus, X, ArrowRight, Check, Truck } from 'lucide-react'
import { useCart, formatCents } from '@/components/commerce/cart-store'
import { localizedProductTitle, localizedContainer } from '@/components/shop/product-i18n'
import { getCartViewUi } from './cart-ui'

const FREE_SHIPPING_THRESHOLD = 7000 // €70,00 in cents

/** Client cart page: line items + order summary. Reads the local honey cart. */
export function CartView() {
  const { items, subtotal, ready, setQty, removeItem } = useCart()
  const locale = useLocale()
  const t = getCartViewUi(locale)

  if (!ready) {
    return <div className="container-wide py-20" aria-hidden="true" />
  }

  if (items.length === 0) {
    return (
      <div className="container-wide flex flex-col items-start gap-5 py-16 md:py-24">
        <p className="text-[17px] text-muted">{t.empty}</p>
        <Link
          href="/proionta"
          className="inline-flex items-center gap-3 rounded-[4px] bg-accent px-5 py-3 text-[17px] text-white transition-colors hover:bg-foreground"
        >
          {t.continueShopping}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    )
  }

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const progressPct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  return (
    <div className="container-wide flex flex-col gap-8 py-12 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Line items */}
        <div className="flex flex-col divide-y divide-border border-y border-border">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 py-5">
              <Link
                href={`/product/${item.handle}`}
                className="relative size-[88px] shrink-0 overflow-hidden rounded-[4px] bg-offwhite"
              >
                <Image src={item.image} alt={item.title} fill sizes="88px" className="object-cover" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link
                  href={`/product/${item.handle}`}
                  className="text-[17px] font-medium leading-[22px] text-foreground transition-colors hover:text-accent"
                >
                  {localizedProductTitle(item.handle, item.title, locale)}
                </Link>
                {item.size ? (
                  <p className="text-[14px] text-muted">
                    {localizedContainer(item.container, locale)
                      ? `${localizedContainer(item.container, locale)} · `
                      : ''}
                    {item.size}
                  </p>
                ) : null}
                <p className="text-[15px] text-accent">{item.priceLabel}</p>

                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
                  <div className="flex w-[104px] items-center justify-between rounded-[5px] border border-border px-3">
                    <button
                      type="button"
                      onClick={() => setQty(item.key, item.quantity - 1)}
                      aria-label={t.decreaseQty}
                      className="flex size-7 items-center justify-center text-foreground transition-colors hover:text-accent"
                    >
                      <Minus className="size-3.5" strokeWidth={2} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        setQty(item.key, Math.max(1, Math.floor(Number(e.target.value) || 1)))
                      }
                      aria-label={t.quantity}
                      className="w-9 bg-transparent text-center text-[15px] font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQty(item.key, item.quantity + 1)}
                      aria-label={t.increaseQty}
                      className="flex size-7 items-center justify-center text-foreground transition-colors hover:text-accent"
                    >
                      <Plus className="size-3.5" strokeWidth={2} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="flex items-center gap-1.5 text-[14px] text-muted transition-colors hover:text-accent"
                  >
                    <X className="size-4" aria-hidden="true" />
                    {t.remove}
                  </button>
                </div>
              </div>

              <div className="shrink-0 whitespace-nowrap text-right text-[16px] font-medium text-foreground">
                {formatCents(item.unitPrice * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="flex h-fit flex-col gap-5 rounded-[4px] border border-border bg-white p-6">
          <h2 className="text-[20px] font-semibold text-foreground">{t.orderSummary}</h2>

          <div className="flex flex-col gap-3 text-[15px]">
            <div className="flex justify-between text-foreground">
              <span className="text-muted">{t.subtotal}</span>
              <span>{formatCents(subtotal)}</span>
            </div>
            <div className="flex justify-between text-foreground">
              <span className="text-muted">{t.shipping}</span>
              <span className="text-muted">{t.calculatedAtCheckout}</span>
            </div>
            {/* Free-shipping progress */}
            <div className="flex flex-col gap-2 pt-1">
              {remaining > 0 ? (
                <p className="flex items-center gap-2 text-[13px] leading-[18px] text-foreground">
                  <Truck className="size-[18px] shrink-0 text-accent" strokeWidth={2} aria-hidden="true" />
                  <span>
                    {t.freeShippingRemaining.pre}
                    <span className="font-semibold">{formatCents(remaining)}</span>
                    {t.freeShippingRemaining.post}
                  </span>
                </p>
              ) : (
                <p className="flex items-center gap-2 text-[13px] font-medium leading-[18px] text-success">
                  <Check className="size-[18px] shrink-0" strokeWidth={2.5} aria-hidden="true" />
                  {t.freeShippingEarned}
                </p>
              )}
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPct}
                aria-label={t.freeShippingProgress}
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
          </div>

          <div className="flex justify-between border-t border-border pt-4 text-[18px] font-semibold text-foreground">
            <span>{t.total}</span>
            <span>{formatCents(subtotal)}</span>
          </div>

          <Link
            href="/checkout"
            className="flex w-full items-center justify-center gap-3 rounded-[4px] bg-accent p-[15px] text-[17px] text-white transition-colors hover:bg-foreground"
          >
            {t.checkout}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/proionta"
            className="text-center text-[14px] text-muted transition-colors hover:text-foreground"
          >
            {t.continueShopping}
          </Link>
        </aside>
      </div>
    </div>
  )
}
