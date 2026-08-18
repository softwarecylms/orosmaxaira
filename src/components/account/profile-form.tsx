'use client'

import { useActionState } from 'react'
import { useLocale } from 'next-intl'
import { updateProfile, type FormState } from '@/lib/medusa/customer-actions'
import { Field, SubmitButton, FormError, FormSuccess } from './ui'
import { getAccountUi } from './account-ui'
import type { Customer } from '@/lib/medusa/customer'

export function ProfileForm({ customer }: { customer: Customer }) {
  const t = getAccountUi(useLocale())
  const [state, action] = useActionState<FormState, FormData>(updateProfile, {})
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      {state.ok ? <FormSuccess message={t.profileSaved} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t.firstName}
          name="first_name"
          defaultValue={customer.first_name ?? ''}
          autoComplete="given-name"
        />
        <Field
          label={t.lastName}
          name="last_name"
          defaultValue={customer.last_name ?? ''}
          autoComplete="family-name"
        />
      </div>

      <Field
        label={t.phone}
        name="phone"
        type="tel"
        defaultValue={customer.phone ?? ''}
        autoComplete="tel"
      />

      <label className="flex flex-col gap-1.5">
        <span className="text-[14px] font-medium text-foreground">{t.email}</span>
        <input
          value={customer.email}
          disabled
          className="w-full rounded-[4px] border border-border bg-offwhite px-4 py-3 text-[15px] text-muted"
        />
        <span className="text-[13px] text-muted">{t.emailImmutable}</span>
      </label>

      <SubmitButton className="mt-1 self-start">{t.save}</SubmitButton>
    </form>
  )
}
