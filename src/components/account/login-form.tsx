'use client'

import { useActionState } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { loginCustomer, type FormState } from '@/lib/medusa/customer-actions'
import { Field, SubmitButton, FormError } from './ui'
import { getAccountUi } from './account-ui'

export function LoginForm() {
  const t = getAccountUi(useLocale())
  const [state, action] = useActionState<FormState, FormData>(loginCustomer, {})
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <Field label={t.email} name="email" type="email" required autoComplete="email" />
      <Field
        label={t.password}
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />
      <SubmitButton className="mt-1 w-full">{t.loginSubmit}</SubmitButton>
      <p className="text-center text-[14px] text-muted">
        {t.noAccount}{' '}
        <Link href="/account/register" className="font-medium text-accent hover:underline">
          {t.registerLink}
        </Link>
      </p>
    </form>
  )
}
