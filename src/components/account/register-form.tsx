'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { registerCustomer, type FormState } from '@/lib/medusa/customer-actions'
import { Field, SubmitButton, FormError } from './ui'

export function RegisterForm() {
  const [state, action] = useActionState<FormState, FormData>(registerCustomer, {})
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Όνομα" name="first_name" required autoComplete="given-name" />
        <Field label="Επώνυμο" name="last_name" autoComplete="family-name" />
      </div>
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field
        label="Κωδικός"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="Τουλάχιστον 8 χαρακτήρες"
      />
      <SubmitButton className="mt-1 w-full">Δημιουργία λογαριασμού</SubmitButton>
      <p className="text-center text-[14px] text-muted">
        Έχετε ήδη λογαριασμό;{' '}
        <Link href="/account/login" className="font-medium text-accent hover:underline">
          Σύνδεση
        </Link>
      </p>
    </form>
  )
}
