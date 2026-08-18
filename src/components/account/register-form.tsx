'use client'

import { useActionState } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { registerCustomer, type FormState } from '@/lib/medusa/customer-actions'
import { Field, SubmitButton, FormError } from './ui'
import { getAccountUi } from './account-ui'

export function RegisterForm() {
  const t = getAccountUi(useLocale())
  const [state, action] = useActionState<FormState, FormData>(registerCustomer, {})
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.firstName} name="first_name" required autoComplete="given-name" />
        <Field label={t.lastName} name="last_name" autoComplete="family-name" />
      </div>
      <Field label={t.email} name="email" type="email" required autoComplete="email" />
      <Field
        label={t.password}
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder={t.passwordHint}
      />
      <SubmitButton className="mt-1 w-full">{t.registerSubmit}</SubmitButton>
      <p className="text-center text-[14px] text-muted">
        {t.haveAccount}{' '}
        <Link href="/account/login" className="font-medium text-accent hover:underline">
          {t.loginLink}
        </Link>
      </p>
    </form>
  )
}
