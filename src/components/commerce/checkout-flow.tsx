'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import type { HttpTypes } from '@medusajs/types'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/medusa/prices'
import {
  initiatePayment,
  placeOrder,
  setCheckoutAddress,
  setShippingMethod,
  type CheckoutAddress,
} from '@/lib/medusa/actions'
import { cn } from '@/lib/utils'

type Country = {
  iso_2?: string | null
  display_name?: string | null
  name?: string | null
}

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-border-strong focus:ring-2 focus:ring-foreground/10'

function StepHeader({
  index,
  title,
  done,
}: {
  index: number
  title: string
  done?: boolean
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className={cn(
          'grid size-7 place-items-center rounded-full text-xs font-semibold',
          done
            ? 'bg-foreground text-background'
            : 'border border-border text-muted',
        )}
      >
        {done ? <Check className="size-4" /> : index}
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  )
}

export function CheckoutFlow({
  cart,
  shippingOptions,
  countries,
}: {
  cart: HttpTypes.StoreCart
  shippingOptions: HttpTypes.StoreCartShippingOption[]
  countries: Country[]
}) {
  const router = useRouter()
  const addr = cart.shipping_address
  const currency = cart.currency_code ?? cart.region?.currency_code ?? 'eur'

  const hasAddress = Boolean(cart.email && addr?.address_1)
  const selectedShippingId = cart.shipping_methods?.[0]?.shipping_option_id
  const hasShipping = (cart.shipping_methods?.length ?? 0) > 0

  const [editAddress, setEditAddress] = useState(!hasAddress)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CheckoutAddress>({
    email: cart.email ?? '',
    first_name: addr?.first_name ?? '',
    last_name: addr?.last_name ?? '',
    address_1: addr?.address_1 ?? '',
    address_2: addr?.address_2 ?? '',
    company: addr?.company ?? '',
    postal_code: addr?.postal_code ?? '',
    city: addr?.city ?? '',
    province: addr?.province ?? '',
    country_code: addr?.country_code ?? countries[0]?.iso_2 ?? '',
    phone: addr?.phone ?? '',
  })

  const set = (k: keyof CheckoutAddress) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  function submitAddress(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      setError(null)
      try {
        await setCheckoutAddress(form)
        setEditAddress(false)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save address.')
      }
    })
  }

  function chooseShipping(optionId: string) {
    startTransition(async () => {
      setError(null)
      try {
        await setShippingMethod(optionId)
        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Could not set shipping.',
        )
      }
    })
  }

  function submitOrder() {
    startTransition(async () => {
      setError(null)
      try {
        await initiatePayment()
        await placeOrder() // redirects to /order/[id] on success
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Could not place the order.',
        )
      }
    })
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Step 1 — Contact + address */}
      <section>
        <StepHeader index={1} title="Contact & shipping address" done={hasAddress && !editAddress} />
        {editAddress ? (
          <form onSubmit={submitAddress} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className={cn(inputClass, 'sm:col-span-2')} type="email" required placeholder="Email" value={form.email} onChange={set('email')} />
            <input className={inputClass} required placeholder="First name" value={form.first_name} onChange={set('first_name')} />
            <input className={inputClass} required placeholder="Last name" value={form.last_name} onChange={set('last_name')} />
            <input className={cn(inputClass, 'sm:col-span-2')} required placeholder="Address" value={form.address_1} onChange={set('address_1')} />
            <input className={cn(inputClass, 'sm:col-span-2')} placeholder="Apartment, suite (optional)" value={form.address_2} onChange={set('address_2')} />
            <input className={inputClass} required placeholder="City" value={form.city} onChange={set('city')} />
            <input className={inputClass} required placeholder="Postal code" value={form.postal_code} onChange={set('postal_code')} />
            <input className={inputClass} placeholder="Province / State (optional)" value={form.province} onChange={set('province')} />
            <select className={inputClass} required value={form.country_code} onChange={set('country_code')}>
              <option value="" disabled>Country</option>
              {countries.map((c) => (
                <option key={c.iso_2 ?? ''} value={c.iso_2 ?? ''}>
                  {c.display_name ?? c.name ?? c.iso_2}
                </option>
              ))}
            </select>
            <input className={cn(inputClass, 'sm:col-span-2')} placeholder="Phone (optional)" value={form.phone} onChange={set('phone')} />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : 'Save & continue'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 text-sm">
            <div>
              <p className="font-medium">{addr?.first_name} {addr?.last_name}</p>
              <p className="text-muted">{cart.email}</p>
              <p className="text-muted">
                {addr?.address_1}, {addr?.city} {addr?.postal_code},{' '}
                {addr?.country_code?.toUpperCase()}
              </p>
            </div>
            <button type="button" className="text-sm underline" onClick={() => setEditAddress(true)}>
              Edit
            </button>
          </div>
        )}
      </section>

      {/* Step 2 — Delivery */}
      <section className={cn(!hasAddress && 'pointer-events-none opacity-40')}>
        <StepHeader index={2} title="Delivery" done={hasShipping} />
        <div className="flex flex-col gap-2">
          {shippingOptions.length === 0 ? (
            <p className="text-sm text-muted">
              No delivery options are available for this address. Try a
              different country, or refresh the page.
            </p>
          ) : (
            shippingOptions.map((option) => {
              const active = selectedShippingId === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => chooseShipping(option.id)}
                  disabled={pending}
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                    active
                      ? 'border-foreground bg-foreground/5'
                      : 'border-border hover:border-border-strong',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        'grid size-4 place-items-center rounded-full border',
                        active ? 'border-foreground' : 'border-border',
                      )}
                    >
                      {active ? <span className="size-2 rounded-full bg-foreground" /> : null}
                    </span>
                    {option.name}
                  </span>
                  <span className="font-medium">
                    {formatPrice(option.amount ?? 0, currency)}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </section>

      {/* Step 3 — Payment + place order */}
      <section className={cn(!hasShipping && 'pointer-events-none opacity-40')}>
        <StepHeader index={3} title="Payment" done={false} />
        <p className="mb-4 text-sm text-muted">
          This demo store uses Medusa&rsquo;s default test payment provider — no
          real card is charged.
        </p>
        <Button type="button" size="lg" onClick={submitOrder} disabled={pending || !hasShipping}>
          {pending ? (
            <><Loader2 className="size-4 animate-spin" /> Placing order…</>
          ) : (
            `Place order · ${formatPrice(cart.total ?? 0, currency)}`
          )}
        </Button>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
