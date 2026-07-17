'use client'

import { useActionState, useState } from 'react'
import { MapPin, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  addAddress,
  updateAddress,
  deleteAddress,
  type FormState,
} from '@/lib/medusa/customer-actions'
import { Field, SubmitButton, FormError } from './ui'
import type { CustomerAddress } from '@/lib/medusa/customer'

const COUNTRIES = [
  { code: 'cy', label: 'Κύπρος' },
  { code: 'gr', label: 'Ελλάδα' },
]

function AddressFields({ address }: { address?: CustomerAddress }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Όνομα" name="first_name" required defaultValue={address?.first_name ?? ''} />
        <Field label="Επώνυμο" name="last_name" defaultValue={address?.last_name ?? ''} />
      </div>
      <Field label="Διεύθυνση" name="address_1" required defaultValue={address?.address_1 ?? ''} />
      <Field
        label="Διεύθυνση (2η γραμμή)"
        name="address_2"
        defaultValue={address?.address_2 ?? ''}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Πόλη" name="city" required defaultValue={address?.city ?? ''} />
        <Field
          label="Ταχ. κώδικας"
          name="postal_code"
          required
          defaultValue={address?.postal_code ?? ''}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[14px] font-medium text-foreground">Χώρα</span>
          <select
            name="country_code"
            defaultValue={address?.country_code ?? 'cy'}
            className="w-full rounded-[4px] border border-border bg-white px-4 py-3 text-[15px] text-foreground outline-none transition-colors focus:border-accent"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <Field label="Τηλέφωνο" name="phone" type="tel" defaultValue={address?.phone ?? ''} />
      </div>
    </>
  )
}

function AddForm({ onDone }: { onDone: () => void }) {
  const [state, action] = useActionState<FormState, FormData>(async (prev, fd) => {
    const res = await addAddress(prev, fd)
    if (res.ok) onDone()
    return res
  }, {})
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <AddressFields />
      <div className="mt-1 flex flex-wrap gap-3">
        <SubmitButton>Αποθήκευση</SubmitButton>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center justify-center rounded-[4px] border border-border px-6 py-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-offwhite"
        >
          Ακύρωση
        </button>
      </div>
    </form>
  )
}

function EditForm({ address, onDone }: { address: CustomerAddress; onDone: () => void }) {
  const [state, action] = useActionState<FormState, FormData>(async (prev, fd) => {
    const res = await updateAddress(prev, fd)
    if (res.ok) onDone()
    return res
  }, {})
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="address_id" value={address.id} />
      <FormError message={state.error} />
      <AddressFields address={address} />
      <div className="mt-1 flex flex-wrap gap-3">
        <SubmitButton>Ενημέρωση</SubmitButton>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center justify-center rounded-[4px] border border-border px-6 py-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-offwhite"
        >
          Ακύρωση
        </button>
      </div>
    </form>
  )
}

/** Saved addresses: list of cards with edit/delete, plus an add form. */
export function AddressManager({ addresses }: { addresses: CustomerAddress[] }) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 && !adding ? (
        <div className="flex flex-col items-center gap-4 rounded-[8px] border border-border bg-white px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <MapPin className="size-6" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-semibold text-foreground">Καμία διεύθυνση</h2>
            <p className="text-[15px] text-muted">
              Αποθηκεύστε μια διεύθυνση για ταχύτερη ολοκλήρωση παραγγελίας.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-1 inline-flex items-center gap-2 rounded-[4px] bg-accent px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-foreground"
          >
            <Plus className="size-4" aria-hidden="true" />
            Προσθήκη διεύθυνσης
          </button>
        </div>
      ) : null}

      {addresses.map((address) =>
        editingId === address.id ? (
          <div key={address.id} className="rounded-[8px] border border-border bg-white p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-foreground">Επεξεργασία διεύθυνσης</h3>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                aria-label="Κλείσιμο"
                className="text-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <EditForm address={address} onDone={() => setEditingId(null)} />
          </div>
        ) : (
          <div
            key={address.id}
            className="flex flex-col gap-3 rounded-[8px] border border-border bg-white p-5 sm:flex-row sm:items-start sm:justify-between md:p-6"
          >
            <div className="flex min-w-0 gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <MapPin className="size-[18px]" aria-hidden="true" />
              </span>
              <div className="min-w-0 text-[15px] leading-[1.6]">
                <p className="font-medium text-foreground">
                  {[address.first_name, address.last_name].filter(Boolean).join(' ')}
                </p>
                <p className="text-muted">
                  {address.address_1}
                  {address.address_2 ? `, ${address.address_2}` : ''}
                </p>
                <p className="text-muted">
                  {[address.postal_code, address.city].filter(Boolean).join(' ')}
                  {address.country_code ? `, ${address.country_code.toUpperCase()}` : ''}
                </p>
                {address.phone ? <p className="text-muted">{address.phone}</p> : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingId(address.id)}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-border px-3 py-2 text-[14px] font-medium text-foreground transition-colors hover:bg-offwhite"
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                Επεξεργασία
              </button>
              <form action={deleteAddress}>
                <input type="hidden" name="address_id" value={address.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-[4px] border border-border px-3 py-2 text-[14px] font-medium text-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Διαγραφή
                </button>
              </form>
            </div>
          </div>
        ),
      )}

      {adding ? (
        <div className="rounded-[8px] border border-border bg-white p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-foreground">Νέα διεύθυνση</h3>
            <button
              type="button"
              onClick={() => setAdding(false)}
              aria-label="Κλείσιμο"
              className="text-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <AddForm onDone={() => setAdding(false)} />
        </div>
      ) : addresses.length ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-border px-6 py-4 text-[15px] font-semibold text-foreground transition-colors hover:border-accent hover:text-accent sm:w-auto sm:self-start"
        >
          <Plus className="size-4" aria-hidden="true" />
          Προσθήκη διεύθυνσης
        </button>
      ) : null}
    </div>
  )
}
