import type { Metadata } from 'next'
import { CartView } from '@/components/shop/cart/cart-view'
import { CheckoutSteps } from '@/components/shop/checkout-steps'

export const metadata: Metadata = { title: 'Καλάθι' }

export default function CartPage() {
  return (
    <>
      <CheckoutSteps active={1} />
      <CartView />
    </>
  )
}
