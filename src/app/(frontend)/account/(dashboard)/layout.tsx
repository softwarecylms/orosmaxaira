import { redirect } from 'next/navigation'
import { getCustomer } from '@/lib/medusa/customer'
import { AccountShell } from '@/components/account/account-shell'

export const dynamic = 'force-dynamic'

export default async function AccountDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customer = await getCustomer()
  if (!customer) redirect('/account/login')
  return <AccountShell customer={customer}>{children}</AccountShell>
}
