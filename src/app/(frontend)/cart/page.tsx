import type { Metadata } from 'next'
import { CartView } from '@/components/shop/cart/cart-view'

export const metadata: Metadata = { title: 'Καλάθι' }

export default function CartPage() {
  return <CartView />
}
