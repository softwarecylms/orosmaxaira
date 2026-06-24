'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart, formatCents, type CartItem } from '@/components/commerce/cart-store'

const FREE_SHIPPING_THRESHOLD = 7000 // €70,00
const FLAT_SHIPPING = 350 // €3,50

export type OrderSnapshot = {
  id: string
  date: string
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  contact: Contact
}

type Contact = {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  postal: string
  phone: string
  country: string
}

const EMPTY: Contact = {
  email: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  postal: '',
  phone: '',
  country: 'Κύπρος',
}

/** Checkout: contact + shipping address on the left, order summary on the right.
 *  No real payment — places a local order snapshot and redirects to confirmation. */
export function CheckoutForm() {
  const router = useRouter()
  const { items, subtotal, ready, clear } = useCart()
  const [c, setC] = useState<Contact>(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  if (!ready) return <div className="container-wide py-20" aria-hidden="true" />

  if (items.length === 0) {
    return (
      <div className="container-wide flex flex-col items-start gap-5 py-16 md:py-24">
        <h1 className="font-display text-[32px] font-bold text-foreground md:text-[41px]">Ταμείο</h1>
        <p className="text-[17px] text-muted">Το καλάθι σας είναι άδειο.</p>
        <Link
          href="/shop"
          className="inline-flex items-center rounded-[4px] bg-accent px-5 py-3 text-[17px] text-white transition-colors hover:bg-foreground"
        >
          Συνεχίστε τις αγορές
        </Link>
      </div>
    )
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING
  const total = subtotal + shipping
  const set = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setC((prev) => ({ ...prev, [k]: e.target.value }))

  function placeOrder(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const id = `OM-${Date.now().toString(36).toUpperCase()}`
    const snapshot: OrderSnapshot = {
      id,
      date: new Date().toISOString(),
      items,
      subtotal,
      shipping,
      total,
      contact: c,
    }
    try {
      localStorage.setItem(`oros_order_${id}`, JSON.stringify(snapshot))
    } catch {
      // ignore storage errors — confirmation page falls back gracefully
    }
    clear()
    router.push(`/order/${id}`)
  }

  return (
    <form onSubmit={placeOrder} className="container-wide grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-8">
        <h1 className="font-display text-[32px] font-bold text-foreground md:text-[41px]">Ταμείο</h1>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-[20px] font-semibold text-foreground">Στοιχεία επικοινωνίας</legend>
          <Field label="Email" type="email" value={c.email} onChange={set('email')} required />
          <Field label="Τηλέφωνο" type="tel" value={c.phone} onChange={set('phone')} required />
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-[20px] font-semibold text-foreground">Διεύθυνση αποστολής</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Όνομα" value={c.firstName} onChange={set('firstName')} required />
            <Field label="Επώνυμο" value={c.lastName} onChange={set('lastName')} required />
          </div>
          <Field label="Διεύθυνση" value={c.address} onChange={set('address')} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Πόλη" value={c.city} onChange={set('city')} required />
            <Field label="Ταχ. Κώδικας" value={c.postal} onChange={set('postal')} required />
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] text-muted">Χώρα</span>
            <select
              value={c.country}
              onChange={set('country')}
              className="rounded-[4px] border border-border bg-white px-4 py-3 text-[16px] text-foreground outline-none focus:border-accent"
            >
              <option>Κύπρος</option>
              <option>Ελλάδα</option>
            </select>
          </label>
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="flex h-fit flex-col gap-5 rounded-[4px] border border-border bg-white p-6">
        <h2 className="text-[20px] font-semibold text-foreground">Η παραγγελία σας</h2>

        <div className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-3 py-3">
              <span className="relative size-[52px] shrink-0 overflow-hidden rounded-[4px] bg-offwhite">
                <Image src={item.image} alt={item.title} fill sizes="52px" className="object-cover" />
                <span className="absolute -right-1.5 -top-1.5 flex size-[18px] items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-white">
                  {item.quantity}
                </span>
              </span>
              <div className="flex flex-1 flex-col">
                <span className="text-[14px] font-medium leading-[18px] text-foreground">{item.title}</span>
                {item.size ? <span className="text-[13px] text-muted">{item.size}</span> : null}
              </div>
              <span className="text-[14px] text-foreground">{formatCents(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4 text-[15px]">
          <Row label="Υποσύνολο" value={formatCents(subtotal)} />
          <Row label="Μεταφορικά" value={shipping === 0 ? 'Δωρεάν' : formatCents(shipping)} />
        </div>
        <div className="flex justify-between border-t border-border pt-4 text-[18px] font-semibold text-foreground">
          <span>Σύνολο</span>
          <span>{formatCents(total)}</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center rounded-[4px] bg-accent p-[15px] text-[17px] text-white transition-colors hover:bg-foreground disabled:opacity-75"
        >
          {submitting ? 'Επεξεργασία…' : `Ολοκλήρωση παραγγελίας · ${formatCents(total)}`}
        </button>
        <p className="text-center text-[13px] leading-[18px] text-muted">
          Δοκιμαστική παραγγελία — δεν πραγματοποιείται χρέωση.
        </p>
      </aside>
    </form>
  )
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] text-muted">{label}</span>
      <input
        {...props}
        className="rounded-[4px] border border-border bg-white px-4 py-3 text-[16px] text-foreground outline-none transition-colors focus:border-accent"
      />
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-foreground">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  )
}
