'use client'

import { useEffect, useState } from 'react'
import { toEuros, trackViewItem } from '@/lib/analytics'
import { klaviyoViewedProduct } from '@/lib/klaviyo-browser'
import type { ShopProduct, ShopProductDetail } from '../shop-content'
import { ProductGallery } from './product-gallery'
import { ProductPurchase, type AddonProduct } from './product-purchase'
import { RevealUp } from '@/components/home/reveal-up'

/** Couples the gallery and purchase panel so selecting a size variation swaps
 *  the gallery to that variant's photos (and vice-versa via thumbnails).
 *
 *  When the sizes have their own photos in Medusa (`detail.generalImages` set),
 *  the gallery is the selected size's photos followed by the product's general
 *  photos — and just the general ones while no size is selected. Otherwise the
 *  editorial gallery with one photo per size, as before. */
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
  const general = detail.generalImages
  const [size, setSize] = useState<string | null>(null)
  const selected = sizes.find((s) => s.label === size) ?? null

  const galleryFor = (pick: typeof selected) =>
    general
      ? [...new Set([...(pick?.images ?? []), ...(general.length ? general : [product.image])])]
      : // Products with variations lead the gallery with their main catalogue photo,
        // then the per-size shots; products without variations just use their gallery.
        sizes.length > 0
        ? [product.image, ...(detail.gallery ?? [])]
        : detail.gallery?.length
          ? detail.gallery
          : [product.image]
  const gallery = galleryFor(selected)

  const [active, setActive] = useState(gallery[0])

  // Google Analytics and Klaviyo: the product was looked at.
  useEffect(() => {
    trackViewItem({
      item_id: handle,
      item_name: product.title,
      price: toEuros(product.sortPrice),
      item_category: product.category,
    })
    klaviyoViewedProduct({
      handle,
      title: product.title,
      category: product.category,
      price: toEuros(product.sortPrice),
      image: product.image,
    })
  }, [handle, product.title, product.sortPrice, product.category, product.image])

  function onSelectSize(label: string | null) {
    setSize(label)
    const s = sizes.find((x) => x.label === label) ?? null
    if (general) setActive(galleryFor(s)[0])
    else if (s?.image) setActive(s.image)
  }

  // Reverse of onSelectSize: picking a gallery image that belongs to a variation
  // selects that variation too (so the size chips + price stay in sync).
  function onSelectImage(src: string) {
    setActive(src)
    const s = sizes.find((x) => (general ? x.images?.includes(src) : x.image === src))
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
          // The strip keeps its height while sizes switch between one and several photos.
          reserveStrip={!!general}
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
