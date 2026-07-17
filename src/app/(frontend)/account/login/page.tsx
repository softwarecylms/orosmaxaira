import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCustomer } from '@/lib/medusa/customer'
import { LoginForm } from '@/components/account/login-form'

export const metadata: Metadata = { title: 'Σύνδεση' }
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  if (await getCustomer()) redirect('/account')
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-6">
        <div className="text-center">
          <h1 className="font-display text-[30px] font-bold leading-tight text-foreground md:text-[36px]">
            Σύνδεση
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">Συνδεθείτε στον λογαριασμό σας</p>
        </div>
        <div className="rounded-[8px] border border-border bg-white p-6 shadow-card md:p-8">
          <LoginForm />
        </div>
      </div>
    </section>
  )
}
