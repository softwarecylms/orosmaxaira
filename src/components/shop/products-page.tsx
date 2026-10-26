import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ChevronRight } from 'lucide-react'
import { listShopProducts } from '@/lib/medusa/shop'
import { ShopBrowser } from './shop-browser'
import {
  PARTNER_CATEGORY,
  categoryLabel,
  categoryPath,
  isPartnerCategory,
  type ShopCategory,
} from './shop-content'
import { getShopUi } from './shop-ui'
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/json-ld'

/**
 * Products page body — shared by /proionta (all) and /proionta/<slug> (a single
 * category). Products come from Medusa (falls back to the static snapshot); the
 * category, when present, pre-selects that filter in <ShopBrowser>, and `brand`
 * (a collection handle, from ?brand=) the brand filter.
 */
export async function ProductsPage({ category, brand }: { category?: ShopCategory; brand?: string }) {
  const locale = await getLocale()
  const ui = getShopUi(locale)
  const catalogue = await listShopProducts().catch(() => null)

  // A partner sub-category sits under the partner section: Προϊόντα › Συνεργαζόμενες μάρκες › Σπρέι.
  const trail: ShopCategory[] = !category
    ? []
    : isPartnerCategory(category) && category !== PARTNER_CATEGORY
      ? [PARTNER_CATEGORY, category]
      : [category]

  const crumbs: { label: string; href?: string }[] = [
    { label: ui.breadcrumb.home, href: '/' },
    category ? { label: ui.breadcrumb.products, href: '/proionta' } : { label: ui.breadcrumb.products },
    ...trail.map((c) => ({
      label: categoryLabel(c, locale),
      ...(c === category ? {} : { href: `/proionta/${categoryPath(c)}` }),
    })),
  ]

  const heading = category ? categoryLabel(category, locale) : ui.breadcrumb.products

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          [ui.breadcrumb.home, '/'],
          [ui.breadcrumb.products, '/proionta/'],
          ...trail.map((c): [string, string] => [categoryLabel(c, locale), `/proionta/${categoryPath(c)}/`]),
        ])}
      />
      {/* The design shows no page heading here; search engines and screen
          readers still get one. */}
      <h1 className="sr-only">{heading}</h1>
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

      <ShopBrowser products={catalogue?.products} initialCategory={category} initialBrand={brand} />
    </>
  )
}
