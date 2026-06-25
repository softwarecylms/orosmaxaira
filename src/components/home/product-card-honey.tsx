import Image from 'next/image'
import Link from 'next/link'
import type { HoneyProduct } from './home-content'
import { displayPrice } from '@/lib/utils'

/** Bespoke product card used in the Deal-of-the-Month row (Figma "Product w price"). */
export function ProductCardHoney({ product }: { product: HoneyProduct }) {
  return (
    <div className="group flex flex-col items-center gap-2.5 text-center">
      <Link
        href={product.href}
        className="relative block aspect-square w-full overflow-hidden rounded-[4px] bg-offwhite"
      >
        <Image
          src={product.image}
          alt={product.imageAlt ?? product.title}
          fill
          sizes="(min-width:1024px) 217px, (min-width:640px) 30vw, 45vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </Link>
      <Link
        href={`/shop?category=${encodeURIComponent(product.category)}`}
        className="text-[14px] leading-[21px] text-muted transition-colors hover:text-accent"
      >
        {product.category}
      </Link>
      <Link href={product.href} className="block">
        <h3 className="line-clamp-2 min-h-[48px] text-[17px] font-medium leading-[24px] text-foreground transition-colors group-hover:text-accent">
          {product.title}
        </h3>
      </Link>
      <p className="text-[14px] leading-[21px] text-accent">{displayPrice(product.price)}</p>
    </div>
  )
}
