'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import type { ShopProduct, ShopProductDetail, ShopVariationSize } from '../shop-content'
import { useCart, parsePrice } from '@/components/commerce/cart-store'
import { displayPrice, cn } from '@/lib/utils'
import { RevealGroup, RevealItem } from '@/components/home/reveal-up'
import {
  FacebookSolid,
  InstagramSolid,
  LinkedinSolid,
} from '@/components/layout/social-icons'

export type AddonProduct = {
  handle: string
  title: string
  image: string
  price: string
}

/** Right-hand purchase panel of the product page (Figma 239:1022). */
export function ProductPurchase({
  handle,
  product,
  detail,
  addons,
  size,
  selected,
  onSelectSize,
}: {
  handle: string
  product: ShopProduct
  detail: ShopProductDetail
  addons: AddonProduct[]
  size: string | null
  selected: ShopVariationSize | null
  onSelectSize: (label: string | null) => void
}) {
  const router = useRouter()
  const { addItem, flashDrawer } = useCart()
  const reduce = useReducedMotion()

  const sizes = detail.variations?.sizes ?? []
  const hasVariations = sizes.length > 0

  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const enabled = hasVariations ? selected !== null : product.inStock
  const cheapest = hasVariations
    ? sizes.reduce((a, b) => (b.sortPrice < a.sortPrice ? b : a))
    : null
  const phone = '+357 25622305'

  // Title price: the selected variant's price once chosen, else "Από €<min>"
  // for ranges/variations, else the single price.
  const priceText = selected
    ? selected.price
    : hasVariations
      ? `Από ${cheapest!.price}`
      : displayPrice(product.price)

  function buildItem() {
    if (hasVariations && selected) {
      return {
        handle,
        title: product.title,
        image: product.image,
        size: selected.label,
        container: selected.container,
        priceLabel: selected.price,
        unitPrice: selected.sortPrice,
      }
    }
    return {
      handle,
      title: product.title,
      image: product.image,
      priceLabel: displayPrice(product.price),
      unitPrice: product.sortPrice,
    }
  }

  function addToCart() {
    if (!enabled) return
    addItem(buildItem(), qty)
    flashDrawer()
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2500)
  }

  function buyNow() {
    if (!enabled) return
    addItem(buildItem(), qty)
    router.push('/checkout')
  }

  const loop = (keyframes: Record<string, number[]>) =>
    reduce
      ? undefined
      : { animate: keyframes, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }

  return (
    <RevealGroup className="flex flex-col gap-5 pt-1 lg:pt-5" stagger={0.06}>
      <RevealItem>
        <h1 className="font-display text-[28px] font-semibold leading-[1.06] text-foreground md:text-[41px] md:leading-[40px]">
          {product.title}
        </h1>
      </RevealItem>

      <RevealItem>
        <p className="text-[22px] font-medium leading-[26.4px] text-accent">{priceText}</p>
      </RevealItem>

      {detail.description ? (
        <RevealItem>
          <p className="max-w-[600px] text-[17px] leading-[24px] text-muted">
            {detail.description}
          </p>
        </RevealItem>
      ) : null}

      {/* Size variations */}
      {hasVariations ? (
        <RevealItem className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((s) => {
              const active = s.label === size
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => onSelectSize(active ? null : s.label)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-[4px] border bg-white px-[15px] py-[13px] text-[17px] leading-[24px] transition-colors',
                    active
                      ? 'border-accent text-accent'
                      : 'border-muted text-muted hover:border-foreground hover:text-foreground',
                  )}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
          {selected ? (
            <p className="flex items-center gap-2.5">
              {selected.container ? (
                <>
                  <span className="text-[17px] leading-[24px] text-muted">{selected.container}</span>
                  <span className="text-[17px] leading-[24px] text-muted">/</span>
                </>
              ) : null}
              <span className="text-[22px] font-medium leading-[26.4px] text-accent">
                {selected.price}
              </span>
            </p>
          ) : null}
        </RevealItem>
      ) : null}

      {/* Quantity + add to cart */}
      <RevealItem className="flex items-stretch gap-5">
        <div className="flex w-[104px] shrink-0 items-center justify-between rounded-[5px] border border-muted px-2">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Μείωση ποσότητας"
            className="flex size-7 items-center justify-center text-foreground transition-colors hover:text-accent"
          >
            <Minus className="size-3.5" strokeWidth={2} />
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
            aria-label="Ποσότητα"
            className="w-9 bg-transparent text-center text-[15px] font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Αύξηση ποσότητας"
            className="flex size-7 items-center justify-center text-foreground transition-colors hover:text-accent"
          >
            <Plus className="size-3.5" strokeWidth={2} />
          </button>
        </div>

        <button
          type="button"
          onClick={addToCart}
          disabled={!enabled}
          className={cn(
            'flex flex-1 items-center justify-center gap-3 rounded-[4px] border border-accent p-[15px] text-[17px] leading-[24px] text-accent transition-colors',
            enabled
              ? 'hover:border-foreground hover:bg-foreground hover:text-white'
              : 'cursor-not-allowed opacity-75',
          )}
        >
          {added ? (
            <Check className="size-[18px]" strokeWidth={2} aria-hidden="true" />
          ) : (
            <ShoppingCart className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
          )}
          {added ? 'Προστέθηκε' : 'Προσθήκη στο καλάθι'}
        </button>
      </RevealItem>

      {/* Buy now */}
      <RevealItem>
        <button
          type="button"
          onClick={buyNow}
          disabled={!enabled}
          className={cn(
            'flex w-full items-center justify-center gap-3 rounded-[4px] bg-accent p-[15px] text-[17px] leading-[24px] text-white transition-colors',
            enabled ? 'hover:bg-foreground' : 'cursor-not-allowed opacity-75',
          )}
        >
          Aγοράστε τώρα
        </button>
        {!enabled && hasVariations ? (
          <p className="mt-2 text-[14px] leading-[21px] text-muted">
            Επιλέξτε μέγεθος για να συνεχίσετε.
          </p>
        ) : null}
      </RevealItem>

      {/* Cross-sell */}
      {addons.length ? (
        <RevealItem className="flex flex-col gap-[15px]">
          <h2 className="text-[18px] font-semibold leading-[21.6px] text-foreground">
            🔥 Συνδυάστε το με
          </h2>
          <div className="rounded-[4px] border border-border px-5">
            {addons.map((a, i) => (
              <div
                key={a.handle}
                className={cn(
                  'flex items-center justify-between gap-4 py-[15px]',
                  i > 0 && 'border-t border-border',
                )}
              >
                <Link href={`/shop/${a.handle}`} className="group flex flex-1 items-center gap-2.5">
                  <span className="relative size-[59px] shrink-0 overflow-hidden rounded-[4px] bg-offwhite">
                    <Image src={a.image} alt={a.title} fill sizes="59px" className="object-cover" />
                  </span>
                  <span className="flex flex-col gap-[5px]">
                    <span className="text-[17px] font-medium leading-[24px] text-foreground transition-colors group-hover:text-accent">
                      {a.title}
                    </span>
                    <span className="text-[14px] leading-[21px] text-accent">
                      {displayPrice(a.price)}
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    addItem({
                      handle: a.handle,
                      title: a.title,
                      image: a.image,
                      priceLabel: displayPrice(a.price),
                      unitPrice: parsePrice(a.price),
                    })
                    flashDrawer()
                  }}
                  className="flex items-center gap-2 rounded-[4px] bg-accent px-[15px] py-2.5 text-[15px] leading-[20px] text-white transition-colors hover:bg-foreground"
                >
                  <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
                  Προσθήκη
                </button>
              </div>
            ))}
          </div>
        </RevealItem>
      ) : null}

      {/* Delivery keypoints — animated icons */}
      <RevealItem className="flex flex-col gap-4 border-y border-border-strong py-[15px] sm:flex-row sm:gap-6">
        <div className="flex flex-1 items-center gap-[15px]">
          <motion.span className="block shrink-0" initial={false} {...(loop({ x: [0, 4, 0] }) ?? {})}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icons/delivery-truck.svg" alt="" className="h-[15px] w-[26px]" />
          </motion.span>
          <span className="text-[14px] leading-[21px] text-muted">
            Παραδίδουμε σε Κύπρο &amp; Ελλάδα
          </span>
        </div>
        <div className="flex flex-1 items-center gap-[15px]">
          <motion.span className="block shrink-0" initial={false} {...(loop({ y: [0, -3, 0] }) ?? {})}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icons/free-shipping.svg" alt="" className="h-[24px] w-[26px]" />
          </motion.span>
          <span className="text-[14px] leading-[21px] text-muted">
            Δωρεάν μεταφορικά για άνω των 70€
          </span>
        </div>
      </RevealItem>

      {/* Help box */}
      <RevealItem className="flex flex-col gap-2 rounded-[4px] bg-cream p-6 sm:flex-row sm:items-center sm:justify-between sm:p-[35px]">
        <p className="text-[22px] font-medium leading-[26.4px] text-foreground">Χρειάζεστε βοήθεια;</p>
        <p className="text-[17px] leading-[24px]">
          <span className="text-muted">Καλέστε μας στο </span>
          <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-accent hover:underline">
            {phone}
          </a>
        </p>
      </RevealItem>

      {/* Share */}
      <RevealItem className="flex items-center justify-between gap-4">
        <span className="text-[18px] font-semibold text-foreground">Κοινοποίηση σε:</span>
        <div className="flex items-center gap-1.5">
          {[FacebookSolid, InstagramSolid, LinkedinSolid].map((Icon, i) => (
            <a
              key={i}
              href="#"
              aria-label="Κοινοποίηση"
              className="flex size-8 items-center justify-center text-foreground transition-colors hover:text-accent"
            >
              <Icon className="size-7" />
            </a>
          ))}
        </div>
      </RevealItem>
    </RevealGroup>
  )
}
