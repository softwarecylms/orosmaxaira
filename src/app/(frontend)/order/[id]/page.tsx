import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import type { HttpTypes } from '@medusajs/types'
import { Section, Container } from '@/components/ui/section'
import { LinkButton } from '@/components/ui/button'
import { sdk } from '@/lib/medusa/client'
import { formatPrice } from '@/lib/medusa/prices'

export const metadata: Metadata = { title: 'Order confirmed' }
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export default async function OrderPage({ params }: Params) {
  const { id } = await params

  let order: HttpTypes.StoreOrder | null = null
  try {
    const res = await sdk.client.fetch<{ order: HttpTypes.StoreOrder }>(
      `/store/orders/${id}`,
      {
        method: 'GET',
        query: {
          fields:
            '*items,*items.variant,+items.total,*shipping_address,+total,+subtotal,+shipping_total,+tax_total',
        },
        cache: 'no-store',
      },
    )
    order = res.order
  } catch {
    order = null
  }

  const currency = order?.currency_code ?? 'eur'

  return (
    <Section spacing="lg">
      <Container className="flex max-w-2xl flex-col gap-8">
        <div className="flex flex-col items-start gap-4">
          <CheckCircle2 className="size-12 text-accent" />
          <h1 className="text-3xl font-bold tracking-tight">
            Thank you for your order
          </h1>
          <p className="text-muted">
            Your order{' '}
            <span className="font-medium text-foreground">
              #{order?.display_id ?? id}
            </span>{' '}
            has been placed and confirmed. A confirmation email is on its way.
          </p>
        </div>

        {order ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="divide-y divide-border">
              {(order.items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 py-3 text-sm"
                >
                  <span>
                    {item.quantity}× {item.product_title ?? item.title}
                  </span>
                  <span className="text-muted">
                    {formatPrice(item.total ?? 0, currency)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total ?? 0, currency)}</span>
            </div>
            {order.shipping_address ? (
              <p className="text-sm text-muted">
                Shipping to {order.shipping_address.first_name}{' '}
                {order.shipping_address.last_name},{' '}
                {order.shipping_address.address_1},{' '}
                {order.shipping_address.city}{' '}
                {order.shipping_address.postal_code}
              </p>
            ) : null}
          </div>
        ) : null}

        <LinkButton href="/shop">Continue shopping</LinkButton>
      </Container>
    </Section>
  )
}
