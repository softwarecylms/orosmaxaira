'use client'

import Image from 'next/image'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { HttpTypes } from '@medusajs/types'
import { removeLineItem, updateLineItem } from '@/lib/medusa/actions'
import { formatPrice } from '@/lib/medusa/prices'
import { cn } from '@/lib/utils'

export function CartLineItem({
  item,
  currencyCode,
}: {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function setQty(quantity: number) {
    startTransition(async () => {
      await updateLineItem(item.id, quantity)
      router.refresh()
    })
  }

  function remove() {
    startTransition(async () => {
      await removeLineItem(item.id)
      router.refresh()
    })
  }

  const lineTotal = item.total ?? (item.unit_price ?? 0) * item.quantity

  return (
    <div
      className={cn(
        'flex gap-4 py-5 transition-opacity',
        pending && 'opacity-50',
      )}
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-card">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.product_title ?? item.title ?? ''}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">
              {item.product_title ?? item.title}
            </p>
            {item.variant_title ? (
              <p className="text-xs text-muted">{item.variant_title}</p>
            ) : null}
          </div>
          <p className="text-sm font-semibold">
            {formatPrice(lineTotal, currencyCode)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="inline-flex items-center rounded-full border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty(item.quantity - 1)}
              disabled={pending || item.quantity <= 1}
              className="grid size-8 place-items-center rounded-full hover:bg-foreground/5 disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty(item.quantity + 1)}
              disabled={pending}
              className="grid size-8 place-items-center rounded-full hover:bg-foreground/5 disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground"
          >
            <Trash2 className="size-3.5" /> Remove
          </button>
        </div>
      </div>
    </div>
  )
}
