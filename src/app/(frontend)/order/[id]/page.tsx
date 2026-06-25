import type { Metadata } from 'next'
import { OrderConfirmation } from '@/components/shop/checkout/order-confirmation'
import { CheckoutSteps } from '@/components/shop/checkout-steps'

export const metadata: Metadata = { title: 'Η παραγγελία σας' }

type Params = { params: Promise<{ id: string }> }

export default async function OrderPage({ params }: Params) {
  const { id } = await params
  return (
    <>
      <CheckoutSteps active={3} note="Σας ευχαριστούμε! Η παραγγελία σας καταχωρήθηκε." />
      <OrderConfirmation id={id} />
    </>
  )
}
