import { priceParts } from '@/lib/utils'

/**
 * A product price, with the regular price struck through before it when the
 * price is a discount (`compareAt` — a Medusa sale price, see lib/medusa/shop.ts).
 * `price` may be a range, shown as «Από €4,50» like `displayPrice`; `prefix`
 * overrides that lead-in. Renders inline, inside the caller's price element.
 */
export function SalePrice({
  price,
  compareAt,
  locale,
  prefix,
}: {
  price: string
  compareAt?: string
  locale: string
  prefix?: string
}) {
  const parts = priceParts(price, locale)
  const lead = prefix ?? parts.prefix
  const amount = prefix ? price : parts.amount
  if (!compareAt) return <>{lead ? `${lead} ${amount}` : amount}</>
  const en = locale === 'en'
  return (
    <>
      {lead ? `${lead} ` : null}
      <del className="mr-1.5 text-[0.8em] font-normal text-muted">
        <span className="sr-only">{en ? 'Original price: ' : 'Αρχική τιμή: '}</span>
        {compareAt}
      </del>
      <ins className="no-underline">
        <span className="sr-only">{en ? 'Sale price: ' : 'Τιμή έκπτωσης: '}</span>
        {amount}
      </ins>
    </>
  )
}
