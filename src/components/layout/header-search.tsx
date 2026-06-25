'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { SEARCH_PLACEHOLDERS } from '@/components/home/home-content'
import { SHOP_PRODUCTS, handleOf } from '@/components/shop/shop-content'
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

/**
 * Header search box with a live product-results dropdown. Filters the static
 * catalogue (`SHOP_PRODUCTS`) by title/category as you type and links each hit
 * to its product page. While empty it shows the rotating placeholder hint.
 */
export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter()
  const [hint, setHint] = useState(0)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLFormElement>(null)

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
    return SHOP_PRODUCTS.map((p) => ({ p, s: score(p.title, p.category, nq) }))
      .filter((x) => x.s < 9)
      .sort((a, b) => a.s - b.s) // stable sort keeps catalogue order within a tier
      .slice(0, MAX_RESULTS)
      .map((x) => x.p)
  }, [q])

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
        router.push(`/shop/${handleOf(r)}`)
      }
    }
  }

  const expanded = open && q !== ''

  return (
    <form
      ref={rootRef}
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const r = results[active] ?? results[0]
        if (r) {
          close()
          router.push(`/shop/${handleOf(r)}`)
        }
      }}
      className={cn('relative', className)}
    >
      <div className="flex items-center overflow-hidden rounded-[4px] border border-cream">
        <input
          type="search"
          autoComplete="off"
          aria-label="Αναζήτηση προϊόντων"
          role="combobox"
          aria-expanded={expanded && results.length > 0}
          aria-controls="header-search-listbox"
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(e.target.value.trim() !== '')
          }}
          onFocus={() => {
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
          aria-label="Αναζήτηση"
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
                    const handle = handleOf(p)
                    return (
                      <li key={handle} role="option" aria-selected={idx === active}>
                        <Link
                          href={`/shop/${handle}`}
                          onMouseEnter={() => setActive(idx)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 transition-colors',
                            idx === active ? 'bg-cream' : 'hover:bg-cream',
                          )}
                        >
                          <span className="relative size-11 shrink-0 overflow-hidden rounded-[4px] bg-offwhite">
                            <Image src={p.image} alt={p.imageAlt} fill sizes="44px" className="object-cover" />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-[14px] font-medium leading-[18px] text-foreground">
                              {p.title}
                            </span>
                            <span className="text-[12px] text-muted">{p.category}</span>
                          </span>
                          <span
                            className={cn(
                              'shrink-0 text-[13px]',
                              p.inStock ? 'text-accent' : 'text-muted',
                            )}
                          >
                            {p.inStock ? p.price : 'Εξαντλήθηκε'}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <Link
                  href="/shop"
                  className="block border-t border-border px-4 py-3 text-center text-[14px] font-medium text-accent transition-colors hover:bg-cream"
                >
                  Όλα τα προϊόντα
                </Link>
              </>
            ) : (
              <p className="px-4 py-6 text-center text-[15px] text-muted">
                Δεν βρέθηκαν προϊόντα για «{q}».
              </p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  )
}
