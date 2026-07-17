import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { getCustomerOrders } from '@/lib/medusa/customer'
import { formatPrice } from '@/lib/medusa/prices'

export const metadata: Metadata = { title: 'Οι παραγγελίες μου' }
export const dynamic = 'force-dynamic'

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Σε εκκρεμότητα', className: 'bg-accent/10 text-gold-strong' },
  completed: { label: 'Ολοκληρωμένη', className: 'bg-green-50 text-green-700' },
  archived: { label: 'Αρχειοθετημένη', className: 'bg-offwhite text-muted' },
  canceled: { label: 'Ακυρωμένη', className: 'bg-red-50 text-red-700' },
  requires_action: { label: 'Απαιτεί ενέργεια', className: 'bg-red-50 text-red-700' },
}

export default async function AccountOrdersPage() {
  const orders = await getCustomerOrders()

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[8px] border border-border bg-white px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Package className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-semibold text-foreground">Καμία παραγγελία ακόμη</h2>
          <p className="text-[15px] text-muted">
            Μόλις κάνετε την πρώτη σας παραγγελία, θα εμφανιστεί εδώ.
          </p>
        </div>
        <Link
          href="/shop"
          className="mt-1 inline-flex items-center justify-center rounded-[4px] bg-accent px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-foreground"
        >
          Στο κατάστημα
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => {
        const status = ORDER_STATUS[order.status] ?? {
          label: order.status,
          className: 'bg-offwhite text-muted',
        }
        return (
          <article
            key={order.id}
            className="flex flex-col gap-4 rounded-[8px] border border-border bg-white p-5 md:p-6"
          >
            {/* Header: number/date + status + total */}
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <h2 className="text-[16px] font-semibold text-foreground">
                  Παραγγελία #{order.display_id}
                </h2>
                <p className="text-[14px] text-muted">
                  {new Date(order.created_at).toLocaleDateString('el-GR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${status.className}`}
                >
                  {status.label}
                </span>
                <span className="whitespace-nowrap text-[16px] font-semibold text-foreground">
                  {formatPrice(order.total ?? 0, order.currency_code ?? 'eur', 'el-GR')}
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
