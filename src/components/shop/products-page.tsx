import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ChevronRight } from 'lucide-react'
import { listShopProducts } from '@/lib/medusa/shop'
import { ShopBrowser } from './shop-browser'
import { categoryLabel, type ShopCategory } from './shop-content'
import { getShopUi } from './shop-ui'
import { CATEGORY_SLUGS } from './shop-content'
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/json-ld'

/**
 * Products page body — shared by /proionta (all) and /proionta/<slug> (a single
 * category). Products come from Medusa (falls back to the static snapshot); the
 * category, when present, pre-selects that filter in <ShopBrowser>.
 */
export async function ProductsPage({ category }: { category?: ShopCategory }) {
  const locale = await getLocale()
  const ui = getShopUi(locale)
  const catalogue = await listShopProducts().catch(() => null)

  const crumbs: { label: string; href?: string }[] = category
    ? [
        { label: ui.breadcrumb.home, href: '/' },
        { label: ui.breadcrumb.products, href: '/proionta' },
        { label: categoryLabel(category, locale) },
      ]
    : [{ label: ui.breadcrumb.home, href: '/' }, { label: ui.breadcrumb.products }]

  const heading = category ? categoryLabel(category, locale) : ui.breadcrumb.products

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          locale,
          category
            ? [
                [ui.breadcrumb.home, '/'],
                [ui.breadcrumb.products, '/proionta/'],
                [heading, `/proionta/${CATEGORY_SLUGS[category]}/`],
              ]
            : [[ui.breadcrumb.home, '/'], [ui.breadcrumb.products, '/proionta/']],
        )}
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

      <ShopBrowser products={catalogue?.products} initialCategory={category} />
    </>
  )
}
