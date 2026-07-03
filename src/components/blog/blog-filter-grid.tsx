'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays } from 'lucide-react'
import { RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'
import type { BlogPost } from './blog-data'
import type { BlogCategory } from './blog-categories'

/** Blog index grid with category filter chips on top. Filtering is client-side;
 *  the grid re-keys on the active category so the stagger replays each switch. */
export function BlogFilterGrid({
  posts,
  categories,
  postCategories,
}: {
  posts: BlogPost[]
  categories: BlogCategory[]
  postCategories: Record<string, string[]>
}) {
  const [active, setActive] = useState<string>('all')

  const chips = [{ slug: 'all', name: 'Όλα', count: posts.length }, ...categories]
  const filtered =
    active === 'all' ? posts : posts.filter((p) => postCategories[p.slug]?.includes(active))

  const nameBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.name]))
  const labelOf = (slug: string) => nameBySlug[postCategories[slug]?.[0]]

  return (
    <div className="flex flex-col gap-9">
      {/* Filter chips */}
      <div className="flex flex-wrap justify-center gap-2.5">
        {chips.map((c) => {
          const on = active === c.slug
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActive(c.slug)}
              aria-pressed={on}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium transition-colors',
                on
                  ? 'bg-accent text-white'
                  : 'bg-white text-foreground ring-1 ring-border hover:bg-offwhite hover:text-accent',
              )}
            >
              {c.name}
              <span
                className={cn(
                  'rounded-full px-1.5 text-[12px] leading-5',
                  on ? 'bg-white/20 text-white' : 'bg-offwhite text-muted',
                )}
              >
                {c.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <RevealStagger
        key={active}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.05}
      >
        {filtered.map((p) => (
          <RevealStaggerItem key={p.slug} hoverLift className="flex">
            <Link
              href={`/blog/${p.slug}`}
              className="group flex w-full flex-col overflow-hidden rounded-[16px] bg-white shadow-card ring-1 ring-border/50 transition-shadow hover:shadow-card-lg"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-offwhite">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.05]"
                  />
                ) : null}
                {labelOf(p.slug) ? (
                  <span className="absolute left-3 top-3 z-10 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[13px] font-medium text-white backdrop-blur">
                    {labelOf(p.slug)}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <span className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-muted">
                  <CalendarDays className="size-3.5 text-accent" aria-hidden="true" />
                  {p.dateText}
                </span>
                <h2 className="line-clamp-2 text-[18px] font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
                  {p.title}
                </h2>
                {p.excerpt ? (
                  <p className="line-clamp-2 text-[14px] leading-[1.5] text-muted">{p.excerpt}</p>
                ) : null}
                <span className="mt-auto pt-2 text-[14px] font-medium text-accent">
                  Διαβάστε περισσότερα →
                </span>
              </div>
            </Link>
          </RevealStaggerItem>
        ))}
      </RevealStagger>
    </div>
  )
}
