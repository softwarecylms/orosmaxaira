import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCustomer } from '@/lib/medusa/customer'
import { AddressManager } from '@/components/account/address-manager'

export const metadata: Metadata = { title: 'Οι διευθύνσεις μου' }
export const dynamic = 'force-dynamic'

export default async function AccountAddressesPage() {
  const customer = await getCustomer()
  if (!customer) redirect('/account/login')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-[18px] font-semibold text-foreground">Οι διευθύνσεις μου</h2>
        <p className="text-[14px] text-muted">
          Αποθηκευμένες διευθύνσεις για ταχύτερη ολοκλήρωση παραγγελίας.
        </p>
      </div>
      <AddressManager addresses={customer.addresses ?? []} />
    </div>
  )
}
