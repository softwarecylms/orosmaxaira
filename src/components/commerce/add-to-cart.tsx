'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import type { HttpTypes } from '@medusajs/types'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/lib/medusa/actions'
import { cn } from '@/lib/utils'

export function AddToCart({ product }: { product: HttpTypes.StoreProduct }) {
  const router = useRouter()
  const options = product.options ?? []
  const variants = product.variants ?? []

  const [selected, setSelected] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Resolve the variant whose option values match the current selection.
  const variant = useMemo(() => {
    if (variants.length === 1 && options.length === 0) return variants[0]
    if (!options.length) return variants[0]
    return variants.find((v) =>
      (v.options ?? []).every((o) => selected[o.option_id ?? ''] === o.value),
    )
  }, [variants, options, selected])

  const allChosen = options.every((o) => selected[o.id])

  function choose(optionId: string, value: string) {
    setAdded(false)
    setError(null)
    setSelected((prev) => ({ ...prev, [optionId]: value }))
  }

  function handleAdd() {
    if (!variant) return
    startTransition(async () => {
      setError(null)
      try {
        await addToCart(variant.id, 1)
        setAdded(true)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not add to cart.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {options.map((option) => (
        <div key={option.id} className="flex flex-col gap-2">
          <span className="text-sm font-medium">{option.title}</span>
          <div className="flex flex-wrap gap-2">
            {(option.values ?? []).map((v) => {
              const active = selected[option.id] === v.value
              return (
                <button
                  key={v.id ?? v.value}
                  type="button"
                  onClick={() => choose(option.id, v.value!)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm transition-colors',
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-foreground hover:border-border-strong',
                  )}
                >
                  {v.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          onClick={handleAdd}
          disabled={pending || !variant || !allChosen}
          className="w-full sm:w-auto"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Adding…
            </>
          ) : added ? (
            <>
              <Check className="size-4" /> Added to cart
            </>
          ) : !allChosen ? (
            'Select options'
          ) : (
            'Add to cart'
          )}
        </Button>

        {added ? (
          <Link href="/cart" className="text-sm font-medium underline">
            View cart →
          </Link>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  )
}
