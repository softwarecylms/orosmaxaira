import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { getCustomer } from '@/lib/medusa/customer'
import { AccountShell } from '@/components/account/account-shell'

export const dynamic = 'force-dynamic'

export default async function AccountDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customer = await getCustomer()
  if (!customer) return redirect({ href: '/account/login', locale: await getLocale() })
  return <AccountShell customer={customer}>{children}</AccountShell>
}
