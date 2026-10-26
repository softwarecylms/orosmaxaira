'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react'
import {
  OWN_BRAND,
  OWN_CATEGORIES,
  PARTNER_CATEGORY,
  PARTNER_SUBCATEGORIES,
  SHOP_CATEGORIES,
  SHOP_PRICE_MAX,
  SHOP_PRICE_MIN,
  SHOP_PRODUCTS,
  SHOP_SORTS,
  brandLabel,
  brandOf,
  categoryLabel,
  isPartnerCategory,
  productPriceRangeCents,
  proiontaHref,
  type ShopBrand,
  type ShopCategory,
  type ShopProduct,
  type ShopSort,
} from './shop-content'
import { getShopUi } from './shop-ui'
import { ShopProductCard } from './shop-product-card'
import { RevealUp } from '@/components/home/reveal-up'
import { FOOTER } from '@/components/home/home-content'
import {
  FacebookSolid,
  InstagramSolid,
  YoutubeSolid,
  PinterestSolid,
  LinkedinSolid,
} from '@/components/layout/social-icons'

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook: FacebookSolid,
  Instagram: InstagramSolid,
  YouTube: YoutubeSolid,
  Pinterest: PinterestSolid,
  LinkedIn: LinkedinSolid,
}

const PAGE_SIZE = 12
const PAGE_STEP = 8

// Default catalogue order: honey (Μέλι) first, then bee products (Προϊόντα Μέλισσας)
// with Υδρόμελο + bee pollen (Γύρη Μελισσών) leading, then cosmetics, gift sets and
// accessories, then the partner brands' categories (SHOP_CATEGORIES order).
// Stable sort keeps each group's existing relative order.
function defaultOrderRank(p: ShopProduct): number {
  const rank = SHOP_CATEGORIES.indexOf(p.category)
  const cat = rank < 0 ? SHOP_CATEGORIES.length : rank
  const lead =
    p.category === 'Προϊόντα Μέλισσας' &&
    (p.title === 'Υδρόμελο' || p.title.startsWith('Γύρη Μελισσών'))
      ? 0
      : 1
  return cat * 10 + lead
}

