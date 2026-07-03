'use client'

import { useState } from 'react'
import type { ShopProduct, ShopProductDetail } from '../shop-content'
import { ProductGallery } from './product-gallery'
import { ProductPurchase, type AddonProduct } from './product-purchase'
import { RevealUp } from '@/components/home/reveal-up'

/** Couples the gallery and purchase panel so selecting a size variation swaps
 *  the gallery image to that variant's photo (and vice-versa via thumbnails). */
export function ProductView({
  handle,
  product,
  detail,
  addons,
}: {
  handle: string
  product: ShopProduct
  detail: ShopProductDetail
  addons: AddonProduct[]
}) {
  const sizes = detail.variations?.sizes ?? []
  // Products with variations lead the gallery with their main catalogue photo,
  // then the per-size shots; products without variations just use their gallery.
  const gallery =
    sizes.length > 0
      ? [product.image, ...(detail.gallery ?? [])]
      : detail.gallery?.length
        ? detail.gallery
        : [product.image]

  const [size, setSize] = useState<string | null>(null)
  const [active, setActive] = useState(gallery[0])

  const selected = sizes.find((s) => s.label === size) ?? null

  function onSelectSize(label: string | null) {
    setSize(label)
    const s = sizes.find((x) => x.label === label)
    if (s?.image) setActive(s.image)
  }

  // Reverse of onSelectSize: picking a gallery image that belongs to a variation
  // selects that variation too (so the size chips + price stay in sync).
  function onSelectImage(src: string) {
    setActive(src)
    const s = sizes.find((x) => x.image === src)
    if (s) setSize(s.label)
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-[60px]">
      <RevealUp>
        <ProductGallery
          images={gallery}
          active={active}
          onSelect={onSelectImage}
          alt={product.imageAlt}
        />
      </RevealUp>
      <ProductPurchase
        handle={handle}
        product={product}
        detail={detail}
        addons={addons}
        size={size}
        selected={selected}
        onSelectSize={onSelectSize}
      />
    </div>
  )
}
