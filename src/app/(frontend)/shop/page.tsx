import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { SHOP_PAGE } from '@/components/shop/shop-content'
import { ShopBrowser } from '@/components/shop/shop-browser'
import { listShopProducts } from '@/lib/medusa/shop'

export const metadata: Metadata = {
  title: 'Προϊόντα',
  description: 'Όλα τα προϊόντα Όρος Μαχαιρά — αγνό μέλι, προϊόντα μέλισσας, φυσικά καλλυντικά και πακέτα δώρων.',
}

/** Shop / products listing (Figma 209:4095). Header + footer come from the
 *  shared layout; the filterable, infinite-scrolling grid is <ShopBrowser>.
 *  Products come from Medusa (source of truth); falls back to the static
 *  snapshot if Medusa is unreachable. */
export default async function ShopPage() {
  const catalogue = await listShopProducts().catch(() => null)

  return (
    <>
      {/* Breadcrumb */}
      <div className="container-wide pb-6 pt-4">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1.5 text-[15px] text-muted md:text-[17px]"
        >
          {SHOP_PAGE.breadcrumb.map((b, i) => (
            <span key={b.label} className="flex items-center gap-1.5">
              {i > 0 ? <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" /> : null}
              {b.href ? (
                <Link href={b.href} className="transition-colors hover:text-accent">
                  {b.label}
                </Link>
              ) : (
                <span className="text-foreground">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <Suspense fallback={<div className="container-wide min-h-[60vh]" aria-hidden="true" />}>
        <ShopBrowser products={catalogue?.products} />
      </Suspense>
    </>
  )
}
