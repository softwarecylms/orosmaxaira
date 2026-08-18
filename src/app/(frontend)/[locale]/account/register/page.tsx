import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { getCustomer } from '@/lib/medusa/customer'
import { RegisterForm } from '@/components/account/register-form'
import { getAccountUi } from '@/components/account/account-ui'
import { hreflangAlternates } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: getAccountUi(locale).registerTitle,
    alternates: hreflangAlternates(locale, '/account/register'),
  }
}
export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const locale = await getLocale()
  const t = getAccountUi(locale)
  if (await getCustomer()) redirect({ href: '/account', locale })
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mx-auto flex w-full max-w-[460px] flex-col gap-6">
        <div className="text-center">
          <h1 className="font-display text-[30px] font-bold leading-tight text-foreground md:text-[36px]">
            {t.registerTitle}
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            {t.registerSubtitle}
          </p>
        </div>
        <div className="rounded-[8px] border border-border bg-white p-6 shadow-card md:p-8">
          <RegisterForm />
        </div>
      </div>
    </section>
  )
}
