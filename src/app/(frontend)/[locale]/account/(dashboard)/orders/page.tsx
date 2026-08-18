import type { Metadata } from 'next'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { Package } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getCustomerOrders } from '@/lib/medusa/customer'
import { formatPrice } from '@/lib/medusa/prices'
import { getAccountUi, accountIntlLocale, ORDER_STATUS_CLASS } from '@/components/account/account-ui'
import { hreflangAlternates } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: getAccountUi(locale).ordersTitle,
    alternates: hreflangAlternates(locale, '/account/orders'),
  }
}
export const dynamic = 'force-dynamic'

export default async function AccountOrdersPage() {
  const locale = await getLocale()
  const t = getAccountUi(locale)
  const intlLocale = accountIntlLocale(locale)
  const orders = await getCustomerOrders()

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[8px] border border-border bg-white px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Package className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-semibold text-foreground">{t.noOrdersTitle}</h2>
          <p className="text-[15px] text-muted">
            {t.noOrdersHint}
          </p>
        </div>
        <Link
          href="/proionta"
          className="mt-1 inline-flex items-center justify-center rounded-[4px] bg-accent px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-foreground"
        >
          {t.toShop}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => {
        const statusLabel = t.orderStatus[order.status] ?? order.status
        const statusClass = ORDER_STATUS_CLASS[order.status] ?? 'bg-offwhite text-muted'
        return (
          <article
            key={order.id}
            className="flex flex-col gap-4 rounded-[8px] border border-border bg-white p-5 md:p-6"
          >
            {/* Header: number/date + status + total */}
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <h2 className="text-[16px] font-semibold text-foreground">
                  {t.orderNumber(order.display_id)}
                </h2>
                <p className="text-[14px] text-muted">
                  {new Date(order.created_at).toLocaleDateString(intlLocale, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${statusClass}`}
                >
                  {statusLabel}
                </span>
                <span className="whitespace-nowrap text-[16px] font-semibold text-foreground">
                  {formatPrice(order.total ?? 0, order.currency_code ?? 'eur', intlLocale)}
                </span>
              </div>
            </div>

            {/* Items */}
            {order.items?.length ? (
              <ul className="flex flex-col gap-3 border-t border-border pt-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-[4px] bg-offwhite">
                      {item.thumbnail ? (
                        <Image src={item.thumbnail} alt={item.title} fill sizes="48px" className="object-cover" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 text-[14px] text-foreground">{item.title}</span>
                    <span className="shrink-0 whitespace-nowrap text-[14px] text-muted">
                      × {item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
