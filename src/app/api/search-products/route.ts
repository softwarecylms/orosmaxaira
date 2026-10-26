import { NextResponse } from 'next/server'
import { listSearchProducts, type SearchProduct } from '@/lib/medusa/shop'
import { SHOP_PRODUCTS, handleOf } from '@/components/shop/shop-content'
import { PRODUCT_TITLE_EN } from '@/components/shop/product-i18n'
import { productSlug } from '@/components/shop/product-slugs'

/**
 * The header search's products: every listed product, read live from Medusa
 * (cached under the `products` tag), so a product published in the admin is
 * searchable as soon as it shows in the shop. The search box loads this once,
 * the first time it is used. If Medusa can't be reached, the site's built-in
 * snapshot — as the shop grid does.
 */
export async function GET() {
  const live = await listSearchProducts().catch(() => null)
  const products: SearchProduct[] =
    live ??
    SHOP_PRODUCTS.map((p) => ({
      handle: handleOf(p),
      slugEn: productSlug(handleOf(p), 'en'),
      title: p.title,
      titleEn: PRODUCT_TITLE_EN[handleOf(p)] ?? p.title,
      category: p.category,
      price: p.price,
      inStock: p.inStock,
      image: p.image,
    }))
  return NextResponse.json(
    { products },
    // A minute at the edge; the snapshot is never kept, so the live list returns with Medusa.
    { headers: { 'cache-control': live ? 'public, s-maxage=60, stale-while-revalidate=600' : 'no-store' } },
  )
}
