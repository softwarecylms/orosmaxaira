import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/shop/checkout/checkout-form'
import { CheckoutSteps } from '@/components/shop/checkout-steps'

export const metadata: Metadata = { title: 'Ταμείο' }

export default function CheckoutPage() {
  return (
    <>
      <CheckoutSteps active={2} />
      <CheckoutForm />
    </>
  )
}
