import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Package, User } from 'lucide-react'
import { getCustomer, getCustomerOrders } from '@/lib/medusa/customer'
import { formatPrice } from '@/lib/medusa/prices'

export const metadata: Metadata = { title: 'Ο λογαριασμός μου' }
export const dynamic = 'force-dynamic'

const ORDER_STATUS: Record<string, string> = {
  pending: 'Σε εκκρεμότητα',
  completed: 'Ολοκληρωμένη',
  archived: 'Αρχειοθετημένη',
  canceled: 'Ακυρωμένη',
  requires_action: 'Απαιτεί ενέργεια',
}

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
  const [customer, orders] = await Promise.all([getCustomer(), getCustomerOrders()])
  const latest = orders[0]
  const addressCount = customer?.addresses?.length ?? 0
  const primary = customer?.addresses?.[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
        <Card title="Τα στοιχεία μου" icon={User} href="/account/profile" cta="Επεξεργασία στοιχείων">
          <p className="text-foreground">
            {[customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || '—'}
          </p>
          <p className="break-words">{customer?.email}</p>
          {customer?.phone ? <p>{customer.phone}</p> : null}
        </Card>

        <Card title="Παραγγελίες" icon={Package} href="/account/orders" cta="Όλες οι παραγγελίες">
          {latest ? (
            <>
              <p className="text-foreground">
                Παραγγελία #{latest.display_id} ·{' '}
                {ORDER_STATUS[latest.status] ?? latest.status}
              </p>
              <p>
                {new Date(latest.created_at).toLocaleDateString('el-GR')} ·{' '}
                {formatPrice(latest.total ?? 0, latest.currency_code ?? 'eur', 'el-GR')}
              </p>
            </>
          ) : (
            <p>Δεν έχετε ακόμη παραγγελίες.</p>
          )}
        </Card>

        <Card
          title="Διευθύνσεις"
          icon={MapPin}
          href="/account/addresses"
          cta={addressCount ? 'Διαχείριση διευθύνσεων' : 'Προσθήκη διεύθυνσης'}
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
              {addressCount > 1 ? <p>+ {addressCount - 1} ακόμη</p> : null}
            </>
          ) : (
            <p>Δεν έχετε αποθηκευμένες διευθύνσεις.</p>
          )}
        </Card>

        <Card title="Συνέχεια αγορών" icon={Package} href="/shop" cta="Στο κατάστημα">
          <p>Ανακαλύψτε το αγνό μας μέλι, τα προϊόντα της κυψέλης και τα φυσικά καλλυντικά.</p>
        </Card>
      </div>
    </div>
  )
}
