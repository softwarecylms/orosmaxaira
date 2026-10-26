'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { categoryLabel } from '@/components/shop/shop-content'
import type { SearchProduct } from '@/lib/medusa/shop'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

const MAX_RESULTS = 6

/** Lower-case + strip diacritics so "μελι" matches "Μέλι" (Greek tonos are
 *  combining marks removed by the NFD decomposition). */
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/** Relevance score (lower = better); 9 means "no match". Prefers title matches
 *  at the start, then at a word boundary, then anywhere, then category. */
function score(title: string, category: string, nq: string): number {
  const t = norm(title)
  if (t.startsWith(nq)) return 0
  if (t.includes(' ' + nq)) return 1
  if (t.includes(nq)) return 2
  if (norm(category).includes(nq)) return 3
  return 9
}

/** The shop's products (/api/search-products/), fetched once per visit — the
 *  first time a search box is used — and shared by the desktop and mobile boxes.
 *  A failed load is forgotten, so the next use tries again. */
let catalogue: Promise<SearchProduct[]> | null = null
function loadCatalogue(): Promise<SearchProduct[]> {
  catalogue ??= fetch('/api/search-products/')
    .then((r) => (r.ok ? (r.json() as Promise<{ products: SearchProduct[] }>) : Promise.reject(r.status)))
    .then((d) => d.products)
    .catch(() => {
      catalogue = null
      return []
    })
  return catalogue
}

/**
 * Header search box with a live product-results dropdown. Filters every listed
 * product in the shop (live from Medusa, see loadCatalogue) by title/category as
 * you type and links each hit to its product page. While empty it shows the
 * rotating placeholder hint.
 */
export function HeaderSearch({
  placeholders: SEARCH_PLACEHOLDERS,
  className,
}: {
  /** Rotating search-box hints (content key `site`). */
  placeholders: string[]
  className?: string
}) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('search')
  const [hint, setHint] = useState(0)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [products, setProducts] = useState<SearchProduct[] | null>(null)
  const rootRef = useRef<HTMLFormElement>(null)

  const load = () => {
    if (!products?.length) loadCatalogue().then(setProducts)
  }

  const q = query.trim()
  const showHint = q === ''

  // Rotating placeholder — only while the field is empty.
  useEffect(() => {
    if (q !== '') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setHint((p) => (p + 1) % SEARCH_PLACEHOLDERS.length), 3200)
    return () => clearInterval(id)
  }, [q])

  const results = useMemo(() => {
    if (q === '') return []
    const nq = norm(q)
    // Match against BOTH the Greek and English title/category so results appear
    // regardless of the language the visitor types in.
    return (products ?? [])
      .map((p) => {
        const s = Math.min(
          score(p.title, p.category, nq),
          score(p.titleEn, categoryLabel(p.category, 'en'), nq),
        )
        return { p, s }
      })
      .filter((x) => x.s < 9)
      .sort((a, b) => a.s - b.s) // stable sort keeps catalogue order within a tier
      .slice(0, MAX_RESULTS)
      .map((x) => x.p)
  }, [q, products])

  // Reset the keyboard highlight whenever the query changes.
  useEffect(() => setActive(0), [q])

  // Close + clear after navigating to a result (avoids interfering with the
  // Link click itself, which a synchronous onClick close would break).
  const pathname = usePathname()
  useEffect(() => {
    setOpen(false)
    setQuery('')
  }, [pathname])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  const hrefOf = (p: SearchProduct) => `/product/${locale === 'en' ? p.slugEn : p.handle}`

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const r = results[active] ?? results[0]
      if (r) {
        close()
        router.push(hrefOf(r))
      }
    }
  }

  // Nothing to show until the products are in (a moment, on the first use).
  const expanded = open && q !== '' && products !== null

  return (
    <form
      ref={rootRef}
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const r = results[active] ?? results[0]
        if (r) {
          close()
          router.push(hrefOf(r))
        }
      }}
      className={cn('relative', className)}
    >
      <div className="flex items-center overflow-hidden rounded-[4px] border border-cream">
        <input
          type="search"
          autoComplete="off"
          aria-label={t('label')}
          role="combobox"
          aria-expanded={expanded && results.length > 0}
          aria-controls="header-search-listbox"
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(e.target.value.trim() !== '')
            load()
          }}
          onFocus={() => {
            load()
            if (q !== '') setOpen(true)
          }}
          onKeyDown={onKeyDown}
          className="h-[46px] w-full bg-cream px-[22px] text-[17px] text-foreground outline-none placeholder:text-muted"
        />
        {showHint ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[22px] top-[23px] -translate-y-1/2 overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={hint}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: EASE.soft }}
                className="block whitespace-nowrap text-[17px] leading-none text-muted"
              >
                {SEARCH_PLACEHOLDERS[hint]}
              </motion.span>
            </AnimatePresence>
          </div>
        ) : null}
        <button
          type="submit"
          aria-label={t('submit')}
          className="flex size-[46px] shrink-0 items-center justify-center bg-cream text-foreground transition-colors hover:text-accent"
        >
          <Search className="size-5" />
        </button>
      </div>

      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: EASE.soft }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[8px] border border-border bg-white shadow-[0_18px_44px_-20px_rgba(35,31,32,0.35)]"
          >
            {results.length > 0 ? (
              <>
                <ul id="header-search-listbox" role="listbox" className="max-h-[62vh] overflow-y-auto py-1.5">
                  {results.map((p, idx) => {
                    const title = locale === 'en' ? p.titleEn : p.title
                    return (
                      <li key={p.handle} role="option" aria-selected={idx === active}>
                        <Link
                          href={hrefOf(p)}
                          onMouseEnter={() => setActive(idx)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 transition-colors',
                            idx === active ? 'bg-cream' : 'hover:bg-cream',
                          )}
                        >
                          <span className="relative size-11 shrink-0 overflow-hidden rounded-[4px] bg-offwhite">
                            {p.image ? (
                              <Image src={p.image} alt={title} fill sizes="44px" className="object-cover" />
                            ) : null}
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-[14px] font-medium leading-[18px] text-foreground">
                              {title}
                            </span>
                            <span className="text-[12px] text-muted">
                              {categoryLabel(p.category, locale)}
                            </span>
                          </span>
                          <span
                            className={cn(
                              'shrink-0 text-[13px]',
                              p.inStock ? 'text-accent' : 'text-muted',
                            )}
                          >
                            {p.inStock ? p.price : t('outOfStock')}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <Link
                  href="/proionta"
                  className="block border-t border-border px-4 py-3 text-center text-[14px] font-medium text-accent transition-colors hover:bg-cream"
                >
                  {t('allProducts')}
                </Link>
              </>
            ) : (
              <p className="px-4 py-6 text-center text-[15px] text-muted">
                {t('noResults', { query: q })}
              </p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  )
}
