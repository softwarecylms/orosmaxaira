import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { CartView } from '@/components/shop/cart/cart-view'
import { getCartViewUi } from '@/components/shop/cart/cart-ui'
import { CheckoutSteps } from '@/components/shop/checkout-steps'
import { hreflangAlternates } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: getCartViewUi(locale).cartTitle,
    alternates: hreflangAlternates(locale, '/cart'),
  }
}

export default function CartPage() {
  return (
    <>
      <CheckoutSteps active={1} />
      <CartView />
    </>
  )
}
