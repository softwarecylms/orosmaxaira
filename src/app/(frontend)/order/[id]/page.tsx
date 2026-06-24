import type { Metadata } from 'next'
import { OrderConfirmation } from '@/components/shop/checkout/order-confirmation'

export const metadata: Metadata = { title: 'Η παραγγελία σας' }

type Params = { params: Promise<{ id: string }> }

export default async function OrderPage({ params }: Params) {
  const { id } = await params
  return <OrderConfirmation id={id} />
}
