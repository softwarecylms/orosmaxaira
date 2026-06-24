import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/shop/checkout/checkout-form'

export const metadata: Metadata = { title: 'Ταμείο' }

export default function CheckoutPage() {
  return <CheckoutForm />
}
