import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import type { ShopProduct } from './shop-content'
import { SHOP_PAGE, handleOf } from './shop-content'
import { displayPrice } from '@/lib/utils'

/**
 * Shop product card (Figma 209:4451 "Item"). Image, category, title, gold price
 * and a full-width add-to-cart button. Products are a static snapshot of the
 * live store, so the card + button link out to the real product page.
 */
export function ShopProductCard({ product }: { product: ShopProduct }) {
  const href = `/shop/${handleOf(product)}`

  return (
    <article
      data-testid="shop-card"
      className="group flex h-full flex-col gap-3 rounded-[4px] bg-white p-[15px]"
    >
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-[4px] bg-offwhite"
      >
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(min-width:1280px) 280px, (min-width:768px) 30vw, 45vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
        {!product.inStock && (
          <span className="absolute left-2.5 top-2.5 rounded-[3px] bg-foreground/85 px-2.5 py-1 text-[12px] font-medium leading-none text-white">
            Εξαντλήθηκε
          </span>
        )}
      </Link>

      <p className="text-[14px] leading-[21px] text-[#555]">{product.category}</p>

      <Link href={href} className="block">
        <h3 className="line-clamp-2 min-h-[48px] text-[17px] font-medium leading-[24px] text-foreground transition-colors group-hover:text-accent">
          {product.title}
        </h3>
      </Link>

      <p className="text-[16px] leading-[24px] text-accent">{displayPrice(product.price)}</p>

      <Link
        href={href}
        className="mt-auto flex items-center justify-center gap-2 rounded-[4px] bg-accent px-3 py-2.5 text-center text-[13px] leading-[20px] text-white transition-colors hover:bg-foreground sm:gap-3 sm:p-[15px] sm:text-[17px] sm:leading-[24px]"
      >
        <ShoppingCart className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
        {SHOP_PAGE.addToCart}
      </Link>
    </article>
  )
}
