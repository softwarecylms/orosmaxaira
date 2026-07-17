import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCustomer } from '@/lib/medusa/customer'
import { RegisterForm } from '@/components/account/register-form'

export const metadata: Metadata = { title: 'Εγγραφή' }
export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  if (await getCustomer()) redirect('/account')
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mx-auto flex w-full max-w-[460px] flex-col gap-6">
        <div className="text-center">
          <h1 className="font-display text-[30px] font-bold leading-tight text-foreground md:text-[36px]">
            Δημιουργία λογαριασμού
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Παρακολουθήστε τις παραγγελίες σας και αποθηκεύστε τις διευθύνσεις σας
          </p>
        </div>
        <div className="rounded-[8px] border border-border bg-white p-6 shadow-card md:p-8">
          <RegisterForm />
        </div>
      </div>
    </section>
  )
}
