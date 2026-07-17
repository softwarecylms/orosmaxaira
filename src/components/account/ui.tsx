'use client'

import { useFormStatus } from 'react-dom'
import { cn } from '@/lib/utils'

/** Labelled text input matching the site's form style. */
export function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  placeholder,
  autoComplete,
  className,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string
  placeholder?: string
  autoComplete?: string
  className?: string
}) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[14px] font-medium text-foreground">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-[4px] border border-border bg-white px-4 py-3 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
      />
    </label>
  )
}

/** Submit button that reflects the form's pending state. */
export function SubmitButton({
  children,
  className,
  variant = 'accent',
}: {
  children: React.ReactNode
  className?: string
  variant?: 'accent' | 'outline'
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'inline-flex items-center justify-center rounded-[4px] px-6 py-3 text-[15px] font-semibold transition-colors disabled:opacity-60',
        variant === 'accent'
          ? 'bg-accent text-white hover:bg-foreground'
          : 'border border-border text-foreground hover:bg-offwhite',
        className,
      )}
    >
      {pending ? 'Παρακαλώ περιμένετε…' : children}
    </button>
  )
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-2.5 text-[14px] text-red-700">
      {message}
    </p>
  )
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="rounded-[4px] border border-accent/30 bg-accent-soft px-4 py-2.5 text-[14px] text-foreground">
      {message}
    </p>
  )
}
