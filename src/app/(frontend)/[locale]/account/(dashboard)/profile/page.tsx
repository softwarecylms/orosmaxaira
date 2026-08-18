import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { getCustomer } from '@/lib/medusa/customer'
import { ProfileForm } from '@/components/account/profile-form'
import { getAccountUi } from '@/components/account/account-ui'
import { hreflangAlternates } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: getAccountUi(locale).profileTitle,
    alternates: hreflangAlternates(locale, '/account/profile'),
  }
}
export const dynamic = 'force-dynamic'

export default async function AccountProfilePage() {
  const locale = await getLocale()
  const t = getAccountUi(locale)
  const customer = await getCustomer()
  if (!customer) return redirect({ href: '/account/login', locale })

  return (
    <div className="flex flex-col gap-5 rounded-[8px] border border-border bg-white p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[18px] font-semibold text-foreground">{t.profileTitle}</h2>
        <p className="text-[14px] text-muted">{t.profileSubtitle}</p>
      </div>
      <ProfileForm customer={customer} />
    </div>
  )
}
