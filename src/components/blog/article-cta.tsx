import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getBlogUi } from '@/components/blog/blog-ui'

/**
 * Shop CTA for article pages. Buying guides carry clear commercial intent but
 * previously offered no route to the shop, so this appears once mid-article and
 * again at the end (see `ArticleView`).
 */
export function ArticleCta({ locale }: { locale: string }) {
  const ui = getBlogUi(locale)

  return (
    <aside className="my-9 flex flex-col gap-4 rounded-[16px] bg-offwhite p-6 ring-1 ring-border/60 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="font-display text-[19px] font-bold leading-[1.25] text-foreground">
          {ui.shopCtaTitle}
        </p>
        <p className="text-[14.5px] leading-[1.6] text-muted">{ui.shopCtaBody}</p>
      </div>
      <Link
        href="/proionta"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[4px] bg-accent px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-foreground"
      >
        {ui.shopCtaLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </aside>
  )
}

/**
 * Split an article so a CTA can sit inside it: at the second `<h3>`, which is far
 * enough in to have earned the interruption. Short articles get no mid-point CTA.
 */
export function splitForCta(html: string): [string] | [string, string] {
  if (html.length < 4000) return [html]
  const headings = [...html.matchAll(/<h3[\s>]/g)]
  const at = headings[1]?.index
  if (at == null) return [html]
  return [html.slice(0, at), html.slice(at)]
}
