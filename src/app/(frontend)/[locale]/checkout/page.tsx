import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { CheckoutForm } from '@/components/shop/checkout/checkout-form'
import { getCheckoutUi } from '@/components/shop/checkout/checkout-ui'
import { CheckoutSteps } from '@/components/shop/checkout-steps'
import { NOINDEX, hreflangAlternates } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: getCheckoutUi(locale).checkoutTitle,
    alternates: hreflangAlternates(locale, '/checkout'),
    robots: NOINDEX,
  }
}

export default function CheckoutPage() {
  return (
    <>
      <CheckoutSteps active={2} />
      <CheckoutForm />
    </>
  )
}
