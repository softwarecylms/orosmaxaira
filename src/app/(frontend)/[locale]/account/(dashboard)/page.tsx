import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { ArrowRight, MapPin, Package, User } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getCustomer, getCustomerOrders } from '@/lib/medusa/customer'
import { formatPrice } from '@/lib/medusa/prices'
import { getAccountUi, accountIntlLocale } from '@/components/account/account-ui'
import { hreflangAlternates } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: getAccountUi(locale).myAccount,
    alternates: hreflangAlternates(locale, '/account'),
  }
}
export const dynamic = 'force-dynamic'

function Card({
  title,
  icon: Icon,
  href,
  cta,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  cta: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[8px] border border-border bg-white p-5 md:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Icon className="size-[18px]" />
        </span>
        <h2 className="text-[17px] font-semibold text-foreground">{title}</h2>
      </div>
      <div className="flex-1 text-[15px] leading-[1.6] text-muted">{children}</div>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent transition-colors hover:text-gold-strong"
      >
        {cta}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

export default async function AccountOverviewPage() {
  const locale = await getLocale()
  const t = getAccountUi(locale)
  const intlLocale = accountIntlLocale(locale)
  const [customer, orders] = await Promise.all([getCustomer(), getCustomerOrders()])
  const latest = orders[0]
  const addressCount = customer?.addresses?.length ?? 0
  const primary = customer?.addresses?.[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
        <Card title={t.overviewMyDetails} icon={User} href="/account/profile" cta={t.overviewEditDetails}>
          <p className="text-foreground">
            {[customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || '—'}
          </p>
          <p className="break-words">{customer?.email}</p>
          {customer?.phone ? <p>{customer.phone}</p> : null}
        </Card>

        <Card title={t.overviewOrders} icon={Package} href="/account/orders" cta={t.overviewAllOrders}>
          {latest ? (
            <>
              <p className="text-foreground">
                {t.orderNumber(latest.display_id)} ·{' '}
                {t.orderStatus[latest.status] ?? latest.status}
              </p>
              <p>
                {new Date(latest.created_at).toLocaleDateString(intlLocale)} ·{' '}
                {formatPrice(latest.total ?? 0, latest.currency_code ?? 'eur', intlLocale)}
              </p>
            </>
          ) : (
            <p>{t.overviewNoOrders}</p>
          )}
        </Card>

        <Card
          title={t.overviewAddresses}
          icon={MapPin}
          href="/account/addresses"
          cta={addressCount ? t.overviewManageAddresses : t.overviewAddAddress}
        >
          {primary ? (
            <>
              <p className="text-foreground">
                {[primary.first_name, primary.last_name].filter(Boolean).join(' ')}
              </p>
              <p>
                {primary.address_1}
                {primary.city ? `, ${primary.city}` : ''}
                {primary.postal_code ? ` ${primary.postal_code}` : ''}
              </p>
              {addressCount > 1 ? <p>{t.moreCount(addressCount - 1)}</p> : null}
            </>
          ) : (
            <p>{t.overviewNoAddresses}</p>
          )}
        </Card>

        <Card title={t.overviewContinueShopping} icon={Package} href="/proionta" cta={t.toShop}>
          <p>{t.overviewContinueBlurb}</p>
        </Card>
      </div>
    </div>
  )
}
