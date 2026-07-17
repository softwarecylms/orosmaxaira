'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { loginCustomer, type FormState } from '@/lib/medusa/customer-actions'
import { Field, SubmitButton, FormError } from './ui'

export function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(loginCustomer, {})
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field
        label="Κωδικός"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />
      <SubmitButton className="mt-1 w-full">Σύνδεση</SubmitButton>
      <p className="text-center text-[14px] text-muted">
        Δεν έχετε λογαριασμό;{' '}
        <Link href="/account/register" className="font-medium text-accent hover:underline">
          Εγγραφή
        </Link>
      </p>
    </form>
  )
}
