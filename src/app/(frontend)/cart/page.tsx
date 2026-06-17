import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container } from '@/components/ui/section'
import { LinkButton } from '@/components/ui/button'
import { CartLineItem } from '@/components/commerce/cart-line-item'
import { CartTotals } from '@/components/commerce/cart-totals'
import { retrieveCart } from '@/lib/medusa/actions'

export const metadata: Metadata = { title: 'Cart' }

// The cart depends on per-request cookies, so never statically render it.
export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const cart = await retrieveCart()
  const items = cart?.items ?? []
  const currency = cart?.currency_code ?? cart?.region?.currency_code ?? 'eur'

  if (!cart || items.length === 0) {
    return (
      <Section spacing="lg">
        <Container className="flex flex-col items-start gap-6">
          <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
          <p className="text-muted">Your cart is empty.</p>
          <LinkButton href="/shop">Continue shopping</LinkButton>
        </Container>
      </Section>
    )
  }

  return (
    <Section spacing="lg">
      <Container className="flex flex-col gap-10">
        <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-border border-y border-border">
            {items
              .sort((a, b) =>
                (a.created_at ?? '') > (b.created_at ?? '') ? 1 : -1,
              )
              .map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  currencyCode={currency}
                />
              ))}
          </div>

          <aside className="flex h-fit flex-col gap-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <CartTotals cart={cart} />
            <LinkButton href="/checkout" size="lg" className="w-full">
              Checkout
            </LinkButton>
            <Link
              href="/shop"
              className="text-center text-sm text-muted hover:text-foreground"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </Container>
    </Section>
  )
}
