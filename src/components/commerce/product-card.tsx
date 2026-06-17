import Link from 'next/link'
import Image from 'next/image'
import type { HttpTypes } from '@medusajs/types'
import { getCheapestPrice } from '@/lib/medusa/prices'

export function ProductCard({ product }: { product: HttpTypes.StoreProduct }) {
  const price = getCheapestPrice(product)
  const thumb = product.thumbnail ?? product.images?.[0]?.url ?? null

  return (
    <Link
      href={`/shop/${product.handle}`}
      className="group flex flex-col gap-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-card">
        {thumb ? (
          <Image
            src={thumb}
            alt={product.title ?? ''}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            No image
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold leading-tight">{product.title}</h3>
        {price ? (
          <span className="shrink-0 text-sm text-muted">{price.formatted}</span>
        ) : null}
      </div>
    </Link>
  )
}
