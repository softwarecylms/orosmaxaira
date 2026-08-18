import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { getCustomer } from '@/lib/medusa/customer'
import { AddressManager } from '@/components/account/address-manager'
import { getAccountUi } from '@/components/account/account-ui'
import { hreflangAlternates } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: getAccountUi(locale).addressesTitle,
    alternates: hreflangAlternates(locale, '/account/addresses'),
  }
}
export const dynamic = 'force-dynamic'

export default async function AccountAddressesPage() {
  const locale = await getLocale()
  const t = getAccountUi(locale)
  const customer = await getCustomer()
  if (!customer) return redirect({ href: '/account/login', locale })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-[18px] font-semibold text-foreground">{t.addressesTitle}</h2>
        <p className="text-[14px] text-muted">
          {t.addressesSubtitle}
        </p>
      </div>
      <AddressManager addresses={customer.addresses ?? []} />
    </div>
  )
}