export function ShopBrowser({
  products = SHOP_PRODUCTS,
  priceBounds = [SHOP_PRICE_MIN, SHOP_PRICE_MAX],
  initialCategory,
  initialBrand,
}: {
  products?: ShopProduct[]
  /** The price slider's ends in whole euros — the live catalogue's cheapest and
   *  dearest product. The snapshot's own range is only for the offline fallback:
   *  applied to the live shop it hid everything priced outside it. */
  priceBounds?: [number, number]
  /** Pre-selected category from the /proionta/<slug> route. */
  initialCategory?: ShopCategory
  /** Pre-selected brand (its collection handle) from ?brand=. */
  initialBrand?: string
} = {}) {
  const [boundMin, boundMax] = priceBounds
  const locale = useLocale()
  const ui = getShopUi(locale)
  // Όρος Μαχαιρά's products and the partner brands' are browsed apart: a category
  // page shows its own side only (the partner section's page all of its side);
  // /proionta shows both, the partners in their own block.
  const scope: 'all' | 'own' | 'partners' = !initialCategory
    ? 'all'
    : isPartnerCategory(initialCategory)
      ? 'partners'
      : 'own'
  const scoped = useMemo(
    () => (scope === 'all' ? products : products.filter((p) => (scope === 'partners') === isPartnerCategory(p.category))),
    [products, scope],
  )

  // The category comes from the URL path (/proionta/<slug>), the brand from
  // ?brand=; keep the filters in sync when navigating between category pages.
  const startCats = (): Set<ShopCategory> =>
    initialCategory && initialCategory !== PARTNER_CATEGORY ? new Set([initialCategory]) : new Set()
  const startBrands = (): Set<string> => new Set(initialBrand ? [initialBrand] : [])
  const [cats, setCats] = useState(startCats)
  const [brands, setBrands] = useState(startBrands)
  useEffect(() => {
    setCats(startCats())
    setBrands(startBrands())
  }, [initialCategory, initialBrand])

  const [priceMin, setPriceMin] = useState(boundMin)
  const [priceMax, setPriceMax] = useState(boundMax)
  // A product priced beyond the old ends (a new one in the admin) widens the range.
  useEffect(() => {
    setPriceMin(boundMin)
    setPriceMax(boundMax)
  }, [boundMin, boundMax])
  // Editable text mirrors of the price bounds: free typing, clamped on commit.
  const [minText, setMinText] = useState(String(boundMin))
  const [maxText, setMaxText] = useState(String(boundMax))
  useEffect(() => setMinText(String(priceMin)), [priceMin])
  useEffect(() => setMaxText(String(priceMax)), [priceMax])
  const commitMin = () => {
    const v = Math.round(Number(minText))
    const clamped = Number.isFinite(v) ? Math.min(Math.max(v, boundMin), priceMax) : priceMin
    setPriceMin(clamped)
    setMinText(String(clamped))
  }
  const commitMax = () => {
    const v = Math.round(Number(maxText))
    const clamped = Number.isFinite(v) ? Math.max(Math.min(v, boundMax), priceMin) : priceMax
    setPriceMax(clamped)
    setMaxText(String(clamped))
  }
  const [sort, setSort] = useState<ShopSort>('default')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Every maker in the shop — Όρος Μαχαιρά first, then the partners A–Z — on
  // every page. Picking one from the other side of the shop (Όρος Μαχαιρά on a
  // partner page, a partner on one of Όρος Μαχαιρά's) opens the list to the whole shop.
  const brandOptions = useMemo(() => {
    const found = new Map<string, ShopBrand>()
    for (const p of products) if (p.inStock) found.set(brandOf(p).handle, brandOf(p))
    return [...found.values()].sort((a, b) =>
      a.handle === OWN_BRAND.handle ? -1 : b.handle === OWN_BRAND.handle ? 1 : a.name.localeCompare(b.name),
    )
  }, [products])
  const base = useMemo(() => {
    const here = new Set(scoped.map((p) => brandOf(p).handle))
    return [...brands].some((b) => !here.has(b)) ? products : scoped
  }, [products, scoped, brands])

  // Only categories that have something to show (a new category may hold only
  // hidden products for a while), Όρος Μαχαιρά's apart from the partner brands'.
  const categoryGroups = useMemo(() => {
    const listed = (list: ShopCategory[]) => list.filter((c) => base.some((p) => p.inStock && p.category === c))
    return [
      { title: brandLabel(OWN_BRAND, locale), items: listed(OWN_CATEGORIES) },
      { title: categoryLabel(PARTNER_CATEGORY, locale), items: listed(PARTNER_SUBCATEGORIES) },
    ].filter((g) => g.items.length > 0)
  }, [base, locale])

  const filtered = useMemo(() => {
    let list = base.filter((p) => {
      if (!p.inStock) return false // hide out-of-stock products
      if (cats.size > 0 && !cats.has(p.category)) return false
      if (brands.size > 0 && !brands.has(brandOf(p).handle)) return false
      // Keep a product when its variant price range overlaps the selected range,
      // so it isn't hidden just because its cheapest size is below priceMin.
      const [minCents, maxCents] = productPriceRangeCents(p)
      return minCents / 100 <= priceMax && maxCents / 100 >= priceMin
    })
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.sortPrice - b.sortPrice)
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.sortPrice - a.sortPrice)
    else if (sort === 'name-asc') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'el'))
    else list = [...list].sort((a, b) => defaultOrderRank(a) - defaultOrderRank(b)) // 'default'
    return list
  }, [base, cats, brands, priceMin, priceMax, sort])

  // Reset the infinite-scroll window whenever the result set changes.
  useEffect(() => setVisible(PAGE_SIZE), [cats, brands, priceMin, priceMax, sort])

  // On /proionta with no category or brand picked, other makers' products leave
  // the main grid for their own block below it; picking one shows them as usual.
  const apart = scope === 'all' && cats.size === 0 && brands.size === 0
  const main = apart ? filtered.filter((p) => !isPartnerCategory(p.category)) : filtered
  const partners = apart ? filtered.filter((p) => isPartnerCategory(p.category)) : []

  const shown = main.slice(0, visible)
  const hasMore = visible < main.length

  // Infinite scroll: grow the window as the sentinel enters view.
  const sentinel = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!hasMore) return
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible((v) => v + PAGE_STEP)
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, shown.length])

  const toggleCat = (c: ShopCategory) =>
    setCats((prev) => {
      const next = new Set(prev)
      next.has(c) ? next.delete(c) : next.add(c)
      return next
    })

  const toggleBrand = (handle: string) => {
    const next = new Set(brands)
    next.has(handle) ? next.delete(handle) : next.add(handle)
    setBrands(next)
    // A picked category that none of the picked brands make would leave nothing to show.
    if (next.size > 0)
      setCats((prev) => new Set([...prev].filter((c) => products.some((p) => p.category === c && next.has(brandOf(p).handle)))))
  }

  const clearAll = () => {
    setCats(new Set())
    setBrands(new Set())
    setPriceMin(boundMin)
    setPriceMax(boundMax)
  }

  const dirty =
    cats.size > 0 || brands.size > 0 || priceMin !== boundMin || priceMax !== boundMax

  const pctMin = ((priceMin - boundMin) / (boundMax - boundMin)) * 100
  const pctMax = ((priceMax - boundMin) / (boundMax - boundMin)) * 100

  const filterPanel = (
    <div className="flex flex-col gap-[30px] rounded-[4px] bg-white p-[25px]">
      {/* Category */}
      <div className="flex flex-col gap-[15px] border-b border-border pb-[30px]">
        <h3 className="text-[22px] font-medium leading-[26.4px] text-foreground">
          {ui.filters.category}
        </h3>
        {categoryGroups.map((group) => (
          <div
            key={group.title}
            role={categoryGroups.length > 1 ? 'group' : undefined}
            aria-label={categoryGroups.length > 1 ? group.title : undefined}
            className="flex flex-col gap-[15px]"
          >
            {categoryGroups.length > 1 ? (
              <span className="text-[12px] font-bold uppercase leading-[18px] tracking-[0.08em] text-gold-strong">
                {group.title}
              </span>
            ) : null}
            {group.items.map((c) => (
              <label key={c} className="flex cursor-pointer items-center gap-2.5 py-0.5">
                <input
                  type="checkbox"
                  checked={cats.has(c)}
                  onChange={() => toggleCat(c)}
                  className="size-4 shrink-0 cursor-pointer rounded-[4px] border border-border accent-accent"
                />
                <span className="text-[14px] leading-[21px] text-foreground">
                  {categoryLabel(c, locale)}
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>

      {/* Brand — when there is more than one maker to choose from */}
      {brandOptions.length > 1 ? (
        <div className="flex flex-col gap-[15px] border-b border-border pb-[30px]">
          <h3 className="text-[22px] font-medium leading-[26.4px] text-foreground">
            {ui.filters.brand}
          </h3>
          {brandOptions.map((b) => (
            <label key={b.handle} className="flex cursor-pointer items-center gap-2.5 py-0.5">
              <input
                type="checkbox"
                checked={brands.has(b.handle)}
                onChange={() => toggleBrand(b.handle)}
                className="size-4 shrink-0 cursor-pointer rounded-[4px] border border-border accent-accent"
              />
              <span className="text-[14px] leading-[21px] text-foreground">{brandLabel(b, locale)}</span>
            </label>
          ))}
        </div>
      ) : null}

      {/* Price */}
      <div className="flex flex-col gap-5">
        <h3 className="text-[22px] font-medium leading-[26.4px] text-foreground">
          {ui.filters.price}
        </h3>
        <div className="price-range relative h-4">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground/20" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
          />
          <input
            type="range"
            min={boundMin}
            max={boundMax}
            value={priceMin}
            aria-label={ui.filters.minAria}
            onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
            className="absolute inset-x-0 top-0 h-4 w-full"
          />
          <input
            type="range"
            min={boundMin}
            max={boundMax}
            value={priceMax}
            aria-label={ui.filters.maxAria}
            onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
            className="absolute inset-x-0 top-0 h-4 w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex min-w-[72px] flex-1 items-center gap-1 rounded-[4px] border border-foreground px-2.5 py-2 text-[14px] text-foreground focus-within:ring-1 focus-within:ring-accent">
            <span aria-hidden="true">€</span>
            <input
              type="text"
              inputMode="numeric"
              value={minText}
              aria-label={ui.filters.minAria}
              onChange={(e) => setMinText(e.target.value)}
              onBlur={commitMin}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
              }}
              className="w-full min-w-0 bg-transparent outline-none"
            />
          </label>
          <label className="flex min-w-[72px] flex-1 items-center gap-1 rounded-[4px] border border-foreground px-2.5 py-2 text-[14px] text-foreground focus-within:ring-1 focus-within:ring-accent">
            <span aria-hidden="true">€</span>
            <input
              type="text"
              inputMode="numeric"
              value={maxText}
              aria-label={ui.filters.maxAria}
              onChange={(e) => setMaxText(e.target.value)}
              onBlur={commitMax}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
              }}
              className="w-full min-w-0 bg-transparent text-right outline-none"
            />
          </label>
        </div>
      </div>

      {dirty && (
        <button
          type="button"
          onClick={clearAll}
          className="self-start text-[14px] font-medium text-accent transition-colors hover:text-foreground"
        >
          {ui.filters.clear}
        </button>
      )}
    </div>
  )

  return (
    <section data-testid="shop-browser" className="bg-offwhite py-10 md:py-[60px] lg:py-[80px]">
      <div className="container-wide flex flex-col gap-9 lg:flex-row lg:items-start">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-[343px]">
          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-[4px] border border-border bg-white px-4 py-3 text-[15px] font-medium text-foreground lg:hidden"
          >
            {filtersOpen ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
            {filtersOpen ? ui.filtersToggle.close : ui.filtersToggle.open}
          </button>

          <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>{filterPanel}</div>

          {/* Promo banner — desktop only */}
          <div className="mt-[30px] hidden overflow-hidden rounded-[4px] bg-accent lg:block">
            <div className="flex flex-col gap-[15px] px-[25px] pt-[30px]">
              <h3 className="text-[22px] font-medium leading-[26.4px] text-white">
                {ui.banner.heading}
              </h3>
              <p className="text-[14px] leading-[21px] text-white">{ui.banner.body}</p>
              <Link
                href={ui.banner.cta.href}
                className="inline-flex items-center gap-3 self-start rounded-[4px] bg-white px-[15px] py-[13px] text-[17px] leading-[24px] text-accent transition-colors hover:bg-cream"
              >
                {ui.banner.cta.label}
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
            <div className="relative mt-3 h-[265px] w-full">
              <Image
                src={ui.banner.image}
                alt={ui.banner.imageAlt}
                fill
                sizes="343px"
                className="-scale-x-100 object-cover object-bottom"
              />
            </div>
          </div>

          {/* Follow us — social links, desktop only */}
          <div className="mt-[30px] hidden flex-wrap items-center gap-x-3 gap-y-2 lg:flex">
            <h3 className="text-[15px] font-medium leading-[22px] text-foreground">
              {ui.findUs}
            </h3>
            <div className="flex items-center gap-1.5">
              {FOOTER.social.map((s) => {
                const Icon = SOCIAL_ICONS[s.name]
                return (
                  <Link
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="flex size-7 items-center justify-center text-foreground transition-colors hover:text-accent"
                  >
                    {Icon ? <Icon className="size-7" /> : null}
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Grid column */}
        <div className="min-w-0 flex-1 lg:border-l lg:border-border lg:pl-9">
          {/* Toolbar */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-muted" aria-live="polite">
              {ui.count(filtered.length)}
            </p>
            <label className="flex items-center gap-2 text-[14px] text-muted">
              <span className="sr-only">{ui.sortAria}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ShopSort)}
                className="rounded-[4px] border border-border bg-white px-3 py-2 text-[14px] text-foreground outline-none focus:border-accent"
              >
                {SHOP_SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {ui.sortLabel(s.value)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {shown.length === 0 ? (
            <p className="py-20 text-center text-[17px] text-muted">{ui.filters.empty}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 2xl:grid-cols-4">
              {shown.map((p) => (
                <RevealUp key={p.href} className="h-full">
                  <ShopProductCard product={p} shortCta />
                </RevealUp>
              ))}
            </div>
          )}

          {hasMore && (
            <div ref={sentinel} className="flex justify-center py-10" aria-hidden="true">
              <span className="size-6 animate-spin rounded-full border-2 border-border border-t-accent" />
            </div>
          )}

          {partners.length > 0 && !hasMore ? (
            <div className="mt-14 border-t border-border pt-10 md:mt-16">
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-display text-[28px] leading-[1.15] text-foreground md:text-[34px]">
                    {categoryLabel(PARTNER_CATEGORY, locale)}
                  </h2>
                  <p className="text-[15px] text-muted">{ui.partners.body}</p>
                </div>
                <Link
                  href={proiontaHref(PARTNER_CATEGORY)}
                  className="inline-flex items-center gap-2 self-start text-[15px] font-medium text-accent transition-colors hover:text-foreground sm:self-auto"
                >
                  {ui.partners.all}
                  <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 2xl:grid-cols-4">
                {partners.map((p) => (
                  <RevealUp key={p.href} className="h-full">
                    <ShopProductCard product={p} shortCta />
                  </RevealUp>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
