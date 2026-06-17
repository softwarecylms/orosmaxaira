import * as React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[transform,background-color,color,box-shadow] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background will-change-transform active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-foreground text-background hover:bg-foreground/90 shadow-[0_10px_30px_-12px_rgba(20,20,20,0.45)]',
        secondary:
          'bg-card text-foreground border border-border-strong/40 hover:bg-card/80',
        ghost: 'text-foreground hover:bg-foreground/5',
        outline:
          'border border-foreground/15 text-foreground hover:bg-foreground/5',
        light:
          'bg-card text-foreground border border-border hover:border-border-strong',
        accent:
          'bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_10px_30px_-12px_rgba(198,58,214,0.45)]',
      },
      size: {
        sm: 'h-9 px-4 text-[13px]',
        md: 'h-11 px-5',
        lg: 'h-12 px-6 text-[15px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    withIcon?: boolean
  }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, withIcon = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {withIcon ? (
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
        ) : null}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

type LinkButtonProps = Omit<React.ComponentProps<typeof Link>, 'className'> &
  VariantProps<typeof buttonVariants> & {
    className?: string
    withIcon?: boolean
  }

export function LinkButton({
  className,
  variant,
  size,
  withIcon = false,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
      {withIcon ? <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" /> : null}
    </Link>
  )
}

export { buttonVariants }
