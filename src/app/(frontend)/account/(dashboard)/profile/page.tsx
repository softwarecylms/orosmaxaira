import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCustomer } from '@/lib/medusa/customer'
import { ProfileForm } from '@/components/account/profile-form'

export const metadata: Metadata = { title: 'Τα στοιχεία μου' }
export const dynamic = 'force-dynamic'

export default async function AccountProfilePage() {
  const customer = await getCustomer()
  if (!customer) redirect('/account/login')

  return (
    <div className="flex flex-col gap-5 rounded-[8px] border border-border bg-white p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[18px] font-semibold text-foreground">Τα στοιχεία μου</h2>
        <p className="text-[14px] text-muted">Ενημερώστε το όνομα και το τηλέφωνό σας.</p>
      </div>
      <ProfileForm customer={customer} />
    </div>
  )
}
