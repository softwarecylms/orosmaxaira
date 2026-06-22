import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { SHOP_PAGE } from '@/components/shop/shop-content'
import { ShopBrowser } from '@/components/shop/shop-browser'
import { RevealUp } from '@/components/home/reveal-up'

export const metadata: Metadata = {
  title: 'Προϊόντα',
  description: 'Όλα τα προϊόντα Όρος Μαχαιρά — αγνό μέλι, προϊόντα μέλισσας, φυσικά καλλυντικά και πακέτα δώρων.',
}

/** Shop / products listing (Figma 209:4095). Header + footer come from the
 *  shared layout; the filterable, infinite-scrolling grid is <ShopBrowser>. */
export default function ShopPage() {
  return (
    <>
      {/* Breadcrumb + heading */}
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

        <RevealUp className="mt-4 flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold leading-[1.1] text-foreground md:text-[41px] md:leading-[44px]">
            {SHOP_PAGE.title}
          </h1>
          <p className="max-w-[640px] text-[17px] leading-[24px] text-muted">{SHOP_PAGE.subtitle}</p>
        </RevealUp>
      </div>

      <ShopBrowser />
    </>
  )
}
