import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Section, Container } from '@/components/ui/section'
import { CheckoutFlow } from '@/components/commerce/checkout-flow'
import { CartTotals } from '@/components/commerce/cart-totals'
import { listShippingOptions, retrieveCart } from '@/lib/medusa/actions'

export const metadata: Metadata = { title: 'Checkout' }
export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const cart = await retrieveCart()
  if (!cart || (cart.items?.length ?? 0) === 0) redirect('/cart')

  const shippingOptions = await listShippingOptions()
  const countries = cart.region?.countries ?? []

  return (
    <Section spacing="lg">
      <Container className="flex flex-col gap-10">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <CheckoutFlow
            cart={cart}
            shippingOptions={shippingOptions}
            countries={countries}
          />

          <aside className="flex h-fit flex-col gap-5 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <div className="flex flex-col gap-3 text-sm">
              {(cart.items ?? []).map((item) => (
                <div key={item.id} className="flex justify-between gap-3">
                  <span className="text-muted">
                    {item.quantity}× {item.product_title ?? item.title}
                  </span>
                </div>
              ))}
            </div>
            <CartTotals cart={cart} />
          </aside>
        </div>
      </Container>
    </Section>
  )
}
