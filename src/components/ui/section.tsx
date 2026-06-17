import * as React from 'react'
import { cn } from '@/lib/utils'

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  tone?: 'default' | 'dark' | 'pink' | 'plain'
  spacing?: 'default' | 'sm' | 'lg' | 'none'
}

const toneClass: Record<NonNullable<SectionProps['tone']>, string> = {
  default: '',
  plain: 'bg-background',
  dark: 'bg-surface-dark text-surface-dark-foreground',
  pink: 'bg-accent-soft',
}

const spacingClass: Record<NonNullable<SectionProps['spacing']>, string> = {
  default: 'py-16 md:py-24',
  sm: 'py-10 md:py-16',
  lg: 'py-20 md:py-32',
  none: '',
}

export function Section({
  className,
  tone = 'default',
  spacing = 'default',
  children,
  ...rest
}: SectionProps) {
  return (
    <section className={cn(toneClass[tone], spacingClass[spacing], className)} {...rest}>
      {children}
    </section>
  )
}

export function Container({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('container-page', className)} {...rest}>
      {children}
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  heading,
  subheading,
  align = 'center',
  invert = false,
  className,
}: {
  eyebrow?: string | null
  heading?: string | null
  subheading?: string | null
  align?: 'center' | 'left'
  invert?: boolean
  className?: string
}) {
  if (!eyebrow && !heading && !subheading) return null
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            'eyebrow',
            invert && 'bg-white/10 text-surface-dark-foreground',
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      {heading ? (
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl">
          {heading}
        </h2>
      ) : null}
      {subheading ? (
        <p
          className={cn(
            'text-base md:text-lg max-w-2xl',
            invert ? 'text-white/70' : 'text-muted',
          )}
        >
          {subheading}
        </p>
      ) : null}
    </div>
  )
}
