'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react'
import {
  SHOP_CATEGORIES,
  SHOP_PAGE,
  SHOP_PRICE_MAX,
  SHOP_PRICE_MIN,
  SHOP_PRODUCTS,
  SHOP_SORTS,
  type ShopCategory,
  type ShopSort,
} from './shop-content'
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

export function ShopBrowser() {
  const [cats, setCats] = useState<Set<ShopCategory>>(new Set())
  const [priceMin, setPriceMin] = useState(SHOP_PRICE_MIN)
  const [priceMax, setPriceMax] = useState(SHOP_PRICE_MAX)
  const [sort, setSort] = useState<ShopSort>('default')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = SHOP_PRODUCTS.filter((p) => {
      if (cats.size > 0 && !cats.has(p.category)) return false
      const euros = p.sortPrice / 100
      return euros >= priceMin && euros <= priceMax
    })
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.sortPrice - b.sortPrice)
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.sortPrice - a.sortPrice)
    else if (sort === 'name-asc') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'el'))
    return list
  }, [cats, priceMin, priceMax, sort])

  // Reset the infinite-scroll window whenever the result set changes.
  useEffect(() => setVisible(PAGE_SIZE), [cats, priceMin, priceMax, sort])

  const shown = filtered.slice(0, visible)
  const hasMore = visible < filtered.length

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

  const clearAll = () => {
    setCats(new Set())
    setPriceMin(SHOP_PRICE_MIN)
    setPriceMax(SHOP_PRICE_MAX)
  }

  const dirty = cats.size > 0 || priceMin !== SHOP_PRICE_MIN || priceMax !== SHOP_PRICE_MAX

  const pctMin = ((priceMin - SHOP_PRICE_MIN) / (SHOP_PRICE_MAX - SHOP_PRICE_MIN)) * 100
  const pctMax = ((priceMax - SHOP_PRICE_MIN) / (SHOP_PRICE_MAX - SHOP_PRICE_MIN)) * 100

  const filterPanel = (
    <div className="flex flex-col gap-[30px] rounded-[4px] bg-white p-[25px]">
      {/* Category */}
      <div className="flex flex-col gap-[15px] border-b border-border pb-[30px]">
        <h3 className="text-[22px] font-medium leading-[26.4px] text-foreground">
          {SHOP_PAGE.filters.category}
        </h3>
        {SHOP_CATEGORIES.map((c) => (
          <label key={c} className="flex cursor-pointer items-center gap-2.5 py-0.5">
            <input
              type="checkbox"
              checked={cats.has(c)}
              onChange={() => toggleCat(c)}
              className="size-4 shrink-0 cursor-pointer rounded-[4px] border border-border accent-accent"
            />
            <span className="text-[14px] leading-[21px] text-foreground">{c}</span>
          </label>
        ))}
      </div>

      {/* Price */}
      <div className="flex flex-col gap-5">
        <h3 className="text-[22px] font-medium leading-[26.4px] text-foreground">
          {SHOP_PAGE.filters.price}
        </h3>
        <div className="price-range relative h-4">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground/20" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
          />
          <input
            type="range"
            min={SHOP_PRICE_MIN}
            max={SHOP_PRICE_MAX}
            value={priceMin}
            aria-label="Ελάχιστη τιμή"
            onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
            className="absolute inset-x-0 top-0 h-4 w-full"
          />
          <input
            type="range"
            min={SHOP_PRICE_MIN}
            max={SHOP_PRICE_MAX}
            value={priceMax}
            aria-label="Μέγιστη τιμή"
            onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
            className="absolute inset-x-0 top-0 h-4 w-full"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="min-w-[60px] rounded-[4px] border border-foreground p-2.5 text-[14px] text-foreground">
            €{priceMin}
          </span>
          <span className="min-w-[60px] rounded-[4px] border border-foreground p-2.5 text-right text-[14px] text-foreground">
            €{priceMax}
          </span>
        </div>
      </div>

      {dirty && (
        <button
          type="button"
          onClick={clearAll}
          className="self-start text-[14px] font-medium text-accent transition-colors hover:text-foreground"
        >
          {SHOP_PAGE.filters.clear}
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
            {filtersOpen ? 'Κλείσιμο φίλτρων' : 'Φίλτρα'}
          </button>

          <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>{filterPanel}</div>

          {/* Promo banner — desktop only */}
          <div className="mt-[30px] hidden overflow-hidden rounded-[4px] bg-accent lg:block">
            <div className="flex flex-col gap-[15px] px-[25px] pt-[30px]">
              <h3 className="text-[22px] font-medium leading-[26.4px] text-white">
                {SHOP_PAGE.banner.heading}
              </h3>
              <p className="text-[14px] leading-[21px] text-white">{SHOP_PAGE.banner.body}</p>
              <Link
                href={SHOP_PAGE.banner.cta.href}
                className="inline-flex items-center gap-3 self-start rounded-[4px] bg-white px-[15px] py-[13px] text-[17px] leading-[24px] text-accent transition-colors hover:bg-cream"
              >
                {SHOP_PAGE.banner.cta.label}
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
            <div className="relative mt-3 h-[200px] w-full">
              <Image
                src={SHOP_PAGE.banner.image}
                alt={SHOP_PAGE.banner.imageAlt}
                fill
                sizes="343px"
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* Find us — desktop only */}
          <div className="mt-[30px] hidden flex-col gap-4 lg:flex">
            <h3 className="text-[22px] font-medium leading-[26.4px] text-foreground">
              {SHOP_PAGE.findUs}
            </h3>
            <div className="flex items-center gap-2">
              {FOOTER.social.map((s) => {
                const Icon = SOCIAL_ICONS[s.name]
                return (
                  <Link
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="flex size-8 items-center justify-center text-foreground transition-colors hover:text-accent"
                  >
                    {Icon ? <Icon className="size-8" /> : null}
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
              {filtered.length} {filtered.length === 1 ? 'προϊόν' : 'προϊόντα'}
            </p>
            <label className="flex items-center gap-2 text-[14px] text-muted">
              <span className="sr-only">Ταξινόμηση</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ShopSort)}
                className="rounded-[4px] border border-border bg-white px-3 py-2 text-[14px] text-foreground outline-none focus:border-accent"
              >
                {SHOP_SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {shown.length === 0 ? (
            <p className="py-20 text-center text-[17px] text-muted">{SHOP_PAGE.filters.empty}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {shown.map((p) => (
                <RevealUp key={p.href} className="h-full">
                  <ShopProductCard product={p} />
                </RevealUp>
              ))}
            </div>
          )}

          {hasMore && (
            <div ref={sentinel} className="flex justify-center py-10" aria-hidden="true">
              <span className="size-6 animate-spin rounded-full border-2 border-border border-t-accent" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
