'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '@/lib/utils'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(5, 'Phone number is required'),
  website: z.string().max(0).optional(),
})

type FormValues = z.infer<typeof schema>

type ContactFormProps = {
  submitLabel?: string
  consentText?: string | null
  className?: string
}

export function ContactForm({ submitLabel = 'Get a Quote Now', consentText, className }: ContactFormProps) {
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = async (values: FormValues) => {
    setStatus('submitting')
    setErrorMessage('')

    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      setErrorMessage(parsed.error.errors[0]?.message ?? 'Please check the form.')
      setStatus('error')
      return
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Something went wrong')
      setStatus('success')
      reset()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('flex flex-col gap-5', className)}
      noValidate
      data-testid="contact-form"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First Name" htmlFor="firstName" required error={errors.firstName?.message}>
          <input id="firstName" type="text" autoComplete="given-name" {...register('firstName')} className={inputClass(!!errors.firstName)} />
        </Field>
        <Field label="Last Name" htmlFor="lastName" required error={errors.lastName?.message}>
          <input id="lastName" type="text" autoComplete="family-name" {...register('lastName')} className={inputClass(!!errors.lastName)} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email Address" htmlFor="email" required error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" {...register('email')} className={inputClass(!!errors.email)} />
        </Field>
        <Field label="Phone Number" htmlFor="phone" required error={errors.phone?.message}>
          <input id="phone" type="tel" autoComplete="tel" {...register('phone')} className={inputClass(!!errors.phone)} />
        </Field>
      </div>

      <div className="hidden">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      {consentText ? (
        <p className="text-[14px] leading-[18px] text-[#434343]">{consentText}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="flex h-[51px] w-full items-center justify-center rounded-[25px] bg-foreground text-[14px] font-bold capitalize tracking-[0.3px] text-white shadow-[0_20px_60px_0_rgba(248,85,78,0.15)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : submitLabel}
      </button>

      {status === 'success' ? (
        <p className="text-sm text-emerald-600">Thanks! We&rsquo;ll be in touch within 2 working hours.</p>
      ) : null}
      {status === 'error' ? (
        <p className="text-sm text-red-500">{errorMessage || 'Something went wrong.'}</p>
      ) : null}
    </form>
  )
}

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[15px] leading-[24.75px] text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-[#f56c6c]">*</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'h-[45px] w-full rounded-[25px] border-2 border-transparent bg-[#f9f9fb] px-4 text-[15px] text-foreground',
    'focus:border-peach/60 focus:bg-white focus:outline-none transition-colors',
    hasError && 'border-red-400/60',
  )
}
