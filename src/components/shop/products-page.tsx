import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { listShopProducts } from '@/lib/medusa/shop'
import { ShopBrowser } from './shop-browser'
import { SHOP_PAGE, type ShopCategory } from './shop-content'

/**
 * Products page body — shared by /proionta (all) and /proionta/<slug> (a single
 * category). Products come from Medusa (falls back to the static snapshot); the
 * category, when present, pre-selects that filter in <ShopBrowser>.
 */
export async function ProductsPage({ category }: { category?: ShopCategory }) {
  const catalogue = await listShopProducts().catch(() => null)

  const crumbs: { label: string; href?: string }[] = category
    ? [{ label: 'Αρχική', href: '/' }, { label: 'Προϊόντα', href: '/proionta' }, { label: category }]
    : SHOP_PAGE.breadcrumb

  return (
    <>
      <div className="container-wide pb-6 pt-4">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1.5 text-[15px] text-muted md:text-[17px]"
        >
          {crumbs.map((b, i) => (
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

      <ShopBrowser products={catalogue?.products} initialCategory={category} />
    </>
  )
}
