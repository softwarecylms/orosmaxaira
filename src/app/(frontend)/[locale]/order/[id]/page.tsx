import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { OrderConfirmation } from '@/components/shop/checkout/order-confirmation'
import { getCheckoutUi } from '@/components/shop/checkout/checkout-ui'
import { CheckoutSteps } from '@/components/shop/checkout-steps'
import { hreflangAlternates } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: getCheckoutUi(locale).orderTitle,
    alternates: hreflangAlternates(locale, '/order'),
  }
}

type Params = { params: Promise<{ id: string }> }

export default async function OrderPage({ params }: Params) {
  const { id } = await params
  const t = getCheckoutUi(await getLocale())
  return (
    <>
      <CheckoutSteps active={3} note={t.orderNote} />
      <OrderConfirmation id={id} />
    </>
  )
}
